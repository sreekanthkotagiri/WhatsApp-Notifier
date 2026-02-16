export class CreateTenantDto {
  name!: string;
  status?: string;
}

export class UpdateTenantDto {
  name?: string;
  status?: string;
}

export class TenantResponseDto {
  id!: string;
  name!: string;
  status!: string;
  created_at!: Date;
}
