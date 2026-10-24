import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { promises as fs } from 'fs';
import * as path from 'path';

const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';

/**
 * API Key 只从环境变量读取 —— 禁止在源码里写兜底值。
 * 密钥一旦进代码库等于白送（见 f001-comparison-spec.md §2.3）。
 */
const SILICONFLOW_API_KEY = (process.env.SILICONFLOW_API_KEY || '').trim();

/** 视觉理解模型：分析护理前后肤质差异 */
const VISION_MODEL = process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';
/** 图像生成模型：无可用照片时用文生图兜底 */
const IMAGE_MODEL = process.env.SILICONFLOW_IMAGE_MODEL || 'Qwen/Qwen-Image';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads');

/** 对比图输出规格（f001-comparison-spec.md §4.2） */
const COMPARE_WIDTH = parseInt(process.env.COMPARE_IMAGE_WIDTH || '1080', 10);
const COMPARE_HEIGHT = parseInt(process.env.COMPARE_IMAGE_HEIGHT || '1440', 10);
const COMPARE_QUALITY = parseInt(process.env.COMPARE_IMAGE_QUALITY || '85', 10);
/** 体积上限 300KB */
const COMPARE_MAX_BYTES = parseInt(process.env.COMPARE_IMAGE_MAX_KB || '300', 10) * 1024;

/** 文生图兜底必须打的水印（合规红线） */
const AI_WATERMARK_TEXT = process.env.AI_WATERMARK_TEXT || 'AI 示意图 · 非实拍';

/**
 * AI 对比图服务
 *
 * 流程：
 *  1. 技师上传护理前后照片 -> skin_records
 *  2. AI 分析两次照片的肤质差异 -> 改善亮点文案
 *  3. 生成对比图（优先用 sharp 真实拼接前后照片，无照片时回退文生图）
 *  4. 记录落库，等待推送给客户端
 */
@Injectable()
export class AiComparisonService {
  private readonly logger = new Logger(AiComparisonService.name);
  /** 最近一次外部调用失败原因，用于向前端透出可读错误 */
  lastError: string | null = null;

  private readonly http = axios.create({
    baseURL: SILICONFLOW_BASE_URL,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' },
  });

  /**
   * 校验 SiliconFlow 凭证是否配置
   * 未配置时直接抛错，由调用方降级处理（记录照常保存，不阻断技师流程）
   */
  private ensureApiKey(): void {
    if (!SILICONFLOW_API_KEY) {
      throw new Error(
        'SILICONFLOW_API_KEY 未配置：请在 server/.env 中设置该环境变量（不要把密钥写进源码）',
      );
    }
  }

  /**
   * 带 Authorization 头的请求（密钥只在运行时从环境变量注入）
   */
  private async postWithAuth(url: string, body: any, timeout = 120000): Promise<any> {
    this.ensureApiKey();
    const res = await this.http.post(url, body, {
      timeout,
      headers: { Authorization: `Bearer ${SILICONFLOW_API_KEY}` },
    });
    return res.data;
  }

  /**
   * 读取图片为 base64 data URL
   */
  private async imageToDataUrl(imageUrl: string): Promise<string | null> {
    try {
      if (!imageUrl) return null;
      if (imageUrl.startsWith('data:')) return imageUrl;

      const res = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: { 'User-Agent': 'skin-care-ai/1.0' },
      });
      const contentType = res.headers['content-type'] || 'image/jpeg';
      const base64 = Buffer.from(res.data).toString('base64');
      return `data:${contentType};base64,${base64}`;
    } catch (e: any) {
      this.logger.warn(`图片读取失败: ${imageUrl} - ${e.message}`);
      return null;
    }
  }

  /**
   * 把图片 URL（本地相对路径或远程地址）读成 Buffer
   */
  private async readImageBuffer(imageUrl: string): Promise<Buffer | null> {
    try {
      if (!imageUrl) return null;
      if (imageUrl.startsWith('data:')) {
        return Buffer.from(imageUrl.split(',')[1], 'base64');
      }
      // 本地静态资源
      if (imageUrl.startsWith('/static/')) {
        const rel = imageUrl.replace('/static/', '');
        const abs = path.join(path.resolve(process.cwd(), 'public'), rel);
        return await fs.readFile(abs);
      }
      if (imageUrl.startsWith('/')) {
        const abs = path.join(path.resolve(process.cwd(), 'public'), imageUrl);
        return await fs.readFile(abs);
      }
      const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
      return Buffer.from(res.data);
    } catch (e: any) {
      this.logger.warn(`图片读取失败: ${imageUrl} - ${e.message}`);
      return null;
    }
  }

  /**
   * 从模型输出中解析 JSON（宽松处理 Markdown 包裹）
   */
  private parseJson(content: string): any {
    if (!content) return null;
    const cleaned = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * 步骤2：AI 分析前后肤质差异，输出改善亮点文案
   */
  async analyzeDifference(
    beforeImageUrl?: string,
    afterImageUrl?: string,
    context?: {
      beforeSkinType?: string;
      afterSkinType?: string;
      beforeIssues?: string;
      afterIssues?: string;
    },
  ): Promise<{ improvementHighlights: string; analysis: any }> {
    const beforeData = beforeImageUrl ? await this.imageToDataUrl(beforeImageUrl) : null;
    const afterData = afterImageUrl ? await this.imageToDataUrl(afterImageUrl) : null;

    if (!beforeData && !afterData) {
      return {
        improvementHighlights: '本次护理记录已归档，暂无AI对比分析结果。',
        analysis: { available: false, reason: 'no_image' },
      };
    }

    const content: any[] = [
      {
        type: 'text',
        text: [
          '你是专业皮肤护理分析师。请对比这两张同一客户的护理前后皮肤照片，输出一段面向客户的改善说明。',
          '要求：',
          '1. 用中文，语气专业但亲切，不夸大效果，不做医疗承诺；',
          '2. 指出可观察到的改善（肤色均匀度、痘痘/色斑淡化、毛孔、细纹、泛红等）；',
          '3. 长度控制在 80-150 字；',
          '4. 只输出纯文本，不要 Markdown、不要 JSON、不要引号包裹。',
          context?.beforeSkinType ? `护理前肤质：${context.beforeSkinType}` : '',
          context?.beforeIssues ? `护理前问题记录：${context.beforeIssues}` : '',
          context?.afterSkinType ? `护理后肤质：${context.afterSkinType}` : '',
          context?.afterIssues ? `护理后问题记录：${context.afterIssues}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ];

    if (beforeData) {
      content.push({ type: 'image_url', image_url: { url: beforeData } });
      content.push({ type: 'text', text: '上面这张是护理前。' });
    }
    if (afterData) {
      content.push({ type: 'image_url', image_url: { url: afterData } });
      content.push({ type: 'text', text: '上面这张是护理后。' });
    }

    try {
      const res: any = await this.postWithAuth('/chat/completions', {
        model: VISION_MODEL,
        messages: [{ role: 'user', content }],
        temperature: 0.4,
        max_tokens: 500,
      });

      const text: string = res?.data?.choices?.[0]?.message?.content ?? '';
      const highlights =
        text.trim() || '本次护理已完成，肤质状态较护理前有所改善。';

      return {
        improvementHighlights: highlights,
        analysis: {
          available: true,
          model: VISION_MODEL,
          raw: highlights,
          analyzedAt: new Date().toISOString(),
        },
      };
    } catch (e: any) {
      const detail = e?.response?.data?.message || e.message;
      this.logger.error(`AI 分析失败: ${detail}`);
      this.lastError = detail;
      return {
        improvementHighlights: 'AI 分析暂时不可用，护理记录已正常保存。',
        analysis: { available: false, reason: detail },
      };
    }
  }

  /**
   * 单张照片 AI 分析（门店端「AI分析」按钮）
   */
  async analyzeSinglePhoto(imageUrl?: string): Promise<{
    skinType: string;
    skinIssues: string[];
    overallScore: number;
    summary: string;
    available: boolean;
  }> {
    const data = imageUrl ? await this.imageToDataUrl(imageUrl) : null;
    if (!data) {
      return {
        skinType: '',
        skinIssues: [],
        overallScore: 0,
        summary: '未获取到照片，无法分析',
        available: false,
      };
    }

    const prompt = [
      '你是专业皮肤护理分析师。请分析这张面部照片，输出 JSON：',
      '{"skinType":"干性|油性|混合性|敏感性","skinIssues":["痘痘","色斑","毛孔粗大","细纹","泛红","暗沉"],',
      '"overallScore":0-100 的整数,"summary":"50字以内的整体描述"}',
      '只返回 JSON，不要 Markdown 代码块。',
    ].join('\n');

    try {
      const res: any = await this.postWithAuth('/chat/completions', {
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: data } },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      const content: string = res?.data?.choices?.[0]?.message?.content ?? '';
      const parsed = this.parseJson(content);

      return {
        skinType: parsed?.skinType || '',
        skinIssues: Array.isArray(parsed?.skinIssues) ? parsed.skinIssues : [],
        overallScore: Number(parsed?.overallScore) || 0,
        summary: parsed?.summary || '',
        available: true,
      };
    } catch (e: any) {
      const detail = e?.response?.data?.message || e.message;
      this.logger.error(`肤质分析失败: ${detail}`);
      this.lastError = detail;
      return {
        skinType: '',
        skinIssues: [],
        overallScore: 0,
        summary: 'AI 分析暂时不可用，请手动填写',
        available: false,
      };
    }
  }

  /**
   * 步骤3：生成对比图
   *
   * 优先用 sharp 把真实的护理前后照片拼接成左右对比图（真实、可控、永久保存）；
   * 没有可用照片时，回退到 SiliconFlow 文生图。
   */
  async generateComparisonImage(
    beforeImageUrl?: string,
    afterImageUrl?: string,
    highlights?: string,
  ): Promise<string | null> {
    // 1) 真实照片拼接
    const composited = await this.composeComparison(beforeImageUrl, afterImageUrl);
    if (composited) return composited;

    // 2) 文生图兜底
    return this.generateByText(highlights);
  }

  /**
   * 使用 sharp 将前后照片拼成左右对比图，保存到 public/uploads
   *
   * 规格（f001-comparison-spec.md §4.2）：
   *   - 1080 × 1440（3:4 竖版），JPEG 质量 85，≤ 300KB
   *   - 真实照片像素级拼接，绝不用文生图改造人脸
   */
  private async composeComparison(
    beforeImageUrl?: string,
    afterImageUrl?: string,
  ): Promise<string | null> {
    const beforeBuf = beforeImageUrl ? await this.readImageBuffer(beforeImageUrl) : null;
    const afterBuf = afterImageUrl ? await this.readImageBuffer(afterImageUrl) : null;
    if (!beforeBuf && !afterBuf) return null;

    try {
      // 动态引入 sharp，避免未安装时整个服务启动失败
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');

      // 画布 1080×1440，左右各半（540×1440）
      const CANVAS_W = COMPARE_WIDTH;
      const CANVAS_H = COMPARE_HEIGHT;
      const PANEL_W = Math.floor(CANVAS_W / 2);
      const LABEL_HEIGHT = 72;
      const DIVIDER = 4;

      // position: attention —— 尽量保留人脸主体，避免固定裁切
      const resize = async (buf: Buffer) =>
        sharp(buf)
          .resize(PANEL_W, CANVAS_H, { fit: 'cover', position: 'attention' })
          .toBuffer();

      const beforeImg = beforeBuf ? await resize(beforeBuf) : null;
      const afterImg = afterBuf ? await resize(afterBuf) : null;

      const left = beforeImg || afterImg!;
      const right = afterImg || beforeImg!;

      const svgLeft = Buffer.from(
        `<svg width="${PANEL_W}" height="${LABEL_HEIGHT}"><rect width="100%" height="100%" fill="rgba(0,0,0,0.55)"/><text x="28" y="50" font-size="40" fill="#ffffff" font-family="sans-serif">护理前</text></svg>`,
      );
      const svgRight = Buffer.from(
        `<svg width="${PANEL_W}" height="${LABEL_HEIGHT}"><rect width="100%" height="100%" fill="rgba(0,0,0,0.55)"/><text x="28" y="50" font-size="40" fill="#ffffff" font-family="sans-serif">护理后</text></svg>`,
      );

      const leftPanel = await sharp(left)
        .composite([{ input: svgLeft, top: 0, left: 0 }])
        .toBuffer();
      const rightPanel = await sharp(right)
        .composite([{ input: svgRight, top: 0, left: 0 }])
        .toBuffer();

      const build = (quality: number) =>
        sharp({
          create: {
            width: CANVAS_W,
            height: CANVAS_H,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
          },
        })
          .composite([
            { input: leftPanel, top: 0, left: 0 },
            { input: rightPanel, top: 0, left: PANEL_W },
            {
              // 中缝分隔线
              input: Buffer.from(
                `<svg width="${DIVIDER}" height="${CANVAS_H}"><rect width="100%" height="100%" fill="#ffffff"/></svg>`,
              ),
              top: 0,
              left: PANEL_W - Math.floor(DIVIDER / 2),
            },
          ])
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();

      // 质量阶梯压缩，确保 ≤ 300KB
      const output = await this.fitUnderSizeLimit(build);

      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const filename = `comparison_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
      await fs.writeFile(path.join(UPLOAD_DIR, filename), output);

      this.logger.log(
        `对比图已生成: ${filename} ${(output.length / 1024).toFixed(1)}KB (上限 ${(COMPARE_MAX_BYTES / 1024).toFixed(0)}KB)`,
      );
      return `/static/uploads/${filename}`;
    } catch (e: any) {
      this.logger.error(`对比图拼接失败: ${e.message}`);
      return null;
    }
  }

  /**
   * 保证输出体积 ≤ 上限：依次降质量，仍超标则用最小质量的版本
   */
  private async fitUnderSizeLimit(
    build: (quality: number) => Promise<Buffer>,
  ): Promise<Buffer> {
    const qualities = [COMPARE_QUALITY, 80, 72, 65, 58, 50];
    let best: Buffer | null = null;

    for (const q of qualities) {
      const buf = await build(q);
      if (!best || buf.length < best.length) best = buf;
      if (buf.length <= COMPARE_MAX_BYTES) return buf;
    }

    this.logger.warn(
      `对比图体积 ${(best!.length / 1024).toFixed(1)}KB 仍超过上限 ${(COMPARE_MAX_BYTES / 1024).toFixed(0)}KB`,
    );
    return best!;
  }

  /**
   * 给图片打上「AI 示意图 · 非实拍」水印
   * 文生图兜底路径的合规硬要求（f001-comparison-spec.md §2.2）
   */
  private async applyWatermark(input: Buffer): Promise<Buffer> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');
      const meta = await sharp(input).metadata();
      const w = meta.width || 1024;
      const h = meta.height || 1024;

      const fontSize = Math.max(20, Math.round(w / 28));
      const boxH = Math.round(fontSize * 2.1);
      const boxW = Math.round(w * 0.62);
      const boxX = Math.round((w - boxW) / 2);
      const boxY = h - boxH - Math.round(h * 0.03);

      const svg = Buffer.from(
        `<svg width="${w}" height="${h}">` +
          `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="10" fill="rgba(0,0,0,0.62)"/>` +
          `<text x="${w / 2}" y="${boxY + boxH * 0.68}" font-size="${fontSize}" fill="#ffffff" ` +
          `font-family="sans-serif" text-anchor="middle">${AI_WATERMARK_TEXT}</text>` +
          `</svg>`,
      );

      return await sharp(input)
        .composite([{ input: svg, top: 0, left: 0 }])
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (e: any) {
      this.logger.error(`水印叠加失败: ${e.message}`);
      return input;
    }
  }

  /**
   * 文生图兜底
   */
  private async generateByText(highlights?: string): Promise<string | null> {
    const prompt = [
      '生成一张专业的皮肤护理前后对比图，横向构图，左右分屏：',
      '左侧为护理前的皮肤状态，右侧为护理后的皮肤状态。',
      '风格：高端美容机构宣传物料，柔和光线，浅色调背景，干净整洁。',
      '画面中不要出现文字、字母、水印或人脸五官。',
      highlights ? `画面氛围参考描述：${highlights.slice(0, 120)}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const res: any = await this.postWithAuth('/images/generations', {
        model: IMAGE_MODEL,
        prompt,
        image_size: '1024x576',
        num_inference_steps: 20,
      });

      const url: string | undefined = res?.data?.images?.[0]?.url;
      if (!url) return null;

      // 下载并转存到本地，避免第三方临时链接过期
      try {
        const buf = await this.readImageBuffer(url);
        if (buf) {
          // 合规红线：文生图兜底必须打「AI 示意图 · 非实拍」水印
          const watermarked = await this.applyWatermark(buf);
          await fs.mkdir(UPLOAD_DIR, { recursive: true });
          const filename = `comparison_ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
          await fs.writeFile(path.join(UPLOAD_DIR, filename), watermarked);
          return `/static/uploads/${filename}`;
        }
      } catch (e: any) {
        this.logger.warn(`生成图转存失败，返回原始链接: ${e.message}`);
      }

      // 转存失败时也不能裸奔返回第三方链接（无水印）——返回 null 走站内消息兜底
      this.logger.warn('文生图兜底转存失败，放弃返回未加水印的第三方链接');
      return null;
    } catch (e: any) {
      const detail = e?.response?.data?.message || e.message;
      this.logger.error(`对比图生成失败: ${detail}`);
      this.lastError = detail;
      return null;
    }
  }
}
