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
var WhatsAppController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const send_message_dto_1 = require("./dto/send-message.dto");
let WhatsAppController = WhatsAppController_1 = class WhatsAppController {
    constructor(whatsAppService) {
        this.whatsAppService = whatsAppService;
        this.logger = new common_1.Logger(WhatsAppController_1.name);
    }
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
    async sendMessage(sendMessageDto) {
        try {
            this.logger.log(`Received send message request for: ${sendMessageDto.to}`);
            const response = await this.whatsAppService.sendMessage(sendMessageDto);
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error sending message: ${errorMessage}`, errorStack);
            // Handle BadRequestException (validation errors)
            if (error instanceof common_1.BadRequestException) {
                const errorResponse = error.getResponse();
                throw new common_1.BadRequestException(errorResponse);
            }
            // Handle other errors as 500 Internal Server Error
            throw new common_1.InternalServerErrorException({
                success: false,
                error: {
                    code: 'WHATSAPP_API_ERROR',
                    message: 'Failed to send message via WhatsApp API',
                },
            });
        }
    }
};
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendMessage", null);
WhatsAppController = WhatsAppController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService])
], WhatsAppController);
exports.WhatsAppController = WhatsAppController;
