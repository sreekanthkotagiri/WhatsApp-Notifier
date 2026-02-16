import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto, MessageResponseDto } from './dto/message.dto';

@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly messageService: MessageService) {}

  /**
   * Send a message
   * POST /messages/send
   * Body: { tenantId, contactId, message, metadata }
   */
  @Post('send')
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<{
    success: boolean;
    data: MessageResponseDto;
    message: string;
  }> {
    try {
      this.logger.log('Sending new message');
      const message = await this.messageService.sendMessage(sendMessageDto);
      return {
        success: true,
        data: message,
        message: 'Message sent successfully and queued for delivery',
      };
    } catch (error) {
      this.logger.error(
        `Error sending message: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get message by ID
   * GET /messages/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<{
    success: boolean;
    data: MessageResponseDto;
  }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Message ID is required');
      }

      this.logger.log(`Fetching message: ${id}`);
      const message = await this.messageService.findById(id);
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching message: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
