export class CreateContactDto {
  tenantId!: string;
  name?: string;
  phone!: string;
  external_ref?: string;
  metadata?: Record<string, any>;
}

export class UpdateContactDto {
  name?: string;
  external_ref?: string;
  metadata?: Record<string, any>;
}

export class ContactResponseDto {
  id!: string;
  tenant_id!: string;
  name?: string;
  phone!: string;
  external_ref?: string;
  metadata?: Record<string, any>;
  created_at!: Date;
  updated_at!: Date;
}
