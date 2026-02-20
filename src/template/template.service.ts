import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../database/entities/template.entity';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateResponseDto,
  SyncTemplateDto,
  SyncTemplateResponseDto,
} from './dto/template.dto';
import { Tenant } from '../database/entities/tenant.entity';

const SYSTEM_TEMPLATES = [
  // Marketing Templates
  {
    category: 'marketing',
    language: 'en',
    name: 'Promotional Offer',
    components: {
      body: 'Hi {{firstName}}, Special offer just for you! Get {{discount}}% off on {{productName}}. Valid till {{expiryDate}}.',
      footer: 'Thank you for your business!',
      buttons: [
        {
          type: 'url',
          text: 'Shop Now',
          url: '{{shopLink}}',
        },
      ],
    },
  },
  {
    category: 'marketing',
    language: 'en',
    name: 'Campaign Announcement',
    components: {
      body: 'Hi {{firstName}}, We\'re excited to announce {{campaignName}}! {{description}} Learn more: {{link}}',
      footer: 'Made with ❤️ for you',
      buttons: [
        {
          type: 'url',
          text: 'View Campaign',
          url: '{{campaignLink}}',
        },
      ],
    },
  },
  {
    category: 'marketing',
    language: 'en',
    name: 'Back in Stock',
    components: {
      body: 'Great news {{firstName}}! {{productName}} is back in stock. Available quantity: {{quantity}}.',
      footer: 'Shop now before it runs out',
      buttons: [
        {
          type: 'url',
          text: 'View Product',
          url: '{{productLink}}',
        },
      ],
    },
  },

  // Utility Templates
  {
    category: 'utility',
    language: 'en',
    name: 'Order Confirmation',
    components: {
      body: 'Hi {{customerName}}, Your order #{{orderId}} has been confirmed. Delivery time: {{deliveryTime}}. Total: {{amount}}.',
      footer: 'Thank you for ordering',
      buttons: [
        {
          type: 'url',
          text: 'Track Order',
          url: '{{trackingLink}}',
        },
      ],
    },
  },
  {
    category: 'utility',
    language: 'en',
    name: 'Order Status Update',
    components: {
      body: 'Hi {{customerName}}, Your order #{{orderId}} is {{status}}. Expected delivery: {{deliveryTime}}.',
      footer: 'Need help? Contact us',
      buttons: [
        {
          type: 'url',
          text: 'View Details',
          url: '{{detailsLink}}',
        },
      ],
    },
  },
  {
    category: 'utility',
    language: 'en',
    name: 'Appointment Reminder',
    components: {
      body: 'Hi {{patientName}}, Reminder: You have an appointment on {{appointmentDate}} at {{appointmentTime}} with {{doctorName}}.',
      footer: 'Please arrive 10 minutes early',
      buttons: [
        {
          type: 'quick_reply',
          text: 'Confirm',
        },
        {
          type: 'quick_reply',
          text: 'Reschedule',
        },
      ],
    },
  },
  {
    category: 'utility',
    language: 'en',
    name: 'Invoice',
    components: {
      body: 'Hi {{customerName}}, Your invoice #{{invoiceNumber}} from {{businessName}} for {{amount}} is ready.',
      footer: 'Payment due by {{dueDate}}',
      buttons: [
        {
          type: 'url',
          text: 'View Invoice',
          url: '{{invoiceLink}}',
        },
      ],
    },
  },

  // Authentication Templates
  {
    category: 'authentication',
    language: 'en',
    name: 'OTP Verification',
    components: {
      body: 'Hi {{firstName}}, Your verification code is: {{otp}}. This code will expire in {{expiryMinutes}} minutes.',
      footer: 'Don\'t share this code with anyone',
      buttons: [],
    },
  },
  {
    category: 'authentication',
    language: 'en',
    name: 'Password Reset',
    components: {
      body: 'Hi {{firstName}}, Click the link below to reset your password. This link will expire in {{expiryHours}} hours.',
      footer: 'If you didn\'t request this, ignore this message',
      buttons: [
        {
          type: 'url',
          text: 'Reset Password',
          url: '{{resetLink}}',
        },
      ],
    },
  },
  {
    category: 'authentication',
    language: 'en',
    name: 'Account Verification',
    components: {
      body: 'Hi {{firstName}}, Welcome! Click the link below to verify your account.',
      footer: 'You have 24 hours to verify',
      buttons: [
        {
          type: 'url',
          text: 'Verify Account',
          url: '{{verificationLink}}',
        },
      ],
    },
  },
];

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new template for a tenant
   */
  async create(
    createTemplateDto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const { tenantId, name, category, components, language } =
      createTemplateDto;

    // Validate tenant exists
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

    // Validate required fields
    if (!name) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'DB_ERROR_INVALID_INPUT',
          message: 'Template name is required',
        },
      });
    }

    const finalLanguage = language || 'en';

    // Check for duplicate name and language combination for tenant
    const existingTemplate = await this.templateRepository.findOne({
      where: {
        tenant_id: tenantId,
        name,
        language: finalLanguage,
      },
    });

    if (existingTemplate) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'DB_ERROR_DUPLICATE',
          message: `Template with name "${name}" and language "${finalLanguage}" already exists for this tenant`,
        },
      });
    }

    const template = this.templateRepository.create({
      tenant_id: tenantId,
      name,
      category: category || null,
      language: finalLanguage,
      status: 'pending',
      components: components || null,
    });

    const savedTemplate = await this.templateRepository.save(template);
    this.logger.log(
      `Template created: ${savedTemplate.id} for tenant ${tenantId}`,
    );

    return this.mapToResponseDto(savedTemplate);
  }

  /**
   * Get all templates for a tenant
   */
  async getAll(
    tenantId: string,
    category?: string,
    language?: string,
    status?: string,
  ): Promise<TemplateResponseDto[]> {
    // Validate tenant exists
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

    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.tenant_id = :tenantId', { tenantId });

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    if (language) {
      query.andWhere('template.language = :language', { language });
    }

    if (status) {
      query.andWhere('template.status = :status', { status });
    }

    const templates = await query
      .orderBy('template.category', 'ASC')
      .addOrderBy('template.language', 'ASC')
      .addOrderBy('template.name', 'ASC')
      .getMany();

    return templates.map((template) => this.mapToResponseDto(template));
  }

  /**
   * Get a single template by ID
   */
  async getById(templateId: string): Promise<TemplateResponseDto> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'DB_ERROR_NOT_FOUND',
          message: `Template not found: ID '${templateId}'`,
        },
      });
    }

    return this.mapToResponseDto(template);
  }

  /**
   * Get template by name and tenant ID
   */
  async getByNameAndTenant(
    tenantId: string,
    templateName: string,
    language: string = 'en_US',
  ): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: {
        tenant_id: tenantId,
        name: templateName,
        language,
      },
    });

    if (!template) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'DB_ERROR_NOT_FOUND',
          message: `Template not found: name '${templateName}' (language: '${language}', tenant: '${tenantId}')`,
        },
      });
    }

    return template;
  }

  /**
   * Sync system templates to a tenant
   */
  async syncTemplates(
    syncTemplateDto: SyncTemplateDto,
  ): Promise<SyncTemplateResponseDto> {
    const { tenantId, category } = syncTemplateDto;

    // Validate tenant exists
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

    let templatesToSync = SYSTEM_TEMPLATES;
    if (category) {
      templatesToSync = SYSTEM_TEMPLATES.filter((t) => t.category === category);
    }

    let syncedCount = 0;
    const syncedTemplates: Template[] = [];

    for (const systemTemplate of templatesToSync) {
      // Check if template already exists
      const existingTemplate = await this.templateRepository.findOne({
        where: {
          tenant_id: tenantId,
          name: systemTemplate.name,
          language: systemTemplate.language,
        },
      });

      if (!existingTemplate) {
        const template = this.templateRepository.create({
          tenant_id: tenantId,
          name: systemTemplate.name,
          category: systemTemplate.category,
          language: systemTemplate.language,
          components: systemTemplate.components,
          status: 'approved', // System templates are pre-approved
        });

        const savedTemplate = await this.templateRepository.save(template);
        syncedCount++;
        syncedTemplates.push(savedTemplate);
      }
    }

    this.logger.log(
      `Synced ${syncedCount} templates for tenant ${tenantId}`,
    );

    return {
      success: true,
      message: `Successfully synced ${syncedCount} templates for tenant`,
      synced: syncedCount,
      data: syncedTemplates.map((t) => this.mapToResponseDto(t)),
    };
  }

  /**
   * Update a template
   */
  async update(
    templateId: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'DB_ERROR_NOT_FOUND',
          message: `Template not found: ID '${templateId}'`,
        },
      });
    }

    const { name, category, language, components, status } = updateTemplateDto;

    if (name) {
      template.name = name;
    }

    if (category) {
      template.category = category;
    }

    if (language) {
      template.language = language;
    }

    if (components) {
      template.components = components;
    }

    if (status) {
      // Validate status value
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        throw new BadRequestException({
          success: false,
          error: {
            code: 'DB_ERROR_INVALID_INPUT',
            message: 'status must be one of: approved, rejected, pending',
          },
        });
      }
      template.status = status;
    }

    const updatedTemplate = await this.templateRepository.save(template);
    this.logger.log(`Template updated: ${updatedTemplate.id}`);

    return this.mapToResponseDto(updatedTemplate);
  }

  /**
   * Delete a template
   */
  async delete(templateId: string): Promise<{ success: boolean; message: string }> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'DB_ERROR_NOT_FOUND',
          message: `Template not found: ID '${templateId}'`,
        },
      });
    }

    await this.templateRepository.remove(template);
    this.logger.log(`Template deleted: ${templateId}`);

    return { success: true, message: 'Template deleted successfully' };
  }

  /**
   * Helper: Map entity to DTO
   */
  private mapToResponseDto(template: Template): TemplateResponseDto {
    return {
      id: template.id,
      tenantId: template.tenant_id,
      name: template.name,
      category: template.category || undefined,
      language: template.language,
      status: template.status,
      components: template.components || undefined,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    };
  }
}
