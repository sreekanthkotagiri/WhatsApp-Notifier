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
var AutomationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationController = void 0;
const common_1 = require("@nestjs/common");
let AutomationController = AutomationController_1 = class AutomationController {
    constructor() {
        this.logger = new common_1.Logger(AutomationController_1.name);
    }
    // POST /automation/delay
    delay(body, res) {
        var _a, _b, _c;
        const ms = Number((_b = (_a = body === null || body === void 0 ? void 0 : body.delay) !== null && _a !== void 0 ? _a : body === null || body === void 0 ? void 0 : body.ms) !== null && _b !== void 0 ? _b : 0);
        if (!Number.isFinite(ms) || ms < 0) {
            this.logger.warn(`Invalid delay value: ${(_c = body === null || body === void 0 ? void 0 : body.delay) !== null && _c !== void 0 ? _c : body === null || body === void 0 ? void 0 : body.ms}`);
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ error: 'Invalid delay value' });
        }
        this.logger.log(`Received delay request: ${ms}ms`);
        setTimeout(() => {
            this.logger.log(`Responding after ${ms}ms delay`);
            res.status(common_1.HttpStatus.OK).json({ delayed: ms });
        }, ms);
    }
};
__decorate([
    (0, common_1.Post)('delay'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "delay", null);
AutomationController = AutomationController_1 = __decorate([
    (0, common_1.Controller)('automation')
], AutomationController);
exports.AutomationController = AutomationController;
