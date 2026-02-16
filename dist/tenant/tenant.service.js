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
var TenantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../database/entities/tenant.entity");
let TenantService = TenantService_1 = class TenantService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
        this.logger = new common_1.Logger(TenantService_1.name);
    }
    async create(createTenantDto) {
        try {
            if (!createTenantDto.name || createTenantDto.name.trim().length === 0) {
                throw new common_1.BadRequestException('Tenant name is required');
            }
            const tenant = this.tenantRepository.create({
                name: createTenantDto.name,
                status: createTenantDto.status || 'active',
            });
            const savedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Tenant created: ${savedTenant.id}`);
            return this.mapToResponseDto(savedTenant);
        }
        catch (error) {
            this.logger.error(`Error creating tenant: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findAll() {
        try {
            const tenants = await this.tenantRepository.find();
            return tenants.map((tenant) => this.mapToResponseDto(tenant));
        }
        catch (error) {
            this.logger.error(`Error fetching tenants: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const tenant = await this.tenantRepository.findOne({ where: { id } });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
            }
            return this.mapToResponseDto(tenant);
        }
        catch (error) {
            this.logger.error(`Error fetching tenant ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async update(id, updateTenantDto) {
        try {
            const tenant = await this.tenantRepository.findOne({ where: { id } });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
            }
            if (updateTenantDto.name) {
                tenant.name = updateTenantDto.name;
            }
            if (updateTenantDto.status) {
                tenant.status = updateTenantDto.status;
            }
            const updatedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Tenant updated: ${updatedTenant.id}`);
            return this.mapToResponseDto(updatedTenant);
        }
        catch (error) {
            this.logger.error(`Error updating tenant ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            const tenant = await this.tenantRepository.findOne({ where: { id } });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
            }
            await this.tenantRepository.remove(tenant);
            this.logger.log(`Tenant deleted: ${id}`);
            return { success: true, message: `Tenant ${id} deleted successfully` };
        }
        catch (error) {
            this.logger.error(`Error deleting tenant ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    mapToResponseDto(tenant) {
        return {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
            created_at: tenant.created_at,
        };
    }
};
TenantService = TenantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantService);
exports.TenantService = TenantService;
