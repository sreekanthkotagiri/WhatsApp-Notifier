import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Template } from './template.entity';


@Entity('tenants')
@Index(['status'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Contact, (contact) => contact.tenant)
  contacts!: Contact[];

  @OneToMany(() => Conversation, (conversation) => conversation.tenant)
  conversations!: Conversation[];

  @OneToMany(() => Message, (message) => message.tenant)
  messages!: Message[];

  @OneToMany(() => Template, (template) => template.tenant)
  templates!: Template[];
}
