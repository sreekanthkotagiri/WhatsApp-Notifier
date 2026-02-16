import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { Contact } from '../database/entities/contact.entity';
import { Tenant } from '../database/entities/tenant.entity';
import {
  CreateConversationDto,
  ConversationResponseDto,
  ConversationWithMessagesDto,
  MessageResponseDto,
} from './dto/conversation.dto';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    try {
      // Validate tenant exists
      const tenant = await this.tenantRepository.findOne({
        where: { id: createConversationDto.tenantId },
      });

      if (!tenant) {
        throw new BadRequestException(
          `Tenant with ID ${createConversationDto.tenantId} not found`,
        );
      }

      // Validate contact exists and belongs to tenant
      const contact = await this.contactRepository.findOne({
        where: {
          id: createConversationDto.contactId,
          tenant_id: createConversationDto.tenantId,
        },
      });

      if (!contact) {
        throw new BadRequestException(
          `Contact with ID ${createConversationDto.contactId} not found for this tenant`,
        );
      }

      // Check if conversation already exists
      const existingConversation = await this.conversationRepository.findOne({
        where: {
          tenant_id: createConversationDto.tenantId,
          contact_id: createConversationDto.contactId,
          channel: createConversationDto.channel || 'whatsapp',
        },
      });

      if (existingConversation) {
        this.logger.log(
          `Conversation already exists: ${existingConversation.id}`,
        );
        return this.mapToResponseDto(existingConversation);
      }

      const conversation = this.conversationRepository.create({
        tenant_id: createConversationDto.tenantId,
        contact_id: createConversationDto.contactId,
        channel: createConversationDto.channel || 'whatsapp',
        status: 'open',
      });

      const savedConversation =
        await this.conversationRepository.save(conversation);
      this.logger.log(`Conversation created: ${savedConversation.id}`);

      return this.mapToResponseDto(savedConversation);
    } catch (error) {
      this.logger.error(
        `Error creating conversation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findByTenantId(tenantId: string): Promise<ConversationResponseDto[]> {
    try {
      // Verify tenant exists
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
      }

      const conversations = await this.conversationRepository.find({
        where: {
          tenant_id: tenantId,
        },
        order: {
          last_message_at: 'DESC',
        },
      });

      return conversations.map((conv) => this.mapToResponseDto(conv));
    } catch (error) {
      this.logger.error(
        `Error fetching conversations: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findWithMessages(
    conversationId: string,
    limit: number = 50,
  ): Promise<ConversationWithMessagesDto> {
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

      const conversationWithMessages: ConversationWithMessagesDto = {
        ...this.mapToResponseDto(conversation),
        messages: messages.map((msg) => this.mapMessageToResponseDto(msg)),
      };

      return conversationWithMessages;
    } catch (error) {
      this.logger.error(
        `Error fetching conversation messages: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<ConversationResponseDto> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id },
      });

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${id} not found`,
        );
      }

      return this.mapToResponseDto(conversation);
    } catch (error) {
      this.logger.error(
        `Error fetching conversation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async updateLastMessage(
    conversationId: string,
  ): Promise<void> {
    try {
      await this.conversationRepository.update(
        { id: conversationId },
        {
          last_message_at: new Date(),
        },
      );
    } catch (error) {
      this.logger.error(
        `Error updating conversation last message: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private mapToResponseDto(
    conversation: Conversation,
  ): ConversationResponseDto {
    return {
      id: conversation.id,
      tenant_id: conversation.tenant_id,
      contact_id: conversation.contact_id,
      channel: conversation.channel,
      last_message_at: conversation.last_message_at || undefined,
      status: conversation.status,
      created_at: conversation.created_at,
    };
  }

  private mapMessageToResponseDto(message: Message): MessageResponseDto {
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
