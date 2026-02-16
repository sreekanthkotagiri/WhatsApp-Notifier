import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false, // Allow extra properties
      forbidNonWhitelisted: false,
    }),
  );

  // Preserve raw request body for webhook logging
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(
    express.json({
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf && buf.toString();
      },
    }),
  );

  await app.listen(3000);
}

bootstrap();