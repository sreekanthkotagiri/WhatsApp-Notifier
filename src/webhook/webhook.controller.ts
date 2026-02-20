import { Controller, Get, Post, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {

  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  @Post()
  receive(@Body() body: any, @Res() res: Response) {
    console.log('WEBHOOK HIT');
    // console.log(JSON.stringify(body, null, 2));

    // Immediately respond
    res.sendStatus(200);

    // Process async later (important in production)
    setImmediate(() => {
      // your processing logic here
    });
  }
}