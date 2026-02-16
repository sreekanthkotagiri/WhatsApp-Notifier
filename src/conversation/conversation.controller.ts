import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  ConversationResponseDto,
  ConversationWithMessagesDto,
} from './dto/conversation.dto';

@Controller('conversations')
export class ConversationController {
  private readonly logger = new Logger(ConversationController.name);

  constructor(private readonly conversationService: ConversationService) {}

  /**
   * Create a new conversation
   * POST /conversations
   * Body: { tenantId, contactId }
   */
  @Post()
  async create(@Body() createConversationDto: CreateConversationDto): Promise<{
    success: boolean;
    data: ConversationResponseDto;
  }> {
    try {
      this.logger.log('Creating new conversation');
      const conversation =
        await this.conversationService.create(createConversationDto);
      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      this.logger.error(
        `Error creating conversation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get conversations by tenant
   * GET /conversations?tenantId=uuid
   */
  @Get()
  async findByTenantId(
    @Query('tenantId') tenantId?: string,
  ): Promise<{
    success: boolean;
    data: ConversationResponseDto[];
  }> {
    try {
      if (!tenantId || tenantId.trim().length === 0) {
        throw new BadRequestException('tenantId query parameter is required');
      }

      this.logger.log(`Fetching conversations for tenant: ${tenantId}`);
      const conversations =
        await this.conversationService.findByTenantId(tenantId);
      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching conversations: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get conversation with messages
   * GET /conversations/:id/messages?limit=50
   */
  @Get(':id/messages')
  async getConversationMessages(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<{
    success: boolean;
    data: ConversationWithMessagesDto;
  }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Conversation ID is required');
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;

      if (isNaN(limitNum) || limitNum <= 0) {
        throw new BadRequestException('Limit must be a positive number');
      }

      this.logger.log(
        `Fetching conversation messages: ${id}, limit: ${limitNum}`,
      );
      const conversationWithMessages =
        await this.conversationService.findWithMessages(id, limitNum);
      return {
        success: true,
        data: conversationWithMessages,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching conversation messages: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get conversation by ID
   * GET /conversations/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<{
    success: boolean;
    data: ConversationResponseDto;
  }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Conversation ID is required');
      }

      this.logger.log(`Fetching conversation: ${id}`);
      const conversation = await this.conversationService.findById(id);
      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching conversation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
