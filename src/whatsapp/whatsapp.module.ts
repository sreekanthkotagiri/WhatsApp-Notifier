import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppService } from './whatsapp.service';
import { TemplateModule } from '../template/template.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
    TemplateModule,
  ],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}