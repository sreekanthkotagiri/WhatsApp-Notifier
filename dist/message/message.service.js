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
var MessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../database/entities/message.entity");
const conversation_entity_1 = require("../database/entities/conversation.entity");
const contact_entity_1 = require("../database/entities/contact.entity");
const tenant_entity_1 = require("../database/entities/tenant.entity");
const conversation_service_1 = require("../conversation/conversation.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const config_1 = require("@nestjs/config");
let MessageService = MessageService_1 = class MessageService {
    constructor(messageRepository, conversationRepository, contactRepository, tenantRepository, conversationService, whatsAppService, configService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.contactRepository = contactRepository;
        this.tenantRepository = tenantRepository;
        this.conversationService = conversationService;
        this.whatsAppService = whatsAppService;
        this.configService = configService;
        this.logger = new common_1.Logger(MessageService_1.name);
    }
    async sendMessage(sendMessageDto) {
        try {
            // Validate tenant exists
            const tenant = await this.tenantRepository.findOne({
                where: { id: sendMessageDto.tenantId },
            });
            if (!tenant) {
                throw new common_1.BadRequestException(`Tenant with ID ${sendMessageDto.tenantId} not found`);
            }
            // Validate contact exists and belongs to tenant
            const contact = await this.contactRepository.findOne({
                where: {
                    id: sendMessageDto.contactId,
                    tenant_id: sendMessageDto.tenantId,
                },
            });
            if (!contact) {
                throw new common_1.BadRequestException(`Contact with ID ${sendMessageDto.contactId} not found for this tenant`);
            }
            // Validate message content
            if (!sendMessageDto.message || sendMessageDto.message.trim().length === 0) {
                throw new common_1.BadRequestException('Message content is required');
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
                    savedMessage.metadata = Object.assign(Object.assign({}, savedMessage.metadata), { external_message_id: whatsappResponse.messageId });
                }
                const updatedMessage = await this.messageRepository.save(savedMessage);
                this.logger.log(`Message sent via WhatsApp API: ${updatedMessage.id} (External ID: ${whatsappResponse.messageId})`);
                return this.mapToResponseDto(updatedMessage);
            }
            catch (whatsappError) {
                // Log the WhatsApp API error but keep the message as queued for retry
                this.logger.warn(`WhatsApp API error for message ${savedMessage.id}: ${whatsappError instanceof Error ? whatsappError.message : String(whatsappError)}. Message remains queued.`);
                // Return the queued message response
                // The message will remain in 'queued' status and can be retried later
                return this.mapToResponseDto(savedMessage);
            }
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async trackMessageStatus(messageId, status, externalMessageId) {
        try {
            const message = await this.messageRepository.findOne({
                where: { id: messageId },
            });
            if (!message) {
                throw new common_1.NotFoundException(`Message with ID ${messageId} not found`);
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
            this.logger.log(`Message status updated: ${messageId} -> ${status}`);
            return this.mapToResponseDto(updatedMessage);
        }
        catch (error) {
            this.logger.error(`Error tracking message status: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findMessagesInConversation(conversationId, limit = 50) {
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
            return messages.map((msg) => this.mapToResponseDto(msg));
        }
        catch (error) {
            this.logger.error(`Error fetching messages: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const message = await this.messageRepository.findOne({
                where: { id },
            });
            if (!message) {
                throw new common_1.NotFoundException(`Message with ID ${id} not found`);
            }
            return this.mapToResponseDto(message);
        }
        catch (error) {
            this.logger.error(`Error fetching message: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    mapToResponseDto(message) {
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
MessageService = MessageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        conversation_service_1.ConversationService,
        whatsapp_service_1.WhatsAppService,
        config_1.ConfigService])
], MessageService);
exports.MessageService = MessageService;
