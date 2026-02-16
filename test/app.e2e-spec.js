"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_controller_1 = require("../src/app.controller");
const app_service_1 = require("../src/app.service");
describe('AppController (e2e)', () => {
    let appController;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService],
        }).compile();
        appController = moduleFixture.get(app_controller_1.AppController);
    });
    it('/ (GET)', () => {
        expect(appController.getHello()).toBe('Hello, WhatsApp Auto Notifier!');
    });
});
