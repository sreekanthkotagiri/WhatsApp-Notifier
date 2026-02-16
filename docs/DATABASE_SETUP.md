# PostgreSQL Database Setup Guide - Multi-Tenant Multi-Channel Messaging

## Database Architecture

This application uses a multi-tenant architecture with support for multiple messaging channels (currently WhatsApp). The database schema supports:

- **Multi-Tenancy**: Each tenant has isolated contacts, conversations, and messages
- **Multi-Channel**: Support for different messaging channels (WhatsApp, SMS, etc.)
- **Message Tracking**: Complete message lifecycle tracking (queued → sent → delivered → read)
- **Conversations**: Group messages by conversation thread

## Prerequisites

- PostgreSQL 12+ installed
- psql command-line tool
- Environment variables configured in `.env`

## Step 1: Create Database and User

### Windows PowerShell
```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-15

# Connect as postgres user
psql -U postgres

# Inside psql console:
CREATE USER whatsapp_user WITH PASSWORD 'secure_password';
CREATE DATABASE whatsapp_autonation OWNER whatsapp_user;
GRANT ALL PRIVILEGES ON DATABASE whatsapp_autonation TO whatsapp_user;
\q
```

### macOS/Linux
```bash
# Start PostgreSQL
brew services start postgresql

# Create database and user
createuser -P whatsapp_user
createdb -O whatsapp_user whatsapp_autonation

# Verify
psql -U whatsapp_user -d whatsapp_autonation
```

## Step 2: Configure Environment Variables

Update `.env`:
```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=whatsapp_user
DB_PASSWORD=secure_password
DB_NAME=whatsapp_autonation
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

## Step 3: Create Database Tables

### Option A: Automatic with TypeORM (Easiest)

1. Ensure `DB_SYNCHRONIZE=true` in `.env`
2. Run the application:
   ```powershell
   npm run build
   npm start
   ```
3. TypeORM will automatically create all tables
4. After successful creation, change `DB_SYNCHRONIZE=false`

### Option B: Manual SQL Creation (Production Recommended)

Connect to database:
```bash
psql -U whatsapp_user -d whatsapp_autonation
```

Execute the following SQL:
```sql
-- 1. Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_status ON tenants(status);

-- 2. Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(150),
  phone VARCHAR(20) NOT NULL,
  external_ref VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_metadata ON contacts USING GIN(metadata);

-- 3. Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel VARCHAR(30) DEFAULT 'whatsapp',
  last_message_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- 4. Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel VARCHAR(30) DEFAULT 'whatsapp',
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'template', 'image', 'doc')),
  content TEXT,
  metadata JSONB,
  external_message_id VARCHAR(120),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_tenant ON messages(tenant_id);
CREATE INDEX idx_messages_contact ON messages(contact_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_external_id ON messages(external_message_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_metadata ON messages USING GIN(metadata);
```

## Database Schema Overview

### tenants
Multi-tenant support - each organization/workspace is a tenant
```
Columns:
- id (UUID) - Primary key
- name (VARCHAR 150) - Tenant name
- status (VARCHAR 20) - active/inactive
- created_at (TIMESTAMP) - Creation timestamp
```

### contacts
Customer/contact database per tenant
```
Columns:
- id (UUID) - Primary key
- tenant_id (UUID) - Foreign key to tenants
- name (VARCHAR 150) - Contact name
- phone (VARCHAR 20) - Phone number (unique per tenant)
- external_ref (VARCHAR 100) - External reference ID
- metadata (JSONB) - Custom data
- created_at, updated_at (TIMESTAMP)

Relations:
- Many-to-One: tenants
- One-to-Many: conversations, messages
```

### conversations
Message conversations/threads grouped by contact
```
Columns:
- id (UUID) - Primary key
- tenant_id (UUID) - Foreign key to tenants
- contact_id (UUID) - Foreign key to contacts
- channel (VARCHAR 30) - messaging channel (whatsapp, sms, etc.)
- last_message_at (TIMESTAMP) - When last message was sent/received
- status (VARCHAR 20) - open/closed/archived
- created_at (TIMESTAMP)

Relations:
- Many-to-One: tenants, contacts
- One-to-Many: messages
```

### messages
Individual messages sent/received
```
Columns:
- id (UUID) - Primary key
- tenant_id (UUID) - Foreign key to tenants
- conversation_id (UUID) - Foreign key to conversations
- contact_id (UUID) - Foreign key to contacts
- channel (VARCHAR 30) - messaging channel
- direction (VARCHAR 10) - inbound/outbound
- type (VARCHAR 20) - text/template/image/doc
- content (TEXT) - message content/body
- metadata (JSONB) - extra data (media URLs, etc.)
- external_message_id (VARCHAR 120) - WhatsApp WAMID
- status (VARCHAR 20) - queued/sent/delivered/read/failed
- sent_at, delivered_at, read_at, failed_at (TIMESTAMP) - status timestamps
- created_at (TIMESTAMP)

Relations:
- Many-to-One: tenants, conversations, contacts
```

## Useful PostgreSQL Commands

### Connect to database
```bash
psql -U whatsapp_user -d whatsapp_autonation
```

### List all tables
```sql
\dt
```

### Describe table structure
```sql
\d tenants
\d contacts
\d conversations
\d messages
```

### View data samples
```sql
-- Get all tenants
SELECT * FROM tenants;

-- Get all contacts for a tenant
SELECT * FROM contacts WHERE tenant_id = 'YOUR_TENANT_UUID';

-- Get all messages for a contact
SELECT * FROM messages 
WHERE contact_id = 'YOUR_CONTACT_UUID' 
ORDER BY created_at DESC;

-- Get conversation history
SELECT * FROM messages 
WHERE conversation_id = 'YOUR_CONVERSATION_UUID' 
ORDER BY created_at ASC;

-- Get message status counts
SELECT status, COUNT(*) as count FROM messages GROUP BY status;

-- Get latest messages per conversation
SELECT DISTINCT ON (conversation_id) *
FROM messages 
ORDER BY conversation_id, created_at DESC;
```

### Advanced Queries

```sql
-- Get active conversations with latest message date
SELECT c.id, c.contact_id, c.status, c.last_message_at,
       cnt.name, cnt.phone
FROM conversations c
JOIN contacts cnt ON c.contact_id = cnt.id
WHERE c.status = 'open'
ORDER BY c.last_message_at DESC;

-- Get message delivery statistics by tenant
SELECT 
  t.name as tenant,
  COUNT(*) as total_messages,
  SUM(CASE WHEN m.status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN m.status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN m.status = 'read' THEN 1 ELSE 0 END) as read,
  SUM(CASE WHEN m.status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN m.status IN ('delivered', 'read') THEN 1 ELSE 0 END) / COUNT(*), 2) as delivery_rate
FROM messages m
JOIN tenants t ON m.tenant_id = t.id
GROUP BY t.id, t.name;

-- Get message volume by date for a tenant
SELECT DATE(created_at) as date, COUNT(*) as message_count
FROM messages
WHERE tenant_id = 'YOUR_TENANT_UUID'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

### Maintenance Commands

```sql
-- Analyze and optimize tables
ANALYZE messages;
ANALYZE contacts;
ANALYZE conversations;

-- Vacuum tables to reclaim space
VACUUM FULL messages;
VACUUM FULL contacts;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Get table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup and Restore

```bash
# Full database backup
pg_dump -U whatsapp_user whatsapp_autonation > backup.sql

# Backup with compression
pg_dump -U whatsapp_user -Fc whatsapp_autonation > backup.dump

# Restore from SQL file
psql -U whatsapp_user whatsapp_autonation < backup.sql

# Restore from compressed dump
pg_restore -U whatsapp_user -d whatsapp_autonation backup.dump

# Backup specific table
pg_dump -U whatsapp_user -t messages whatsapp_autonation > messages_backup.sql
```

### Drop Database (DANGEROUS!)
```sql
-- Disconnect all users first
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'whatsapp_autonation' AND pid <> pg_backend_pid();

-- Drop database
DROP DATABASE whatsapp_autonation;

-- Drop user
DROP USER whatsapp_user;
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: 
- Start PostgreSQL: `Start-Service postgresql-x64-15` (Windows)
- Check DB_HOST and DB_PORT in .env
- Verify PostgreSQL is listening on port 5432

### Authentication Failed
```
Error: password authentication failed for user "whatsapp_user"
```
**Solution**:
- Verify credentials in .env
- Reset user password: `ALTER USER whatsapp_user WITH PASSWORD 'new_password';`

### Table Already Exists
```
Error: relation "messages" already exists
```
**Solution**:
- Set `DB_SYNCHRONIZE=false` in .env
- Or drop all tables manually:
  ```sql
  DROP TABLE IF EXISTS messages CASCADE;
  DROP TABLE IF EXISTS conversations CASCADE;
  DROP TABLE IF EXISTS contacts CASCADE;
  DROP TABLE IF EXISTS tenants CASCADE;
  ```

### Permission Denied
```
Error: permission denied for schema public
```
**Solution**:
```sql
GRANT ALL ON SCHEMA public TO whatsapp_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO whatsapp_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO whatsapp_user;
```

## Entity Relationships

```
Tenants (1)
  ├── (1:M) Contacts
  ├── (1:M) Conversations
  └── (1:M) Messages

Contacts (1)
  ├── (1:M) Conversations
  └── (1:M) Messages

Conversations (1)
  └── (1:M) Messages
```

## Next Steps

1. ✅ Database created and configured
2. ✅ Tables and indexes created
3. Create TypeORM repositories for data access
4. Build services to interact with database
5. Integrate with WhatsApp webhook for message ingestion

### Option B: Manual SQL Creation (Recommended for Production)

Connect to your database:
```bash
psql -U whatsapp_user -d whatsapp_autonation
```

Then execute the following SQL:

```sql
-- 1. Create Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "phoneNumber" VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  "messageId" VARCHAR,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Webhook Events table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventType" VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'unprocessed' CHECK (status IN ('unprocessed', 'processed', 'failed')),
  "processingError" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
  "displayName" VARCHAR,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'inactive')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Message Statuses table
CREATE TABLE message_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "messageId" VARCHAR NOT NULL,
  "phoneNumber" VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  wamid VARCHAR(50),
  error TEXT,
  "errorCode" VARCHAR(50),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  body TEXT NOT NULL,
  "headerText" VARCHAR,
  "footerText" VARCHAR,
  category VARCHAR(20) DEFAULT 'text' CHECK (category IN ('text', 'marketing', 'otp', 'transactional')),
  parameters TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  message TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  "sentCount" INT DEFAULT 0,
  "deliveredCount" INT DEFAULT 0,
  "readCount" INT DEFAULT 0,
  "failedCount" INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  "scheduledAt" TIMESTAMP,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Automations table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  "triggerType" VARCHAR(50) NOT NULL CHECK ("triggerType" IN ('webhook', 'schedule', 'manual', 'api')),
  "triggerConfig" JSONB NOT NULL,
  "actionType" VARCHAR(50) NOT NULL CHECK ("actionType" IN ('send_message', 'send_template', 'update_contact', 'http_request')),
  "actionConfig" JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  "executionCount" INT DEFAULT 0,
  "successCount" INT DEFAULT 0,
  "failureCount" INT DEFAULT 0,
  "lastTriggeredAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create all indexes for performance
CREATE INDEX idx_messages_phone ON messages("phoneNumber");
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created ON messages("createdAt");

CREATE INDEX idx_webhook_events_type ON webhook_events("eventType");
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_type_date ON webhook_events("eventType", "createdAt");

CREATE INDEX idx_contacts_phone ON contacts("phoneNumber");
CREATE INDEX idx_contacts_status ON contacts(status);

CREATE INDEX idx_message_statuses_message_id ON message_statuses("messageId");
CREATE INDEX idx_message_statuses_phone_status ON message_statuses("phoneNumber", status);

CREATE INDEX idx_templates_name ON templates(name);
CREATE INDEX idx_templates_status ON templates(status);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created ON campaigns("createdAt");

CREATE INDEX idx_automations_status ON automations(status);
CREATE INDEX idx_automations_trigger_type ON automations("triggerType");
```

## Step 4: Verify Connection

Test connection from Node.js:

```bash
npm start
```

You should see console logs indicating successful database connection.

## Database Schema Overview

| Table | Purpose | Records |
|-------|---------|---------|
| `messages` | Store all sent messages | Thousands |
| `message_statuses` | Track delivery status updates | Thousands |
| `webhook_events` | Log incoming webhook events | Thousands |
| `contacts` | Store WhatsApp contacts | Hundreds |
| `templates` | WhatsApp message templates | Tens |
| `campaigns` | Bulk message campaigns | Hundreds |
| `automations` | Automated workflows | Tens |

## Useful PostgreSQL Commands

### Connect to database
```bash
psql -U whatsapp_user -d whatsapp_autonation
```

### View all tables
```sql
\dt
```

### Check table structure
```sql
\d messages
\d contacts
```

### View table data
```sql
SELECT * FROM messages LIMIT 10;
SELECT * FROM contacts;
SELECT COUNT(*) FROM messages;
```

### Backup database
```bash
pg_dump -U whatsapp_user whatsapp_autonation > backup.sql
```

### Restore database
```bash
psql -U whatsapp_user whatsapp_autonation < backup.sql
```

### Drop all tables (DANGEROUS!)
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO whatsapp_user;
```

### Monitor active connections
```sql
SELECT pid, usename, application_name, state, state_change FROM pg_stat_activity;
```

### Optimize table (analyze and vacuum)
```sql
VACUUM ANALYZE messages;
VACUUM ANALYZE contacts;
```

## Troubleshooting

### Connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL service is running
- Check DB_HOST and DB_PORT in .env

### Authentication failed
```
Error: password authentication failed for user "whatsapp_user"
```
- Verify username and password in .env
- Check PostgreSQL pg_hba.conf configuration

### Table doesn't exist
```
Error: relation "messages" does not exist
```
- Run manual SQL setup (Option B above)
- Or set DB_SYNCHRONIZE=true temporarily in .env

### Permission denied
```
Error: permission denied for schema public
```
- Grant privileges: `GRANT ALL ON SCHEMA public TO whatsapp_user;`

## Next Steps

1. ✅ Database is created
2. ✅ All tables are created
3. Create repository interfaces for data access
4. Integrate repositories into services
5. Implement database queries

## Sample Queries

### Get all messages for a contact
```sql
SELECT * FROM messages WHERE "phoneNumber" = '+1234567890' ORDER BY "createdAt" DESC;
```

### Get message delivery statistics
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM messages;
```

### Get active campaigns
```sql
SELECT * FROM campaigns WHERE status = 'running' ORDER BY "startedAt" DESC;
```

### Get automation execution stats
```sql
SELECT 
  name,
  "executionCount",
  "successCount",
  "failureCount",
  ROUND(("successCount"::float / NULLIF("executionCount", 0) * 100), 2) as success_rate
FROM automations
ORDER BY "executionCount" DESC;
```
