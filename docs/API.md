# API Documentation

Complete REST API reference for Amartha WhatsApp Chatbot.

## Base URL

**Production**: `https://whatsapp-bot-435783355893.asia-southeast2.run.app`

## Authentication

Currently, the API does not require authentication. In production, implement:
- API key authentication
- JWT tokens for dashboard
- Role-based access control

## Endpoints

### Health Check

#### GET /health

Check if the service is running.

**Response**
```
200 OK
🤖 Akademi-AI (Modular) is Online!
```

---

### WhatsApp Webhook

#### GET /webhook

Verify webhook with WhatsApp.

**Query Parameters**
- `hub.mode` (string) - Should be "subscribe"
- `hub.verify_token` (string) - Your verification token
- `hub.challenge` (string) - Challenge string to echo back

**Response**
```
200 OK
<challenge_string>
```

#### POST /webhook

Receive incoming WhatsApp messages.

**Request Body**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "628567881764",
          "type": "text",
          "text": {
            "body": "Halo, saya mau daftar"
          }
        }]
      }
    }]
  }]
}
```

**Response**
```
200 OK
```

---

### User Management

#### GET /api/users

Get all registered users.

**Response**
```json
[
  {
    "phone": "628567881764",
    "name": "Ibu Marsinah",
    "business_type": "Warung Sembako",
    "location": "Sragen",
    "majelis_id": "majelis_123",
    "majelis_name": "Majelis Sragen A",
    "majelis_day": "Selasa",
    "is_verified": true,
    "loan_limit": 5000000,
    "loan_used": 2000000,
    "loan_remaining": 3000000,
    "next_payment_date": "2025-11-25T00:00:00Z",
    "next_payment_amount": 150000,
    "loan_history": [...],
    "created_at": "2025-11-22T10:00:00Z"
  }
]
```

#### POST /api/users/verify

Verify or reject a user.

**Request Body**
```json
{
  "phone": "628567881764",
  "status": true
}
```

**Response**
```json
{
  "success": true,
  "user": {
    "phone": "628567881764",
    "name": "Ibu Marsinah",
    "is_verified": true,
    ...
  }
}
```

**Error Response**
```json
{
  "error": "User not found"
}
```

#### DELETE /api/users/:phone

Delete a user.

**Parameters**
- `phone` (string) - User's phone number

**Response**
```json
{
  "success": true,
  "message": "User deleted"
}
```

**Error Response**
```json
{
  "error": "User not found"
}
```

---

### Majelis Management

#### GET /api/majelis

Get all Majelis groups.

**Response**
```json
[
  {
    "id": "majelis_123",
    "name": "Majelis Sragen A",
    "description": "Kelompok UMKM Sragen",
    "schedule_day": "Selasa",
    "schedule_time": "10:00",
    "location": "Balai Desa Sragen",
    "members": ["628567881764", "628567881765"],
    "created_at": "2025-11-22T10:00:00Z",
    "updated_at": "2025-11-22T10:00:00Z"
  }
]
```

#### GET /api/majelis/:id

Get a single Majelis.

**Parameters**
- `id` (string) - Majelis ID

**Response**
```json
{
  "id": "majelis_123",
  "name": "Majelis Sragen A",
  "description": "Kelompok UMKM Sragen",
  "schedule_day": "Selasa",
  "schedule_time": "10:00",
  "location": "Balai Desa Sragen",
  "members": ["628567881764", "628567881765"],
  "created_at": "2025-11-22T10:00:00Z",
  "updated_at": "2025-11-22T10:00:00Z"
}
```

#### POST /api/majelis

Create a new Majelis.

**Request Body**
```json
{
  "name": "Majelis Sragen B",
  "description": "Kelompok UMKM Sragen Wilayah B",
  "schedule_day": "Rabu",
  "schedule_time": "14:00",
  "location": "Balai Desa Sragen",
  "members": []
}
```

**Response**
```json
{
  "success": true,
  "majelis": {
    "id": "generated_id",
    "name": "Majelis Sragen B",
    ...
  }
}
```

#### PUT /api/majelis/:id

Update a Majelis.

**Parameters**
- `id` (string) - Majelis ID

**Request Body**
```json
{
  "name": "Majelis Sragen B (Updated)",
  "schedule_time": "15:00"
}
```

**Response**
```json
{
  "success": true,
  "majelis": {
    "id": "majelis_123",
    "name": "Majelis Sragen B (Updated)",
    ...
  }
}
```

#### DELETE /api/majelis/:id

Delete a Majelis.

**Parameters**
- `id` (string) - Majelis ID

**Response**
```json
{
  "success": true,
  "message": "Majelis deleted"
}
```

#### POST /api/majelis/:id/members

Add a member to Majelis.

**Parameters**
- `id` (string) - Majelis ID

**Request Body**
```json
{
  "phone": "628567881764"
}
```

**Response**
```json
{
  "success": true,
  "majelis": {
    "id": "majelis_123",
    "members": ["628567881764", "628567881765"],
    ...
  }
}
```

**Error Response (Already in another Majelis)**
```json
{
  "error": "User already belongs to another Majelis",
  "currentMajelisId": "majelis_456"
}
```

#### DELETE /api/majelis/:id/members/:phone

Remove a member from Majelis.

**Parameters**
- `id` (string) - Majelis ID
- `phone` (string) - User's phone number

**Response**
```json
{
  "success": true,
  "majelis": {
    "id": "majelis_123",
    "members": ["628567881765"],
    ...
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 403 | Forbidden (webhook verification failed) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:
- 100 requests per minute per IP
- 1000 requests per hour per user

## Webhooks

### WhatsApp Message Events

The bot processes these message types:
- **text** - Regular text messages
- **image** - Photos with optional caption
- **audio/voice** - Not supported (returns error message)
- **other** - Not supported (returns error message)

### Message Flow

1. WhatsApp sends message to `/webhook`
2. Bot validates and processes message
3. AI generates response
4. Bot sends reply via WhatsApp API
5. Returns 200 OK to WhatsApp

## Testing

### cURL Examples

**Get all users**
```bash
curl https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/users
```

**Verify a user**
```bash
curl -X POST https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/users/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "628567881764", "status": true}'
```

**Create Majelis**
```bash
curl -X POST https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/majelis \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Majelis Test",
    "schedule_day": "Senin",
    "schedule_time": "10:00",
    "location": "Test Location"
  }'
```

**Add member to Majelis**
```bash
curl -X POST https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/majelis/MAJELIS_ID/members \
  -H "Content-Type: application/json" \
  -d '{"phone": "628567881764"}'
```

## Best Practices

1. **Always check response status codes**
2. **Handle errors gracefully**
3. **Validate input before sending**
4. **Use proper phone number format** (e.g., 628567881764)
5. **Don't expose sensitive data in logs**
6. **Implement retry logic for failed requests**

## Future Enhancements

- [ ] API key authentication
- [ ] Rate limiting
- [ ] Pagination for large datasets
- [ ] Filtering and sorting
- [ ] Bulk operations
- [ ] Webhook signatures for security
- [ ] GraphQL API option
