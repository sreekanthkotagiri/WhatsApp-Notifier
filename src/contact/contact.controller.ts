import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactResponseDto,
} from './dto/contact.dto';

@Controller('contacts')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  /**
   * Create a new contact
   * POST /contacts
   * Body: { tenantId, name, phone, metadata }
   */
  @Post()
  async create(@Body() createContactDto: CreateContactDto): Promise<{
    success: boolean;
    data: ContactResponseDto;
  }> {
    try {
      this.logger.log('Creating new contact');
      const contact = await this.contactService.create(createContactDto);
      return {
        success: true,
        data: contact,
      };
    } catch (error) {
      this.logger.error(
        `Error creating contact: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get contacts by phone or tenantId
   * GET /contacts?phone=+919876543210
   * GET /contacts?tenantId=uuid
   */
  @Get()
  async findContacts(
    @Query('phone') phone?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<{
    success: boolean;
    data: ContactResponseDto[];
  }> {
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
      throw new BadRequestException(
        'Either phone (with tenantId) or tenantId query parameter is required',
      );
    } catch (error) {
      this.logger.error(
        `Error fetching contacts: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get contact by ID
   * GET /contacts/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<{
    success: boolean;
    data: ContactResponseDto;
  }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Contact ID is required');
      }

      this.logger.log(`Fetching contact: ${id}`);
      const contact = await this.contactService.findById(id);
      return {
        success: true,
        data: contact,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching contact: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update contact
   * PATCH /contacts/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<{
    success: boolean;
    data: ContactResponseDto;
  }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Contact ID is required');
      }

      this.logger.log(`Updating contact: ${id}`);
      const contact = await this.contactService.update(id, updateContactDto);
      return {
        success: true,
        data: contact,
      };
    } catch (error) {
      this.logger.error(
        `Error updating contact: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Delete contact
   * DELETE /contacts/:id
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Contact ID is required');
      }

      this.logger.log(`Deleting contact: ${id}`);
      const result = await this.contactService.delete(id);
      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting contact: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
