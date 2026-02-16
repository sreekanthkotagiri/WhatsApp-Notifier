import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    let data = '';
    req.setEncoding && req.setEncoding('utf8');
    req.on && req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on && req.on('end', () => {
      // attach rawBody for logging the exact payload
      (req as any).rawBody = data || undefined;
      next();
    });
  }
}
