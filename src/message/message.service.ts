import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../database/entities/message.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { Contact } from '../database/entities/contact.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { SendMessageDto, MessageResponseDto } from './dto/message.dto';
import { ConversationService } from '../conversation/conversation.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private conversationService: ConversationService,
    private whatsAppService: WhatsAppService,
    private configService: ConfigService
  ) {}

  async sendMessage(
    sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    try {
      // Validate tenant exists
      const tenant = await this.tenantRepository.findOne({
        where: { id: sendMessageDto.tenantId },
      });

      if (!tenant) {
        throw new BadRequestException(
          `Tenant with ID ${sendMessageDto.tenantId} not found`,
        );
      }

      // Validate contact exists and belongs to tenant
      const contact = await this.contactRepository.findOne({
        where: {
          id: sendMessageDto.contactId,
          tenant_id: sendMessageDto.tenantId,
        },
      });

      if (!contact) {
        throw new BadRequestException(
          `Contact with ID ${sendMessageDto.contactId} not found for this tenant`,
        );
      }

      // Validate message content
      if (!sendMessageDto.message || sendMessageDto.message.trim().length === 0) {
        throw new BadRequestException('Message content is required');
      }

      // Find or create conversation
      let conversation = await this.conversationRepository.findOne({
        where: {
          tenant_id: sendMessageDto.tenantId,
          contact_id: sendMessageDto.contactId,
          channel: 'whatsapp',
        },
      });

      if (!conversation) {
        conversation = this.conversationRepository.create({
          tenant_id: sendMessageDto.tenantId,
          contact_id: sendMessageDto.contactId,
          channel: 'whatsapp',
          status: 'open',
        });
        conversation = await this.conversationRepository.save(conversation);
        this.logger.log(`Conversation created: ${conversation.id}`);
      }

      // Create message
      const message = this.messageRepository.create({
        tenant_id: sendMessageDto.tenantId,
        conversation_id: conversation.id,
        contact_id: sendMessageDto.contactId,
        channel: 'whatsapp',
        direction: 'outbound',
        type: sendMessageDto.type || 'text',
        content: sendMessageDto.message,
        metadata: sendMessageDto.metadata || null,
        status: 'queued',
      });

      const savedMessage = await this.messageRepository.save(message);
      this.logger.log(`Message created and queued: ${savedMessage.id}`);

      // Update conversation last message time
      await this.conversationService.updateLastMessage(conversation.id);

      // Invoke WhatsApp API to send the actual message
      try {
        this.logger.log(`Invoking WhatsApp API for message: ${savedMessage.id}`);
        
        const whatsappResponse = await this.whatsAppService.sendMessage({
          to: contact.phone,
          message: sendMessageDto.message,
        });

        // Update message status to 'sent' and store external message ID
        savedMessage.status = 'sent';
        savedMessage.sent_at = new Date();
        if (whatsappResponse.messageId) {
          savedMessage.metadata = {
            ...savedMessage.metadata,
            external_message_id: whatsappResponse.messageId,
          };
        }
        
        const updatedMessage = await this.messageRepository.save(savedMessage);
        this.logger.log(
          `Message sent via WhatsApp API: ${updatedMessage.id} (External ID: ${whatsappResponse.messageId})`,
        );
        
        return this.mapToResponseDto(updatedMessage);
      } catch (whatsappError) {
        // Log the WhatsApp API error but keep the message as queued for retry
        this.logger.warn(
          `WhatsApp API error for message ${savedMessage.id}: ${whatsappError instanceof Error ? whatsappError.message : String(whatsappError)}. Message remains queued.`,
        );
        
        // Return the queued message response
        // The message will remain in 'queued' status and can be retried later
        return this.mapToResponseDto(savedMessage);
      }
    } catch (error) {
      this.logger.error(
        `Error sending message: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async trackMessageStatus(
    messageId: string,
    status: 'sent' | 'delivered' | 'read' | 'failed',
    externalMessageId?: string,
  ): Promise<MessageResponseDto> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundException(
          `Message with ID ${messageId} not found`,
        );
      }

      message.status = status;

      if (externalMessageId) {
        message.external_message_id = externalMessageId;
      }

      switch (status) {
        case 'sent':
          message.sent_at = new Date();
          break;
        case 'delivered':
          message.delivered_at = new Date();
          break;
        case 'read':
          message.read_at = new Date();
          break;
        case 'failed':
          message.failed_at = new Date();
          break;
      }

      const updatedMessage = await this.messageRepository.save(message);
      this.logger.log(
        `Message status updated: ${messageId} -> ${status}`,
      );

      return this.mapToResponseDto(updatedMessage);
    } catch (error) {
      this.logger.error(
        `Error tracking message status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findMessagesInConversation(
    conversationId: string,
    limit: number = 50,
  ): Promise<MessageResponseDto[]> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${conversationId} not found`,
        );
      }

      const messages = await this.messageRepository.find({
        where: {
          conversation_id: conversationId,
        },
        order: {
          created_at: 'ASC',
        },
        take: limit,
      });

      return messages.map((msg) => this.mapToResponseDto(msg));
    } catch (error) {
      this.logger.error(
        `Error fetching messages: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<MessageResponseDto> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id },
      });

      if (!message) {
        throw new NotFoundException(
          `Message with ID ${id} not found`,
        );
      }

      return this.mapToResponseDto(message);
    } catch (error) {
      this.logger.error(
        `Error fetching message: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private mapToResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      tenant_id: message.tenant_id,
      conversation_id: message.conversation_id,
      contact_id: message.contact_id,
      channel: message.channel,
      direction: message.direction,
      type: message.type,
      content: message.content || undefined,
      metadata: message.metadata || undefined,
      external_message_id: message.external_message_id || undefined,
      status: message.status,
      sent_at: message.sent_at || undefined,
      delivered_at: message.delivered_at || undefined,
      read_at: message.read_at || undefined,
      failed_at: message.failed_at || undefined,
      created_at: message.created_at,
    };
  }
}
