import { Controller, Post, Body, Res, Logger, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('automation')
export class AutomationController {
  private readonly logger = new Logger(AutomationController.name);

  // POST /automation/delay
  @Post('delay')
  delay(@Body() body: any, @Res() res: Response) {
    const ms = Number(body?.delay ?? body?.ms ?? 0);

    if (!Number.isFinite(ms) || ms < 0) {
      this.logger.warn(`Invalid delay value: ${body?.delay ?? body?.ms}`);
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid delay value' });
    }

    this.logger.log(`Received delay request: ${ms}ms`);

    setTimeout(() => {
      this.logger.log(`Responding after ${ms}ms delay`);
      res.status(HttpStatus.OK).json({ delayed: ms });
    }, ms);
  }
}
