// Sample API Payloads for Testing
// This file contains sample requests for all API endpoints
// Use these payloads to test the WhatsApp Notification System

// ============================================================================
// TENANT ENDPOINTS
// ============================================================================

// 1. CREATE TENANT - POST /tenants
// Request:
{
  "name": "Acme Healthcare",
  "status": "active"
}

// Expected Response (201 Created):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Healthcare",
    "status": "active",
    "created_at": "2026-02-15T10:30:00.000Z"
  }
}

// 2. GET ALL TENANTS - GET /tenants
// No request body needed
// Query: GET /tenants

// Expected Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Healthcare",
      "status": "active",
      "created_at": "2026-02-15T10:30:00.000Z"
    }
  ]
}

// 3. GET TENANT BY ID - GET /tenants/:id
// Query: GET /tenants/550e8400-e29b-41d4-a716-446655440000

// Expected Response (200 OK):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Healthcare",
    "status": "active",
    "created_at": "2026-02-15T10:30:00.000Z"
  }
}

// 4. UPDATE TENANT - PATCH /tenants/:id
// Request:
{
  "name": "Acme Healthcare Updated",
  "status": "inactive"
}

// 5. DELETE TENANT - DELETE /tenants/:id
// Query: DELETE /tenants/550e8400-e29b-41d4-a716-446655440000

// ============================================================================
// CONTACT ENDPOINTS
// ============================================================================

// 1. CREATE CONTACT - POST /contacts
// Request:
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Smith",
  "phone": "+919876543210",
  "external_ref": "PAT-12345",
  "metadata": {
    "type": "patient",
    "age": 35,
    "department": "cardiology"
  }
}

// Expected Response (201 Created):
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Smith",
    "phone": "+919876543210",
    "external_ref": "PAT-12345",
    "metadata": {
      "type": "patient",
      "age": 35,
      "department": "cardiology"
    },
    "created_at": "2026-02-15T10:40:00.000Z",
    "updated_at": "2026-02-15T10:40:00.000Z"
  }
}

// 2. GET CONTACTS BY TENANT - GET /contacts?tenantId=:id
// Query: GET /contacts?tenantId=550e8400-e29b-41d4-a716-446655440000

// 3. GET CONTACT BY PHONE - GET /contacts?phone=:phone&tenantId=:id
// Query: GET /contacts?phone=%2B919876543210&tenantId=550e8400-e29b-41d4-a716-446655440000

// 4. GET CONTACT BY ID - GET /contacts/:id
// Query: GET /contacts/770e8400-e29b-41d4-a716-446655440002

// 5. UPDATE CONTACT - PATCH /contacts/:id
// Request:
{
  "name": "John Smith Updated",
  "metadata": {
    "type": "patient",
    "age": 36,
    "department": "neurology"
  }
}

// 6. DELETE CONTACT - DELETE /contacts/:id
// Query: DELETE /contacts/770e8400-e29b-41d4-a716-446655440002

// ============================================================================
// CONVERSATION ENDPOINTS
// ============================================================================

// 1. CREATE CONVERSATION - POST /conversations
// Request:
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "770e8400-e29b-41d4-a716-446655440002",
  "channel": "whatsapp"
}

// Expected Response (201 Created):
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440010",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "contactId": "770e8400-e29b-41d4-a716-446655440002",
    "channel": "whatsapp",
    "lastMessageAt": "2026-02-15T10:30:00Z",
    "createdAt": "2026-02-15T10:30:00Z",
    "updatedAt": "2026-02-15T10:30:00Z"
  },
  "message": "Conversation created successfully"
}

// 2. GET CONVERSATIONS BY TENANT - GET /conversations?tenantId=:id
// Query: GET /conversations?tenantId=550e8400-e29b-41d4-a716-446655440000

// 3. GET CONVERSATION BY ID - GET /conversations/:id
// Query: GET /conversations/880e8400-e29b-41d4-a716-446655440010

// 4. GET CONVERSATION WITH MESSAGES - GET /conversations/:id/messages?limit=50
// Query: GET /conversations/880e8400-e29b-41d4-a716-446655440010/messages?limit=50

// ============================================================================
// MESSAGE ENDPOINTS
// ============================================================================

// 1. SEND MESSAGE - POST /messages/send
// Request:
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "770e8400-e29b-41d4-a716-446655440002",
  "messageBody": "Hello! This is your appointment reminder.",
  "direction": "outbound",
  "metadata": {
    "appointmentId": "apt-12345",
    "reminderType": "appointment"
  }
}

// Expected Response (201 Created):
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440020",
    "conversationId": "880e8400-e29b-41d4-a716-446655440010",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "contactId": "770e8400-e29b-41d4-a716-446655440002",
    "messageBody": "Hello! This is your appointment reminder.",
    "direction": "outbound",
    "status": "queued",
    "sentAt": null,
    "deliveredAt": null,
    "readAt": null,
    "failedAt": null,
    "externalMessageId": null,
    "metadata": {
      "appointmentId": "apt-12345",
      "reminderType": "appointment"
    },
    "createdAt": "2026-02-15T10:35:00Z"
  },
  "message": "Message queued for sending"
}

// 2. GET MESSAGE BY ID - GET /messages/:id
// Query: GET /messages/990e8400-e29b-41d4-a716-446655440020

// ============================================================================
// TEMPLATE ENDPOINTS (NEW STRUCTURE)
// ============================================================================

// 1. GET ALL TEMPLATES - GET /templates
// Query: GET /templates?tenantId=550e8400-e29b-41d4-a716-446655440000&category=marketing&language=en&status=approved

// Expected Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440030",
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
  ],
  "message": "Found 1 templates"
}

// 2. SYNC SYSTEM TEMPLATES - POST /templates/sync
// Request:
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "marketing"
}

// Expected Response (201 Created):
{
  "success": true,
  "message": "Successfully synced 3 templates for tenant",
  "synced": 3,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440032",
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
      "createdAt": "2026-02-15T10:30:00Z",
      "updatedAt": "2026-02-15T10:30:00Z"
    }
  ]
}

// 3. CREATE TEMPLATE - POST /templates
// Request:
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

// Expected Response (201 Created):
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440033",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Custom Welcome",
    "category": "marketing",
    "language": "en",
    "status": "pending",
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
    },
    "createdAt": "2026-02-15T10:45:00Z",
    "updatedAt": "2026-02-15T10:45:00Z"
  },
  "message": "Template created successfully"
}

// 4. GET TEMPLATE BY ID - GET /templates/:id
// Query: GET /templates/cc0e8400-e29b-41d4-a716-446655440033

// 5. UPDATE TEMPLATE - PATCH /templates/:id
// Request:
{
  "status": "approved",
  "components": {
    "body": "Hi {{firstName}}, Welcome to {{businessName}}! We're excited to serve you.",
    "footer": "Your success is our priority",
    "buttons": [
      {
        "type": "url",
        "text": "Get Started",
        "url": "{{startLink}}"
      }
    ]
  }
}

// 6. DELETE TEMPLATE - DELETE /templates/:id
// Query: DELETE /templates/cc0e8400-e29b-41d4-a716-446655440033

// ============================================================================
// TESTING SEQUENCE
// ============================================================================
// 
// Recommended order for testing:
// 1. Create Tenant
// 2. Create Contact (using tenant ID)
// 3. Sync Templates (using tenant ID)
// 4. Create Custom Template
// 5. Create Conversation (using tenant ID and contact ID)
// 6. Send Message (using tenant ID and contact ID)
// 7. Get Conversation with Messages
//
// ============================================================================
