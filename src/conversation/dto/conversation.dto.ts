import { Transform } from 'class-transformer';

export class CreateConversationDto {
  @Transform(({ value, obj }: { value: any; obj: any }) => obj.tenant_id || value)
  tenantId!: string;

  @Transform(({ value, obj }: { value: any; obj: any }) => obj.contact_id || value)
  contactId!: string;

  @Transform(({ value }: { value: any }) => value)
  channel?: string;
}

export class ConversationResponseDto {
  id!: string;
  tenant_id!: string;
  contact_id!: string;
  channel!: string;
  last_message_at?: Date | null;
  status!: string;
  created_at!: Date;
}

export class ConversationWithMessagesDto extends ConversationResponseDto {
  messages?: MessageResponseDto[];
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
