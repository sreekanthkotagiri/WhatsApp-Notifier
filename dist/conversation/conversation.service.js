"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConversationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("../database/entities/conversation.entity");
const message_entity_1 = require("../database/entities/message.entity");
const contact_entity_1 = require("../database/entities/contact.entity");
const tenant_entity_1 = require("../database/entities/tenant.entity");
let ConversationService = ConversationService_1 = class ConversationService {
    constructor(conversationRepository, messageRepository, contactRepository, tenantRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.contactRepository = contactRepository;
        this.tenantRepository = tenantRepository;
        this.logger = new common_1.Logger(ConversationService_1.name);
    }
    async create(createConversationDto) {
        try {
            // Validate tenant exists
            const tenant = await this.tenantRepository.findOne({
                where: { id: createConversationDto.tenantId },
            });
            if (!tenant) {
                throw new common_1.BadRequestException(`Tenant with ID ${createConversationDto.tenantId} not found`);
            }
            // Validate contact exists and belongs to tenant
            const contact = await this.contactRepository.findOne({
                where: {
                    id: createConversationDto.contactId,
                    tenant_id: createConversationDto.tenantId,
                },
            });
            if (!contact) {
                throw new common_1.BadRequestException(`Contact with ID ${createConversationDto.contactId} not found for this tenant`);
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
                this.logger.log(`Conversation already exists: ${existingConversation.id}`);
                return this.mapToResponseDto(existingConversation);
            }
            const conversation = this.conversationRepository.create({
                tenant_id: createConversationDto.tenantId,
                contact_id: createConversationDto.contactId,
                channel: createConversationDto.channel || 'whatsapp',
                status: 'open',
            });
            const savedConversation = await this.conversationRepository.save(conversation);
            this.logger.log(`Conversation created: ${savedConversation.id}`);
            return this.mapToResponseDto(savedConversation);
        }
        catch (error) {
            this.logger.error(`Error creating conversation: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findByTenantId(tenantId) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantRepository.findOne({
                where: { id: tenantId },
            });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
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
        }
        catch (error) {
            this.logger.error(`Error fetching conversations: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findWithMessages(conversationId, limit = 50) {
        try {
            const conversation = await this.conversationRepository.findOne({
                where: { id: conversationId },
            });
            if (!conversation) {
                throw new common_1.NotFoundException(`Conversation with ID ${conversationId} not found`);
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
            const conversationWithMessages = Object.assign(Object.assign({}, this.mapToResponseDto(conversation)), { messages: messages.map((msg) => this.mapMessageToResponseDto(msg)) });
            return conversationWithMessages;
        }
        catch (error) {
            this.logger.error(`Error fetching conversation messages: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const conversation = await this.conversationRepository.findOne({
                where: { id },
            });
            if (!conversation) {
                throw new common_1.NotFoundException(`Conversation with ID ${id} not found`);
            }
            return this.mapToResponseDto(conversation);
        }
        catch (error) {
            this.logger.error(`Error fetching conversation: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async updateLastMessage(conversationId) {
        try {
            await this.conversationRepository.update({ id: conversationId }, {
                last_message_at: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Error updating conversation last message: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    mapToResponseDto(conversation) {
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
    mapMessageToResponseDto(message) {
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
};
ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConversationService);
exports.ConversationService = ConversationService;
