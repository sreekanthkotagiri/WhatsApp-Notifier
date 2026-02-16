import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Contact } from './contact.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['contact_id'])
@Index(['last_message_at'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'uuid' })
  contact_id!: string;

  @ManyToOne(() => Contact, (contact) => contact.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact!: Contact;

  @Column({ type: 'varchar', length: 30, default: 'whatsapp' })
  channel!: string;

  @Column({ type: 'timestamp', nullable: true })
  last_message_at!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];
}
