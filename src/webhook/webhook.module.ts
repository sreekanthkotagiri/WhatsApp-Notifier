import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { RawBodyMiddleware } from './raw-body.middleware';

@Module({
  controllers: [WebhookController],
})
export class WebhookModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply raw body middleware to capture the original payload for logging
    consumer.apply(RawBodyMiddleware).forRoutes({ path: 'webhook', method: RequestMethod.ALL });
  }
}
