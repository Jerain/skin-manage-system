import { Controller, Post, Body, Get, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('chat')
  async chat(
    @Body() body: { message: string; context?: any },
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('请先登录');
    }
    
    const token = authHeader.replace('Bearer ', '');
    // 简单解析 token 获取用户 ID（实际应该验证 token）
    let userId = 0;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub || payload.customer?.id || 0;
    } catch (e) {
      // 使用默认用户
    }
    
    const response = await this.aiAssistantService.chat(userId, body.message, body.context || {});
    return { success: true, data: response };
  }

  @Get('health')
  health() {
    return { status: 'ok', message: 'AI Assistant is running' };
  }
}
