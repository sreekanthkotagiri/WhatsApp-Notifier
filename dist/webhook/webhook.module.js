"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const webhook_controller_1 = require("./webhook.controller");
const raw_body_middleware_1 = require("./raw-body.middleware");
let WebhookModule = class WebhookModule {
    configure(consumer) {
        // Apply raw body middleware to capture the original payload for logging
        consumer.apply(raw_body_middleware_1.RawBodyMiddleware).forRoutes({ path: 'webhook', method: common_1.RequestMethod.ALL });
    }
};
WebhookModule = __decorate([
    (0, common_1.Module)({
        controllers: [webhook_controller_1.WebhookController],
    })
], WebhookModule);
exports.WebhookModule = WebhookModule;
