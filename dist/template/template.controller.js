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
var TemplateController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const template_service_1 = require("./template.service");
const template_dto_1 = require("./dto/template.dto");
let TemplateController = TemplateController_1 = class TemplateController {
    constructor(templateService) {
        this.templateService = templateService;
        this.logger = new common_1.Logger(TemplateController_1.name);
    }
    /**
     * GET /templates
     * List all templates for a tenant
     * Query params: tenantId (required), category, language, status (all optional)
     */
    async getAll(tenantId, category, language, status) {
        try {
            if (!tenantId) {
                throw new common_1.BadRequestException('tenantId query parameter is required');
            }
            this.logger.log(`Fetching templates for tenant ${tenantId}, category: ${category || 'all'}, language: ${language || 'all'}`);
            const templates = await this.templateService.getAll(tenantId, category, language, status);
            return {
                success: true,
                data: templates,
                message: `Found ${templates.length} templates`,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching templates: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * POST /templates/sync
     * Sync system templates to a tenant
     * Body: { tenantId, category? }
     */
    async syncTemplates(syncTemplateDto) {
        try {
            if (!syncTemplateDto.tenantId) {
                throw new common_1.BadRequestException('tenantId is required');
            }
            this.logger.log(`Syncing templates for tenant ${syncTemplateDto.tenantId}`);
            const result = await this.templateService.syncTemplates(syncTemplateDto);
            return result;
        }
        catch (error) {
            this.logger.error(`Error syncing templates: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * POST /templates
     * Create a new template
     * Body: { tenantId, name, category?, language?, components? }
     */
    async create(createTemplateDto) {
        try {
            if (!createTemplateDto.tenantId) {
                throw new common_1.BadRequestException('tenantId is required');
            }
            if (!createTemplateDto.name) {
                throw new common_1.BadRequestException('name is required');
            }
            this.logger.log(`Creating template for tenant ${createTemplateDto.tenantId}`);
            const template = await this.templateService.create(createTemplateDto);
            return {
                success: true,
                data: template,
                message: 'Template created successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error creating template: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * GET /templates/:id
     * Get a single template by ID
     */
    async getById(id) {
        try {
            this.logger.log(`Fetching template ${id}`);
            const template = await this.templateService.getById(id);
            return {
                success: true,
                data: template,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching template: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * PATCH /templates/:id
     * Update a template
     */
    async update(id, updateTemplateDto) {
        try {
            this.logger.log(`Updating template ${id}`);
            const template = await this.templateService.update(id, updateTemplateDto);
            return {
                success: true,
                data: template,
                message: 'Template updated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error updating template: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * DELETE /templates/:id
     * Delete a template
     */
    async delete(id) {
        try {
            this.logger.log(`Deleting template ${id}`);
            const result = await this.templateService.delete(id);
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting template: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.SyncTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "syncTemplates", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "delete", null);
TemplateController = TemplateController_1 = __decorate([
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [template_service_1.TemplateService])
], TemplateController);
exports.TemplateController = TemplateController;
