import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from './dto/tenant.dto';

@Controller('tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(private readonly tenantService: TenantService) {}

  /**
   * Create a new tenant
   * POST /tenants
   */
  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<{ success: boolean; data: TenantResponseDto }> {
    try {
      this.logger.log('Creating new tenant');
      const tenant = await this.tenantService.create(createTenantDto);
      return {
        success: true,
        data: tenant,
      };
    } catch (error) {
      this.logger.error(`Error creating tenant: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get all tenants
   * GET /tenants
   */
  @Get()
  async findAll(): Promise<{ success: boolean; data: TenantResponseDto[] }> {
    try {
      this.logger.log('Fetching all tenants');
      const tenants = await this.tenantService.findAll();
      return {
        success: true,
        data: tenants,
      };
    } catch (error) {
      this.logger.error(`Error fetching tenants: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get tenant by ID
   * GET /tenants/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<{ success: boolean; data: TenantResponseDto }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Tenant ID is required');
      }

      this.logger.log(`Fetching tenant: ${id}`);
      const tenant = await this.tenantService.findById(id);
      return {
        success: true,
        data: tenant,
      };
    } catch (error) {
      this.logger.error(`Error fetching tenant: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Update tenant
   * PATCH /tenants/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<{ success: boolean; data: TenantResponseDto }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Tenant ID is required');
      }

      this.logger.log(`Updating tenant: ${id}`);
      const tenant = await this.tenantService.update(id, updateTenantDto);
      return {
        success: true,
        data: tenant,
      };
    } catch (error) {
      this.logger.error(`Error updating tenant: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Delete tenant
   * DELETE /tenants/:id
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Tenant ID is required');
      }

      this.logger.log(`Deleting tenant: ${id}`);
      const result = await this.tenantService.delete(id);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting tenant: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
