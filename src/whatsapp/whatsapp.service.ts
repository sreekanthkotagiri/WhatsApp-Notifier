import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { AxiosResponse } from 'axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendMessage(sendMessageDto: SendMessageDto): Promise<MessageResponseDto> {
    const { to, message } = sendMessageDto;

    if (!this.isValidE164Phone(to)) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'INVALID_PHONE_NUMBER',
          message: 'Phone number must be in E.164 format (e.g., +1234567890)',
        },
      });
    }

    if (!message || message.trim().length === 0) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'EMPTY_MESSAGE',
          message: 'Message must not be empty',
        },
      });
    }

    try {
      const response = await this.callWhatsAppAPI(to, message);

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
      type: 'text',
      text: {
        body: message,
      },
    };
    const headers = {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };

    this.logger.log(`Sending WhatsApp message to ${to}`);

    const response = await firstValueFrom(
      this.httpService.post<any>(url, payload, { headers }),
    ) as AxiosResponse<any>;

    this.logger.log(`WhatsApp API response: ${JSON.stringify(response.data)}`);

    return response.data;
  }
}