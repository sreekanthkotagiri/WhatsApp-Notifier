import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../database/entities/contact.entity';
import { Tenant } from '../database/entities/tenant.entity';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactResponseDto,
} from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<ContactResponseDto> {
    try {
      // Validate tenant exists
      const tenant = await this.tenantRepository.findOne({
        where: { id: createContactDto.tenantId },
      });

      if (!tenant) {
        throw new BadRequestException({
          success: false,
          error: {
            code: 'DB_ERROR_NOT_FOUND',
            message: `Tenant not found: ID '${createContactDto.tenantId}'`,
          },
        });
      }

      // Validate phone number
      if (!createContactDto.phone || createContactDto.phone.trim().length === 0) {
        throw new BadRequestException({
          success: false,
          error: {
            code: 'DB_ERROR_INVALID_INPUT',
            message: 'Phone number is required',
          },
        });
      }

      // Check if contact with same phone already exists for this tenant
      const existingContact = await this.contactRepository.findOne({
        where: {
          tenant_id: createContactDto.tenantId,
          phone: createContactDto.phone,
        },
      });

      if (existingContact) {
        throw new BadRequestException(
          `Contact with phone ${createContactDto.phone} already exists for this tenant`,
        );
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
    } catch (error) {
      this.logger.error(
        `Error creating contact: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findByPhone(
    tenantId: string,
    phone: string,
  ): Promise<ContactResponseDto[]> {
    try {
      const contacts = await this.contactRepository.find({
        where: {
          tenant_id: tenantId,
          phone,
        },
      });

      return contacts.map((contact) => this.mapToResponseDto(contact));
    } catch (error) {
      this.logger.error(
        `Error fetching contact by phone: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findByTenantId(tenantId: string): Promise<ContactResponseDto[]> {
    try {
      // Verify tenant exists
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'DB_ERROR_NOT_FOUND',
            message: `Tenant not found: ID '${tenantId}'`,
          },
        });
      }

      const contacts = await this.contactRepository.find({
        where: {
          tenant_id: tenantId,
        },
      });

      return contacts.map((contact) => this.mapToResponseDto(contact));
    } catch (error) {
      this.logger.error(
        `Error fetching contacts by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<ContactResponseDto> {
    try {
      const contact = await this.contactRepository.findOne({ where: { id } });

      if (!contact) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'DB_ERROR_NOT_FOUND',
            message: `Contact not found: ID '${id}'`,
          },
        });
      }

      return this.mapToResponseDto(contact);
    } catch (error) {
      this.logger.error(
        `Error fetching contact ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    try {
      const contact = await this.contactRepository.findOne({ where: { id } });

      if (!contact) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'DB_ERROR_NOT_FOUND',
            message: `Contact not found: ID '${id}'`,
          },
        });
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
    } catch (error) {
      this.logger.error(
        `Error updating contact ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const contact = await this.contactRepository.findOne({ where: { id } });

      if (!contact) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'DB_ERROR_NOT_FOUND',
            message: `Contact not found: ID '${id}'`,
          },
        });
      }

      await this.contactRepository.remove(contact);
      this.logger.log(`Contact deleted: ${id}`);

      return { success: true, message: `Contact ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(
        `Error deleting contact ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private mapToResponseDto(contact: Contact): ContactResponseDto {
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
}
