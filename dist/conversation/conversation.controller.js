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
var ConversationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const conversation_service_1 = require("./conversation.service");
const conversation_dto_1 = require("./dto/conversation.dto");
let ConversationController = ConversationController_1 = class ConversationController {
    constructor(conversationService) {
        this.conversationService = conversationService;
        this.logger = new common_1.Logger(ConversationController_1.name);
    }
    /**
     * Create a new conversation
     * POST /conversations
     * Body: { tenantId, contactId }
     */
    async create(createConversationDto) {
        try {
            this.logger.log('Creating new conversation');
            const conversation = await this.conversationService.create(createConversationDto);
            return {
                success: true,
                data: conversation,
            };
        }
        catch (error) {
            this.logger.error(`Error creating conversation: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get conversations by tenant
     * GET /conversations?tenantId=uuid
     */
    async findByTenantId(tenantId) {
        try {
            if (!tenantId || tenantId.trim().length === 0) {
                throw new common_1.BadRequestException('tenantId query parameter is required');
            }
            this.logger.log(`Fetching conversations for tenant: ${tenantId}`);
            const conversations = await this.conversationService.findByTenantId(tenantId);
            return {
                success: true,
                data: conversations,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching conversations: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get conversation with messages
     * GET /conversations/:id/messages?limit=50
     */
    async getConversationMessages(id, limit) {
        try {
            if (!id || id.trim().length === 0) {
                throw new common_1.BadRequestException('Conversation ID is required');
            }
            const limitNum = limit ? parseInt(limit, 10) : 50;
            if (isNaN(limitNum) || limitNum <= 0) {
                throw new common_1.BadRequestException('Limit must be a positive number');
            }
            this.logger.log(`Fetching conversation messages: ${id}, limit: ${limitNum}`);
            const conversationWithMessages = await this.conversationService.findWithMessages(id, limitNum);
            return {
                success: true,
                data: conversationWithMessages,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching conversation messages: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get conversation by ID
     * GET /conversations/:id
     */
    async findById(id) {
        try {
            if (!id || id.trim().length === 0) {
                throw new common_1.BadRequestException('Conversation ID is required');
            }
            this.logger.log(`Fetching conversation: ${id}`);
            const conversation = await this.conversationService.findById(id);
            return {
                success: true,
                data: conversation,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching conversation: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "findByTenantId", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "findById", null);
ConversationController = ConversationController_1 = __decorate([
    (0, common_1.Controller)('conversations'),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationController);
exports.ConversationController = ConversationController;
