import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { SkinRecordsService } from './skin-records.service';
import { AiComparisonService } from './ai-comparison.service';

const uploadDir = path.resolve(process.cwd(), 'public/uploads');

@Controller('skin-records')
export class SkinRecordsController {
  constructor(
    private readonly skinRecordsService: SkinRecordsService,
    private readonly aiComparisonService: AiComparisonService,
  ) {}

  /** 创建肤质记录 */
  @Post()
  create(@Body() data: any) {
    return this.skinRecordsService.create(data);
  }

  /** 获取客户肤质记录 */
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.skinRecordsService.findByCustomer(Number(customerId));
  }

  /**
   * 上传肤质照片（门店端）
   * 返回 { code: 0, data: { url, filename, size } }
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req: any, file: any, cb: any) => {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req: any, file: any, cb: any) => {
          const ext = path.extname(file.originalname) || '.jpg';
          cb(
            null,
            `skin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`,
          );
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: any) {
    if (!file) {
      return { code: 1, message: '未接收到文件' };
    }
    return {
      code: 0,
      data: {
        url: `/static/uploads/${file.filename}`,
        filename: file.filename,
        size: file.size,
      },
    };
  }

  /** AI 分析单张肤质照片（门店端「AI分析」按钮） */
  @Post('analyze')
  async analyze(@Body() body: { photoUrl: string }) {
    return this.aiComparisonService.analyzeSinglePhoto(body.photoUrl);
  }

  /** 兼容旧路径：生成对比图 */
  @Post('comparisons')
  createComparison(@Body() data: any) {
    return this.skinRecordsService.generateComparison(data);
  }

  /** 兼容旧路径：获取客户对比记录 */
  @Get('comparisons/:customerId')
  findComparisons(@Param('customerId') customerId: string) {
    return this.skinRecordsService.findComparisonsByCustomer(Number(customerId));
  }
}
