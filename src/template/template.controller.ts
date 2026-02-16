import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateResponseDto,
  SyncTemplateDto,
  SyncTemplateResponseDto,
} from './dto/template.dto';

@Controller('templates')
export class TemplateController {
  private readonly logger = new Logger(TemplateController.name);

  constructor(private readonly templateService: TemplateService) {}

  /**
   * GET /templates
   * List all templates for a tenant
   * Query params: tenantId (required), category, language, status (all optional)
   */
  @Get()
  async getAll(
    @Query('tenantId') tenantId?: string,
    @Query('category') category?: string,
    @Query('language') language?: string,
    @Query('status') status?: string,
  ): Promise<{
    success: boolean;
    data: TemplateResponseDto[];
    message: string;
  }> {
    try {
      if (!tenantId) {
        throw new BadRequestException('tenantId query parameter is required');
      }

      this.logger.log(
        `Fetching templates for tenant ${tenantId}, category: ${category || 'all'}, language: ${language || 'all'}`,
      );
      const templates = await this.templateService.getAll(
        tenantId,
        category,
        language,
        status,
      );

      return {
        success: true,
        data: templates,
        message: `Found ${templates.length} templates`,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching templates: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * POST /templates/sync
   * Sync system templates to a tenant
   * Body: { tenantId, category? }
   */
  @Post('sync')
  async syncTemplates(
    @Body() syncTemplateDto: SyncTemplateDto,
  ): Promise<SyncTemplateResponseDto> {
    try {
      if (!syncTemplateDto.tenantId) {
        throw new BadRequestException('tenantId is required');
      }

      this.logger.log(
        `Syncing templates for tenant ${syncTemplateDto.tenantId}`,
      );
      const result = await this.templateService.syncTemplates(syncTemplateDto);

      return result;
    } catch (error) {
      this.logger.error(
        `Error syncing templates: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * POST /templates
   * Create a new template
   * Body: { tenantId, name, category?, language?, components? }
   */
  @Post()
  async create(@Body() createTemplateDto: CreateTemplateDto): Promise<{
    success: boolean;
    data: TemplateResponseDto;
    message: string;
  }> {
    try {
      if (!createTemplateDto.tenantId) {
        throw new BadRequestException('tenantId is required');
      }

      if (!createTemplateDto.name) {
        throw new BadRequestException('name is required');
      }

      this.logger.log(
        `Creating template for tenant ${createTemplateDto.tenantId}`,
      );
      const template = await this.templateService.create(createTemplateDto);

      return {
        success: true,
        data: template,
        message: 'Template created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error creating template: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * GET /templates/:id
   * Get a single template by ID
   */
  @Get(':id')
  async getById(
    @Param('id') id: string,
  ): Promise<{
    success: boolean;
    data: TemplateResponseDto;
  }> {
    try {
      this.logger.log(`Fetching template ${id}`);
      const template = await this.templateService.getById(id);

      return {
        success: true,
        data: template,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching template: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * PATCH /templates/:id
   * Update a template
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<{
    success: boolean;
    data: TemplateResponseDto;
    message: string;
  }> {
    try {
      this.logger.log(`Updating template ${id}`);
      const template = await this.templateService.update(id, updateTemplateDto);

      return {
        success: true,
        data: template,
        message: 'Template updated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error updating template: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * DELETE /templates/:id
   * Delete a template
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Deleting template ${id}`);
      const result = await this.templateService.delete(id);

      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting template: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
