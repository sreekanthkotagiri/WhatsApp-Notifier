import { Injectable, BadRequestException, Logger, InternalServerErrorException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { AxiosResponse } from 'axios';
import { TemplateService } from '../template/template.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(TemplateService) private readonly templateService: TemplateService,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto): Promise<MessageResponseDto> {
    const { to, template_name, tenant_id } = sendMessageDto;

    if (!this.isValidE164Phone(to)) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'INVALID_PHONE_NUMBER',
          message: 'Phone number must be in E.164 format (e.g., +1234567890)',
        },
      });
    }

    if (!template_name || template_name.trim().length === 0) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'EMPTY_TEMPLATE_NAME',
          message: 'Template name must not be empty',
        },
      });
    }

    if (!tenant_id || tenant_id.trim().length === 0) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'EMPTY_TENANT_ID',
          message: 'Tenant ID must not be empty',
        },
      });
    }

    try {
      // Fetch template from database
      const template = await this.templateService.getByNameAndTenant(
        tenant_id,
        template_name,
      );

      const response = await this.callWhatsAppAPI(to, template_name);

      return {
        success: true,
        message: 'Message sent successfully',
        messageId: response.messages?.[0]?.id,
      };
    } catch (error: any) {
      this.logger.error(
        `WhatsApp API error: ${error.response?.data?.error?.message || error.message}`,
      );

      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'WHATSAPP_API_ERROR',
          message:
            error.response?.data?.error?.message ||
            'Failed to send WhatsApp message',
        },
      });
    }
  }

  private isValidE164Phone(phone: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  }

  private async callWhatsAppAPI(to: string, message: string) {
    const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace('+', ''), // WhatsApp API requires number without +
      type: "template",
      template: {
        name: "hello_world",
        language: {
            code: "en_US"
        }
    }
    };
    const headers = {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };

    this.logger.log(`Sending WhatsApp message : ${JSON.stringify(payload)}`);

    const response = await firstValueFrom(
      this.httpService.post<any>(url, payload, { headers }),
    ) as AxiosResponse<any>;

    this.logger.log(`WhatsApp API response: ${JSON.stringify(response.data)}`);

    return response.data;
  }
}