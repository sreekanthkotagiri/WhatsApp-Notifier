import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Conversation } from './conversation.entity';
import { Contact } from './contact.entity';

@Entity('messages')
@Index(['tenant_id'])
@Index(['contact_id'])
@Index(['conversation_id'])
@Index(['external_message_id'])
@Index(['status'])
@Index(['created_at'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'uuid' })
  conversation_id!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @Column({ type: 'uuid' })
  contact_id!: string;

  @ManyToOne(() => Contact, (contact) => contact.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact!: Contact;

  @Column({ type: 'varchar', length: 30, default: 'whatsapp' })
  channel!: string;

  @Column({ type: 'varchar', length: 10 })
  direction!: 'inbound' | 'outbound';

  @Column({ type: 'varchar', length: 20 })
  type!: 'text' | 'template' | 'image' | 'doc';

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  external_message_id!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status!: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  sent_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  read_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  failed_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;
}
