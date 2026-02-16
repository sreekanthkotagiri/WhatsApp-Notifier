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
var ContactController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const contact_service_1 = require("./contact.service");
const contact_dto_1 = require("./dto/contact.dto");
let ContactController = ContactController_1 = class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
        this.logger = new common_1.Logger(ContactController_1.name);
    }
    /**
     * Create a new contact
     * POST /contacts
     * Body: { tenantId, name, phone, metadata }
     */
    async create(createContactDto) {
        try {
            this.logger.log('Creating new contact');
            const contact = await this.contactService.create(createContactDto);
            return {
                success: true,
                data: contact,
            };
        }
        catch (error) {
            this.logger.error(`Error creating contact: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get contacts by phone or tenantId
     * GET /contacts?phone=+919876543210
     * GET /contacts?tenantId=uuid
     */
    async findContacts(phone, tenantId) {
        try {
            // If phone is provided, find by phone and tenantId
            if (phone && tenantId) {
                this.logger.log(`Fetching contact by phone: ${phone} and tenantId: ${tenantId}`);
                const contacts = await this.contactService.findByPhone(tenantId, phone);
                return {
                    success: true,
                    data: contacts,
                };
            }
            // If only tenantId is provided, find all contacts for that tenant
            if (tenantId && !phone) {
                this.logger.log(`Fetching contacts for tenantId: ${tenantId}`);
                const contacts = await this.contactService.findByTenantId(tenantId);
                return {
                    success: true,
                    data: contacts,
                };
            }
            // If neither is provided, throw error
            throw new common_1.BadRequestException('Either phone (with tenantId) or tenantId query parameter is required');
        }
        catch (error) {
            this.logger.error(`Error fetching contacts: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get contact by ID
     * GET /contacts/:id
     */
    async findById(id) {
        try {
            if (!id || id.trim().length === 0) {
                throw new common_1.BadRequestException('Contact ID is required');
            }
            this.logger.log(`Fetching contact: ${id}`);
            const contact = await this.contactService.findById(id);
            return {
                success: true,
                data: contact,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching contact: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Update contact
     * PATCH /contacts/:id
     */
    async update(id, updateContactDto) {
        try {
            if (!id || id.trim().length === 0) {
                throw new common_1.BadRequestException('Contact ID is required');
            }
            this.logger.log(`Updating contact: ${id}`);
            const contact = await this.contactService.update(id, updateContactDto);
            return {
                success: true,
                data: contact,
            };
        }
        catch (error) {
            this.logger.error(`Error updating contact: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Delete contact
     * DELETE /contacts/:id
     */
    async delete(id) {
        try {
            if (!id || id.trim().length === 0) {
                throw new common_1.BadRequestException('Contact ID is required');
            }
            this.logger.log(`Deleting contact: ${id}`);
            const result = await this.contactService.delete(id);
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting contact: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('phone')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "findContacts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.UpdateContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "delete", null);
ContactController = ContactController_1 = __decorate([
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
exports.ContactController = ContactController;
