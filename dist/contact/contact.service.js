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
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_entity_1 = require("../database/entities/contact.entity");
const tenant_entity_1 = require("../database/entities/tenant.entity");
let ContactService = ContactService_1 = class ContactService {
    constructor(contactRepository, tenantRepository) {
        this.contactRepository = contactRepository;
        this.tenantRepository = tenantRepository;
        this.logger = new common_1.Logger(ContactService_1.name);
    }
    async create(createContactDto) {
        try {
            // Validate tenant exists
            const tenant = await this.tenantRepository.findOne({
                where: { id: createContactDto.tenantId },
            });
            if (!tenant) {
                throw new common_1.BadRequestException(`Tenant with ID ${createContactDto.tenantId} not found`);
            }
            // Validate phone number
            if (!createContactDto.phone || createContactDto.phone.trim().length === 0) {
                throw new common_1.BadRequestException('Phone number is required');
            }
            // Check if contact with same phone already exists for this tenant
            const existingContact = await this.contactRepository.findOne({
                where: {
                    tenant_id: createContactDto.tenantId,
                    phone: createContactDto.phone,
                },
            });
            if (existingContact) {
                throw new common_1.BadRequestException(`Contact with phone ${createContactDto.phone} already exists for this tenant`);
            }
            const contact = this.contactRepository.create({
                tenant_id: createContactDto.tenantId,
                name: createContactDto.name || null,
                phone: createContactDto.phone,
                external_ref: createContactDto.external_ref || null,
                metadata: createContactDto.metadata || null,
            });
            const savedContact = await this.contactRepository.save(contact);
            this.logger.log(`Contact created: ${savedContact.id}`);
            return this.mapToResponseDto(savedContact);
        }
        catch (error) {
            this.logger.error(`Error creating contact: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findByPhone(tenantId, phone) {
        try {
            const contacts = await this.contactRepository.find({
                where: {
                    tenant_id: tenantId,
                    phone,
                },
            });
            return contacts.map((contact) => this.mapToResponseDto(contact));
        }
        catch (error) {
            this.logger.error(`Error fetching contact by phone: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findByTenantId(tenantId) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantRepository.findOne({
                where: { id: tenantId },
            });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
            }
            const contacts = await this.contactRepository.find({
                where: {
                    tenant_id: tenantId,
                },
            });
            return contacts.map((contact) => this.mapToResponseDto(contact));
        }
        catch (error) {
            this.logger.error(`Error fetching contacts by tenant: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const contact = await this.contactRepository.findOne({ where: { id } });
            if (!contact) {
                throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
            }
            return this.mapToResponseDto(contact);
        }
        catch (error) {
            this.logger.error(`Error fetching contact ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async update(id, updateContactDto) {
        try {
            const contact = await this.contactRepository.findOne({ where: { id } });
            if (!contact) {
                throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
            }
            if (updateContactDto.name !== undefined) {
                contact.name = updateContactDto.name || null;
            }
            if (updateContactDto.external_ref !== undefined) {
                contact.external_ref = updateContactDto.external_ref || null;
            }
            if (updateContactDto.metadata !== undefined) {
                contact.metadata = updateContactDto.metadata || null;
            }
            const updatedContact = await this.contactRepository.save(contact);
            this.logger.log(`Contact updated: ${updatedContact.id}`);
            return this.mapToResponseDto(updatedContact);
        }
        catch (error) {
            this.logger.error(`Error updating contact ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            const contact = await this.contactRepository.findOne({ where: { id } });
            if (!contact) {
                throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
            }
            await this.contactRepository.remove(contact);
            this.logger.log(`Contact deleted: ${id}`);
            return { success: true, message: `Contact ${id} deleted successfully` };
        }
        catch (error) {
            this.logger.error(`Error deleting contact ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    mapToResponseDto(contact) {
        return {
            id: contact.id,
            tenant_id: contact.tenant_id,
            name: contact.name || undefined,
            phone: contact.phone,
            external_ref: contact.external_ref || undefined,
            metadata: contact.metadata || undefined,
            created_at: contact.created_at,
            updated_at: contact.updated_at,
        };
    }
};
ContactService = ContactService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ContactService);
exports.ContactService = ContactService;
