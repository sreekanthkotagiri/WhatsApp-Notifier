export class CreateTemplateDto {
  tenantId!: string;
  name!: string;
  category?: string; // 'marketing', 'utility', 'authentication'
  language?: string; // Default: 'en'
  components?: Record<string, any>; // Template structure with body, footer, buttons, etc.
}

export class UpdateTemplateDto {
  name?: string;
  category?: string;
  language?: string;
  components?: Record<string, any>;
  status?: string; // 'approved', 'rejected', 'pending'
}

export class TemplateResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  category?: string;
  language!: string;
  status!: string;
  components?: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SyncTemplateDto {
  tenantId!: string;
  category?: string; // Optional: sync only templates from specific category
}

export class SyncTemplateResponseDto {
  success!: boolean;
  message!: string;
  synced!: number;
  data?: TemplateResponseDto[];
}
