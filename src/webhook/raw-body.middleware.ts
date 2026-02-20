import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Do not consume the stream - let express middleware handle it
    // The rawBody is set by express.json() verify callback in main.ts
    next();
  }
}
