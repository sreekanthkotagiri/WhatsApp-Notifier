import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function configureApp() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(
    express.json({
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf && buf.toString();
      },
    }),
  );

  return { app, expressApp };
}

// Local bootstrap (development / traditional server)
async function bootstrap() {
  const { app } = await configureApp();
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

// If running in AWS Lambda environment, export a handler. Otherwise start a normal server.
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;

if (!isLambda) {
  bootstrap();
}


// Vercel expects a default export of a function with signature (req, res)
let cachedVercelApp: any = null;
export default async function vercelHandler(req: any, res: any) {
  if (!cachedVercelApp) {
    const { expressApp } = await configureApp();
    cachedVercelApp = expressApp;
  }
  return cachedVercelApp(req, res);
}