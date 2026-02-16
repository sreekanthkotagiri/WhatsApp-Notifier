import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, WhatsApp Auto Notifier!1111';
  }
}