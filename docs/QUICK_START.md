# WhatsApp Notifier - Quick Start Guide

## System Overview

A **multi-tenant WhatsApp notification platform** built with NestJS, PostgreSQL, and TypeORM.

**Version**: 1.0.0  
**Status**: ✅ Beta - Core APIs fully functional  
**Server**: localhost:3000  

---

## 1. Installation & Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation Steps

```bash
# Clone repository
cd e:\WhatsApp-Notifier\WhatsAppAutoNotifier

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Build application
npm run build

# Start server
node dist/main.js
```

**Environment Variables** (.env):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=whatsapp_automation
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

---

## 2. Core Entities

### Tenant
- Represents an organization/business
- Isolates data for multi-tenancy
- Parent for all other entities

### Contact
- Customer/patient information
- Unique by (tenant_id, phone)
- Stores metadata (age, type, department, etc.)

### Conversation
- Message thread with a contact
- Tracks conversation state (open/closed)
- Groups related messages

### Message
- Individual message records
- Tracks lifecycle: queued → sent → delivered → read
- Supports types: text, template, image, doc

### Template
- WhatsApp approved message templates
- Organized by category: marketing, utility, authentication
- Supports variable substitution

---

## 3. API Endpoints

### Tenants
```
POST   /tenants                    # Create tenant
GET    /tenants                    # List all tenants
GET    /tenants/:id                # Get tenant by ID
PATCH  /tenants/:id                # Update tenant
DELETE /tenants/:id                # Delete tenant
```

### Contacts
```
POST   /contacts                   # Create contact
GET    /contacts/:phone            # Get contact by phone
GET    /contacts/tenant/:tenantId  # Get contacts by tenant
GET    /contacts/:id               # Get contact by ID
PATCH  /contacts/:id               # Update contact
DELETE /contacts/:id               # Delete contact
```

### Conversations
```
POST   /conversations                  # Create conversation
GET    /conversations/tenant/:tenantId # List by tenant
GET    /conversations/:id              # Get conversation
GET    /conversations/:id/messages     # Get with messages
DELETE /conversations/:id              # Delete conversation
```

### Messages
```
POST   /messages/send        # Send message
GET    /messages/:id         # Get message by ID
```

### Templates
```
GET    /templates                 # Get all (with filters)
POST   /templates/sync            # Sync system templates
POST   /templates                 # Create custom template
GET    /templates/:id             # Get template by ID
PATCH  /templates/:id             # Update template
DELETE /templates/:id             # Delete template
```

---

## 4. Quick API Examples

### Create a Tenant

**Request**:
```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Business","status":"active"}'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Your Business",
    "status": "active",
    "created_at": "2026-02-15T10:30:00.000Z"
  }
}
```

### Create a Contact

**Request**:
```bash
curl -X POST http://localhost:3000/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone": "+919876543210",
    "metadata": {"type":"customer","status":"active"}
  }'
```

### Send a Message

**Request**:
```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "contactId": "e29b-41d4-a716-550e8400",
    "message": "Hello! This is a test message",
    "type": "text"
  }'
```

### Get Templates

**Request**:
```bash
curl "http://localhost:3000/templates?tenantId=550e8400-e29b-41d4-a716-446655440000"
```

### Sync System Templates

**Request**:
```bash
curl -X POST http://localhost:3000/templates/sync \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"550e8400-e29b-41d4-a716-446655440000"}'
```

---

## 5. Data Model

```
Tenant (1)
  ↓
  ├─→ Contact (M)
  │    ↓
  │    └─→ Conversation (M)
  │         ↓
  │         └─→ Message (M)
  │
  ├─→ Template (M)
  │
  └─→ Message (M - also direct relationship)
```

### Key Relationships

```sql
-- Contacts belong to Tenants (unique per phone)
ALTER TABLE contacts ADD UNIQUE (tenant_id, phone);

-- Conversations group Contacts
ALTER TABLE conversations ADD FOREIGN KEY (tenant_id, contact_id) → Tenant, Contact;

-- Messages track conversation history
ALTER TABLE messages ADD FOREIGN KEY (conversation_id) → Conversation;

-- Templates belong to Tenants (unique per name+language)
ALTER TABLE templates ADD UNIQUE (tenant_id, name, language);
```

---

## 6. System Templates

**10 Pre-built Templates** available after sync:

### Marketing (3)
- **Promotional Offer**: Hi {{firstName}}, Get {{discount}}% off on {{productName}}!
- **Campaign Announcement**: {{campaignName}} is live now!
- **Back in Stock**: {{productName}} is back in stock!

### Utility (5)
- **Order Confirmation**: Order #{{orderId}} confirmed for {{amount}}
- **Order Status Update**: Your order is {{status}}
- **Appointment Reminder**: Appointment on {{date}} at {{time}}
- **Invoice**: Invoice #{{invoiceId}} for {{amount}}
- **Payment Reminder**: Payment due for {{orderId}}

### Authentication (2)
- **OTP Verification**: Your OTP is {{otp}}. Valid for {{minutes}} minutes.
- **Account Verification**: Click {{link}} to verify your account.

---

## 7. Field Naming Convention

The API supports **flexible field naming**:

**Input (API Requests)**: camelCase
```json
{"tenantId": "...", "contactId": "..."}
```

**Output (API Responses)**: snake_case (database native)
```json
{"tenant_id": "...", "contact_id": "..."}
```

**Internal Conversion**: Handled automatically by `@Transform` decorators

---

## 8. Error Handling

### Common Error Responses

**400 Bad Request** - Missing required field:
```json
{
  "statusCode": 400,
  "message": "Message content is required",
  "error": "Bad Request"
}
```

**404 Not Found** - Resource doesn't exist:
```json
{
  "statusCode": 404,
  "message": "Tenant with ID xyz not found"
}
```

**500 Internal Server Error** - Server issue:
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 9. Development Workflow

### Code Structure
```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── config/
│   └── database.config.ts     # TypeORM configuration
├── database/
│   └── entities/
│       ├── tenant.entity.ts
│       ├── contact.entity.ts
│       ├── conversation.entity.ts
│       ├── message.entity.ts
│       └── template.entity.ts
├── tenant/                    # Tenant module
├── contact/                   # Contact module
├── conversation/              # Conversation module
├── message/                   # Message module
└── template/                  # Template module
```

### Running Development Server

```bash
# Watch mode (auto-rebuild on changes)
npm run start:dev

# Production build
npm run build
node dist/main.js

# Running tests
npm run test
npm run test:e2e
```

---

## 10. Next Steps

### Immediate Tasks
1. ✅ Core APIs complete and tested
2. [ ] Integrate WhatsApp Business API
3. [ ] Implement webhook for incoming messages
4. [ ] Add authentication (JWT/OAuth)

### Medium Term
- [ ] Add message scheduling
- [ ] Implement delivery reports
- [ ] Create admin dashboard
- [ ] Add rate limiting

### Long Term
- [ ] Analytics and reporting
- [ ] A/B testing for templates
- [ ] Machine learning insights
- [ ] SMS fallback channel

---

## 11. Support & Documentation

- **API Test Results**: [API_TEST_RESULTS.md](./API_TEST_RESULTS.md)
- **Sample Payloads**: [SAMPLE_PAYLOADS.md](./SAMPLE_PAYLOADS.md)
- **Endpoints Reference**: [API_ENDPOINTS.md](./API_ENDPOINTS.md)

---

## 12. Troubleshooting

### Server won't start
```bash
# Check database connection
psql -U postgres -d whatsapp_automation -c "SELECT 1"

# Verify environment variables
cat .env | grep DB_

# Check port availability
netstat -ano | findstr :3000
```

### Database sync issues
```bash
# Force resync (careful: deletes all data)
# Set DB_SYNCHRONIZE=true in .env
npm run build
node dist/main.js
```

### Cannot find module errors
```bash
# Rebuild TypeScript
npm run build

# Clear compiled output
rm -rf dist/
npm run build
```

---

## Contact & Issues

- Issues/Bugs: [GitHub Issues]
- Documentation: [docs/](./docs/)
- API Status: Running at localhost:3000 ✅

