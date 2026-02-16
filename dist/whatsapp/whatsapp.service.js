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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(WhatsAppService_1.name);
    }
    async sendMessage(sendMessageDto) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { to, message } = sendMessageDto;
        if (!this.isValidE164Phone(to)) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: 'INVALID_PHONE_NUMBER',
                    message: 'Phone number must be in E.164 format (e.g., +1234567890)',
                },
            });
        }
        if (!message || message.trim().length === 0) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: 'EMPTY_MESSAGE',
                    message: 'Message must not be empty',
                },
            });
        }
        try {
            const response = await this.callWhatsAppAPI(to, message);
            return {
                success: true,
                message: 'Message sent successfully',
                messageId: (_b = (_a = response.messages) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id,
            };
        }
        catch (error) {
            this.logger.error(`WhatsApp API error: ${((_e = (_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) === null || _e === void 0 ? void 0 : _e.message) || error.message}`);
            throw new common_1.InternalServerErrorException({
                success: false,
                error: {
                    code: 'WHATSAPP_API_ERROR',
                    message: ((_h = (_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.error) === null || _h === void 0 ? void 0 : _h.message) ||
                        'Failed to send WhatsApp message',
                },
            });
        }
    }
    isValidE164Phone(phone) {
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(phone);
    }
    async callWhatsAppAPI(to, message) {
        const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        const payload = {
            messaging_product: 'whatsapp',
            to: to.replace('+', ''),
            type: 'text',
            text: {
                body: message,
            },
        };
        this.logger.log(`**************: ${process.env.WHATSAPP_ACCESS_TOKEN}    ${process.env.WHATSAPP_PHONE_NUMBER_ID}}`);
        const headers = {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        };
        this.logger.log(`Sending WhatsApp message to ${to}`);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
        this.logger.log(`WhatsApp API response: ${JSON.stringify(response.data)}`);
        return response.data;
    }
};
WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], WhatsAppService);
exports.WhatsAppService = WhatsAppService;
