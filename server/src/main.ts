import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');

  // 静态资源（上传的肤质照片、生成的对比图）
  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
  app.useStaticAssets(publicDir, { prefix: '/static/' });

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
