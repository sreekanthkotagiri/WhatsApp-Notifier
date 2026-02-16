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
var MessageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
const message_dto_1 = require("./dto/message.dto");
let MessageController = MessageController_1 = class MessageController {
    constructor(messageService) {
        this.messageService = messageService;
        this.logger = new common_1.Logger(MessageController_1.name);
    }
    /**
     * Send a message
     * POST /messages/send
     * Body: { tenantId, contactId, message, metadata }
     */
    async sendMessage(sendMessageDto) {
        try {
            this.logger.log('Sending new message');
            const message = await this.messageService.sendMessage(sendMessageDto);
            return {
                success: true,
                data: message,
                message: 'Message sent successfully and queued for delivery',
            };
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get message by ID
     * GET /messages/:id
     */
    async findById(id) {
        try {
            if (!id || id.trim().length === 0) {
                throw new common_1.BadRequestException('Message ID is required');
            }
            this.logger.log(`Fetching message: ${id}`);
            const message = await this.messageService.findById(id);
            return {
                success: true,
                data: message,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching message: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "findById", null);
MessageController = MessageController_1 = __decorate([
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
exports.MessageController = MessageController;
