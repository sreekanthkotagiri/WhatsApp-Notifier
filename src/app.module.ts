import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook/webhook.module';
import { TenantModule } from './tenant/tenant.module';
import { ContactModule } from './contact/contact.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { TemplateModule } from './template/template.module';
import { AutomationController } from './automation.controller';
import { getDatabaseConfig } from './config/database.config';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['src/.env', '.env'],
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    TenantModule,
    ContactModule,
    ConversationModule,
    MessageModule,
    TemplateModule,
    WhatsAppModule,
    WebhookModule,
  ],
  controllers: [AppController, AutomationController],
  providers: [AppService],
})
export class AppModule {}
