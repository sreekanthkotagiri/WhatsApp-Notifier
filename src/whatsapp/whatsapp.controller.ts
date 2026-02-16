import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsAppService: WhatsAppService) {}

  /**
   * POST /whatsapp/send
   * Send a text message via WhatsApp
   *
   * Request body:
   * {
   *   "to": "+1234567890",      // E.164 format (required)
   *   "message": "Hello world"   // Plain text (required)
   * }
   *
   * Success Response (200):
   * {
   *   "success": true,
   *   "message": "Message sent successfully",
   *   "messageId": "wamid_..."
   * }
   *
   * Error Responses:
   * 400: Invalid input (invalid phone number, empty message)
   * 500: WhatsApp API error
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<MessageResponseDto> {
    try {
      this.logger.log(`Received send message request for: ${sendMessageDto.to}`);

      const response = await this.whatsAppService.sendMessage(sendMessageDto);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error sending message: ${errorMessage}`, errorStack);

      // Handle BadRequestException (validation errors)
      if (error instanceof BadRequestException) {
        const errorResponse = error.getResponse();
        throw new BadRequestException(errorResponse);
      }

      // Handle other errors as 500 Internal Server Error
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'WHATSAPP_API_ERROR',
          message: 'Failed to send message via WhatsApp API',
        },
      });
    }
  }
}
