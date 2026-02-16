# API Documentation - Complete WhatsApp Notification System

## Base URL
```
http://localhost:3000
```

---

## TEMPLATE ENDPOINTS

WhatsApp Message Templates with subject matter variation support by language and approval status.

**Template Entity Fields:**
- `id` (UUID): Unique identifier
- `tenant_id` (UUID): Multi-tenant isolation
- `name` (VARCHAR 100): Template name, must be unique per tenant + language
- `category` (VARCHAR 50): Template purpose - `marketing`, `utility`, `authentication`
- `language` (VARCHAR 10): Language code (default: 'en')
- `status` (VARCHAR 20): `pending`, `approved`, `rejected`
- `components` (JSONB): Template structure with body, footer, and buttons
- `created_at`, `updated_at`: Timestamps

### 1. Get All Templates
**GET** `/templates`

Retrieve all templates for a tenant with optional filters.

**Query Parameters:**
- `tenantId` (string, required): Tenant UUID
- `category` (string, optional): Filter by category (`marketing`, `utility`, `authentication`)
- `language` (string, optional): Filter by language code (e.g., 'en', 'es', 'fr')
- `status` (string, optional): Filter by approval status (`pending`, `approved`, `rejected`)

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/templates?tenantId=550e8400-e29b-41d4-a716-446655440000&category=marketing&language=en&status=approved"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440030",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Promotional Offer",
      "category": "marketing",
      "language": "en",
      "status": "approved",
      "components": {
        "body": "Hi {{firstName}}, Special offer just for you! Get {{discount}}% off on {{productName}}. Valid till {{expiryDate}}.",
        "footer": "Thank you for your business!",
        "buttons": [
          {
            "type": "url",
            "text": "Shop Now",
            "url": "{{shopLink}}"
          }
        ]
      },
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440031",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Order Confirmation",
      "category": "utility",
      "language": "en",
      "status": "approved",
      "components": {
        "body": "Hi {{customerName}}, Your order #{{orderId}} has been confirmed. Delivery time: {{deliveryTime}}. Total: {{amount}}.",
        "footer": "Thank you for ordering",
        "buttons": [
          {
            "type": "url",
            "text": "Track Order",
            "url": "{{trackingLink}}"
          }
        ]
      },
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z"
    }
  ],
  "message": "Found 2 templates"
}
```

---

### 2. Sync System Templates
**POST** `/templates/sync`

Sync pre-built system templates to a tenant's account. Only creates templates that don't already exist (preventing duplicates based on name + language).

**Request Body:**
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "marketing"
}
```

**Fields:**
- `tenantId` (string, required): Tenant UUID
- `category` (string, optional): Sync only templates from specific category. If omitted, syncs all categories (marketing, utility, authentication)

**System Template Categories:**
- **Marketing**: Promotional offers, campaigns, stock notifications
- **Utility**: Order confirmations, status updates, appointment reminders, invoices
- **Authentication**: OTP verification, password reset, account verification

**cURL Example:**
```bash
curl -X POST http://localhost:3000/templates/sync \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "category": "utility"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully synced 5 templates for tenant",
  "synced": 5,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440032",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Order Confirmation",
      "category": "utility",
      "language": "en",
      "status": "approved",
      "components": {
        "body": "Hi {{customerName}}, Your order #{{orderId}} has been confirmed. Delivery time: {{deliveryTime}}. Total: {{amount}}.",
        "footer": "Thank you for ordering",
        "buttons": [
          {
            "type": "url",
            "text": "Track Order",
            "url": "{{trackingLink}}"
          }
        ]
      },
      "createdAt": "2026-02-15T10:30:00Z",
      "updatedAt": "2026-02-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Create Template
**POST** `/templates`

Create a new custom template for a tenant. Can be used for creating custom variations or new templates beyond the system templates.

**Request Body:**
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Custom Welcome",
  "category": "marketing",
  "language": "en",
  "components": {
    "body": "Hi {{firstName}}, Welcome to {{businessName}}! We're excited to serve you.",
    "footer": "Questions? Contact us anytime",
    "buttons": [
      {
        "type": "url",
        "text": "Get Started",
        "url": "{{startLink}}"
      }
    ]
  }
}
```

**Fields:**
- `tenantId` (string, required): Tenant UUID
- `name` (string, required): Template name (max 100 chars). Must be unique per tenant + language combination
- `category` (string, optional): Category (`marketing`, `utility`, `authentication`)
- `language` (string, optional): Language code (default: 'en'). Enables multi-language support
- `components` (object, optional): Template structure with:
  - `body` (string): Main message content
  - `footer` (string, optional): Footer text
  - `buttons` (array, optional): Interactive buttons array with `type`, `text`, and optional `url`

**cURL Example:**
```bash
curl -X POST http://localhost:3000/templates \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Feedback Request",
    "category": "utility",
    "language": "en",
    "components": {
      "body": "Hi {{customerName}}, We would love your feedback on your recent order.",
      "footer": "Your feedback helps us improve",
      "buttons": [
        {
          "type": "url",
          "text": "Rate Experience",
          "url": "{{feedbackLink}}"
        }
      ]
    }
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440033",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Feedback Request",
    "category": "utility",
    "language": "en",
    "status": "pending",
    "components": {
      "body": "Hi {{customerName}}, We would love your feedback on your recent order.",
      "footer": "Your feedback helps us improve",
      "buttons": [
        {
          "type": "url",
          "text": "Rate Experience",
          "url": "{{feedbackLink}}"
        }
      ]
    },
    "createdAt": "2026-02-15T10:45:00Z",
    "updatedAt": "2026-02-15T10:45:00Z"
  },
  "message": "Template created successfully"
}
```

**Error Response (400 Bad Request - Duplicate):**
```json
{
  "statusCode": 400,
  "message": "Template with name \"Feedback Request\" and language \"en\" already exists for this tenant",
  "error": "Bad Request"
}
```

---

### 4. Get Template by ID
**GET** `/templates/:id`

Retrieve a single template by its UUID.

**Path Parameters:**
- `id` (string, required): Template UUID

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/templates/990e8400-e29b-41d4-a716-446655440030"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440030",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Promotional Offer",
    "category": "marketing",
    "language": "en",
    "status": "approved",
    "components": {
      "body": "Hi {{firstName}}, Special offer just for you! Get {{discount}}% off on {{productName}}. Valid till {{expiryDate}}.",
      "footer": "Thank you for your business!",
      "buttons": [
        {
          "type": "url",
          "text": "Shop Now",
          "url": "{{shopLink}}"
        }
      ]
    },
    "createdAt": "2026-02-15T10:00:00Z",
    "updatedAt": "2026-02-15T10:00:00Z"
  }
}
```

---

### 5. Update Template
**PATCH** `/templates/:id`

Update a template's name, category, language, components, or approval status.

**Path Parameters:**
- `id` (string, required): Template UUID

**Request Body:**
```json
{
  "status": "approved",
  "components": {
    "body": "Hi {{firstName}}, Checkout our latest {{discount}}% offer on {{productName}}!",
    "footer": "Limited time offer",
    "buttons": [
      {
        "type": "url",
        "text": "Shop Now",
        "url": "{{shopLink}}"
      }
    ]
  }
}
```

**Fields (all optional):**
- `name` (string): Updated template name
- `category` (string): Updated category
- `language` (string): Updated language
- `components` (object): Updated template components
- `status` (string): Approval status - `pending`, `approved`, or `rejected`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440033",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Feedback Request",
    "category": "utility",
    "language": "en",
    "status": "approved",
    "components": {
      "body": "Hi {{customerName}}, We would love your feedback on your recent order.",
      "footer": "Your feedback helps us improve",
      "buttons": [
        {
          "type": "url",
          "text": "Rate Experience",
          "url": "{{feedbackLink}}"
        }
      ]
    },
    "createdAt": "2026-02-15T10:45:00Z",
    "updatedAt": "2026-02-15T11:00:00Z"
  },
  "message": "Template updated successfully"
}
```

---

### 6. Delete Template
**DELETE** `/templates/:id`

Delete a custom template.

**Path Parameters:**
- `id` (string, required): Template UUID

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/templates/cc0e8400-e29b-41d4-a716-446655440033"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

## Template Structure Examples

### Marketing Template
```json
{
  "body": "Hi {{firstName}}, Get {{discount}}% off on {{productName}}. Use code {{couponCode}}.",
  "footer": "Valid until {{expiryDate}}",
  "buttons": [
    {
      "type": "url",
      "text": "Shop Now",
      "url": "{{shopLink}}"
    }
  ]
}
```

### Utility Template with Quick Reply Buttons
```json
{
  "body": "Hi {{patientName}}, Appointment reminder on {{appointmentDate}} at {{appointmentTime}} with Dr. {{doctorName}}.",
  "footer": "Reply to confirm or reschedule",
  "buttons": [
    {
      "type": "quick_reply",
      "text": "Confirm"
    },
    {
      "type": "quick_reply",
      "text": "Reschedule"
    }
  ]
}
```

### Authentication Template
```json
{
  "body": "Your verification code is: {{otp}}. This code will expire in {{expiryMinutes}} minutes.",
  "footer": "Do not share this code with anyone",
  "buttons": []
}
```

---

## Template Variables

Templates support dynamic variable substitution using `{{variableName}}` syntax:

**Common Variables:**
- Customer/User: `{{firstName}}`, `{{lastName}}`, `{{customerName}}`, `{{email}}`
- Product: `{{productName}}`, `{{productPrice}}`, `{{discount}}`
- Order: `{{orderId}}`, `{{orderAmount}}`, `{{deliveryTime}}`
- Authentication: `{{otp}}`, `{{expiryMinutes}}`, `{{resetLink}}`
- Appointment: `{{appointmentDate}}`, `{{appointmentTime}}`, `{{doctorName}}`
- Payment: `{{amount}}`, `{{invoiceNumber}}`, `{{dueDate}}`

---

## Complete API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List templates with filters |
| POST | `/templates/sync` | Sync system templates to tenant |
| POST | `/templates` | Create custom template |
| GET | `/templates/:id` | Get template by ID |
| PATCH | `/templates/:id` | Update template |
| DELETE | `/templates/:id` | Delete template |

---

## Key Features Summary

✅ **Multi-Tenant Templates**: Isolated templates per tenant with unique constraint on (tenant_id, name, language)  
✅ **Language Support**: Create template variations for different languages (en, es, fr, etc.)  
✅ **Pre-built Templates**: 10 system templates across 3 categories (Marketing, Utility, Authentication)  
✅ **Approval Workflow**: Templates start as 'pending', can be approved or rejected  
✅ **Flexible Components**: JSONB structure for body, footer, and interactive buttons  
✅ **Dynamic Variables**: Use {{variable}} placeholders for dynamic content substitution  
✅ **Easy Sync**: Single API call to sync all relevant system templates  
✅ **Full CRUD Operations**: Create, read, update, delete custom templates  
✅ **Category Organization**: Organize templates by marketing, utility, or authentication  
✅ **Filter & Search**: Query by category, language, or approval status  
