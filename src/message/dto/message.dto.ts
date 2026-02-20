export class SendMessageDto {
  tenantId!: string;
  contactId!: string;
  template_name!: string;
  language?: string; // Optional, defaults to 'en'
  type?: 'text' | 'template' | 'image' | 'doc';
  metadata?: Record<string, any>;
}

export class CreateMessageDto {
  tenant_id!: string;
  conversation_id!: string;
  contact_id!: string;
  channel?: string;
  direction!: 'inbound' | 'outbound';
  type!: 'text' | 'template' | 'image' | 'doc';
  content?: string | null;
  metadata?: Record<string, any> | null;
  external_message_id?: string | null;
  status?: string;
}

export class MessageResponseDto {
  id!: string;
  tenant_id!: string;
  conversation_id!: string;
  contact_id!: string;
  channel!: string;
  direction!: 'inbound' | 'outbound';
  type!: 'text' | 'template' | 'image' | 'doc';
  content?: string | null;
  metadata?: Record<string, any> | null;
  external_message_id?: string | null;
  status!: string;
  sent_at?: Date | null;
  delivered_at?: Date | null;
  read_at?: Date | null;
  failed_at?: Date | null;
  created_at!: Date;
}
