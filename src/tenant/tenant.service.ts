import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    try {
      if (!createTenantDto.name || createTenantDto.name.trim().length === 0) {
        throw new BadRequestException('Tenant name is required');
      }

      const tenant = this.tenantRepository.create({
        name: createTenantDto.name,
        status: createTenantDto.status || 'active',
      });

      const savedTenant = await this.tenantRepository.save(tenant);
      this.logger.log(`Tenant created: ${savedTenant.id}`);

      return this.mapToResponseDto(savedTenant);
    } catch (error) {
      this.logger.error(`Error creating tenant: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async findAll(): Promise<TenantResponseDto[]> {
    try {
      const tenants = await this.tenantRepository.find();
      return tenants.map((tenant) => this.mapToResponseDto(tenant));
    } catch (error) {
      this.logger.error(`Error fetching tenants: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async findById(id: string): Promise<TenantResponseDto> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id } });

      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      return this.mapToResponseDto(tenant);
    } catch (error) {
      this.logger.error(`Error fetching tenant ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id } });

      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
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
    } catch (error) {
      this.logger.error(`Error updating tenant ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id } });

      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      await this.tenantRepository.remove(tenant);
      this.logger.log(`Tenant deleted: ${id}`);

      return { success: true, message: `Tenant ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(`Error deleting tenant ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private mapToResponseDto(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
      created_at: tenant.created_at,
    };
  }
}
