# Architecture Documentation

System architecture and design documentation for Amartha WhatsApp Chatbot.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interfaces                          │
├──────────────────────┬──────────────────────────────────────────┤
│   WhatsApp Users     │        Field Agents (Dashboard)          │
│   (UMKM Members)     │        (Web Browser)                     │
└──────────┬───────────┴──────────────────┬───────────────────────┘
           │                               │
           │ Messages                      │ HTTP Requests
           ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WhatsApp Business API                         │
│                    (Meta Platform)                               │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Webhook
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Server                           │
│                      (Google Cloud Run)                          │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Webhook    │  │  Dashboard   │  │   REST API   │          │
│  │   Handler    │  │   Routes     │  │   Endpoints  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│         ┌──────────────────┴──────────────────┐                 │
│         │                                      │                  │
│  ┌──────▼───────┐  ┌──────────────┐  ┌───────▼──────┐          │
│  │  AI Engine   │  │   Database   │  │    Image     │          │
│  │   Module     │  │    Module    │  │   Analyzer   │          │
│  └──────┬───────┘  └──────┬───────┘  └───────┬──────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Gemini AI     │  │   Firestore     │  │  Gemini Vision  │
│  (Text Model)   │  │   Database      │  │  (Image Model)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Component Architecture

### 1. Express Server (`index.js`)

**Responsibilities**:
- HTTP server and routing
- Webhook verification and handling
- Static file serving (dashboard)
- API endpoint management
- CORS configuration

**Key Routes**:
```javascript
GET  /health              // Health check
GET  /webhook             // WhatsApp verification
POST /webhook             // Message processing
GET  /                    // User dashboard
GET  /majelis             // Majelis dashboard
GET  /api/users           // User management
POST /api/users/verify    // User verification
GET  /api/majelis         // Majelis management
POST /api/majelis         // Create Majelis
```

### 2. AI Engine (`src/aiEngine.js`)

**Responsibilities**:
- Gemini AI integration
- Conversation management
- Tool calling (user registration)
- Input validation and spam detection
- Context-aware prompting

**Flow**:
```
User Message
    ↓
Input Validation (spam, length, content)
    ↓
Get User Context (from Firestore)
    ↓
Build System Prompt (personalized)
    ↓
Send to Gemini AI
    ↓
Handle Tool Calls (if any)
    ↓
Return Response
```

**Tool Calling**:
```javascript
registerUser({
  name: "Ibu Siti",
  business_type: "Warung Sembako",
  location: "Bogor"
})
```

### 3. Database Module (`src/db.js`)

**Responsibilities**:
- Firestore connection management
- User CRUD operations
- Majelis CRUD operations
- Loan data management
- Member assignment validation

**Collections**:

#### `users`
```javascript
{
  phone: "628567881764",           // Document ID
  name: "Ibu Marsinah",
  business_type: "Warung Sembako",
  location: "Sragen",
  majelis_id: "majelis_123",
  majelis_name: "Majelis Sragen A",
  majelis_day: "Selasa",
  is_verified: true,
  loan_limit: 5000000,
  loan_used: 2000000,
  loan_remaining: 3000000,
  next_payment_date: "2025-11-25T00:00:00Z",
  next_payment_amount: 150000,
  loan_history: [...],
  created_at: "2025-11-22T10:00:00Z"
}
```

#### `majelis`
```javascript
{
  id: "auto_generated_id",         // Document ID
  name: "Majelis Sragen A",
  description: "Kelompok UMKM Sragen",
  schedule_day: "Selasa",
  schedule_time: "10:00",
  location: "Balai Desa Sragen",
  members: ["628567881764", "628567881765"],
  created_at: "2025-11-22T10:00:00Z",
  updated_at: "2025-11-22T10:00:00Z"
}
```

### 4. Image Analyzer (`src/imageAnalyzer.js`)

**Responsibilities**:
- WhatsApp image download
- Gemini Vision integration
- Image classification
- Business relevance detection
- Structured data extraction

**Flow**:
```
WhatsApp Image Message
    ↓
Get Image ID
    ↓
Download from WhatsApp API
    ↓
Convert to Base64
    ↓
Send to Gemini Vision
    ↓
Classify & Extract Data
    ↓
Return Analysis
```

**Image Categories**:
- Business building/storefront
- Inventory/stock
- Financial records (ledger, receipts)
- Irrelevant (personal photos)

### 5. WhatsApp Client (`src/whatsapp.js`)

**Responsibilities**:
- Send messages to WhatsApp
- Format message payloads
- Handle API errors
- Retry logic

### 6. Knowledge Base (`src/knowledge.js`)

**Responsibilities**:
- Store Amartha curriculum
- Keyword-based retrieval
- Financial literacy content
- Business tips and advice

## Data Flow Diagrams

### User Registration Flow

```
User sends: "Nama saya Ibu Siti, usaha warung, Bogor"
    ↓
Webhook receives message
    ↓
AI Engine validates input
    ↓
Check if user exists (Firestore)
    ↓
User not found → New user flow
    ↓
Gemini extracts: name, business, location
    ↓
Gemini calls registerUser tool
    ↓
Database creates user document
    ↓
AI Engine confirms registration
    ↓
Send reply: "Terima kasih Ibu Siti..."
```

### Message Processing Flow

```
WhatsApp Message
    ↓
POST /webhook
    ↓
Extract: sender, message type, content
    ↓
┌─────────┴─────────┐
│                   │
Text Message    Image Message
│                   │
↓                   ↓
AI Engine       Image Analyzer
│                   │
↓                   ↓
Get User Context    Download Image
│                   │
↓                   ↓
Validate Input      Analyze with Vision
│                   │
↓                   ↓
Generate Response   Extract Insights
│                   │
└─────────┬─────────┘
          ↓
    Send to WhatsApp
```

### Dashboard Data Flow

```
Browser Request
    ↓
GET /api/users or /api/majelis
    ↓
Query Firestore
    ↓
Transform data
    ↓
Return JSON
    ↓
JavaScript renders UI
    ↓
User interacts (approve, delete, etc.)
    ↓
POST/PUT/DELETE request
    ↓
Update Firestore
    ↓
Return updated data
    ↓
UI refreshes
```

## Security Architecture

### Input Validation

```javascript
// Spam Detection
- Repeated characters (>10 times)
- Only special characters (>20 chars)
- URLs and links
- Message length (max 1000 chars)

// Topic Filtering
- Politics → Reject
- Religion → Reject
- Gossip → Reject
- Personal questions → Reject
```

### Authentication Layers

```
┌─────────────────────────────────────┐
│  WhatsApp Business API              │
│  - Webhook signature verification   │
│  - Token-based authentication       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Express Server                     │
│  - CORS configuration               │
│  - Input validation                 │
│  - Rate limiting (TODO)             │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Firestore                          │
│  - Security rules                   │
│  - IAM permissions                  │
│  - Audit logging                    │
└─────────────────────────────────────┘
```

## Deployment Architecture

### Google Cloud Run

```
┌─────────────────────────────────────────────┐
│           Cloud Run Service                 │
├─────────────────────────────────────────────┤
│  Container: whatsapp-bot:latest             │
│  Region: asia-southeast2 (Jakarta)          │
│  Memory: 512MB (configurable)               │
│  CPU: 1 (configurable)                      │
│  Min Instances: 0 (scales to zero)          │
│  Max Instances: 100                         │
│  Concurrency: 80 requests per instance      │
│  Timeout: 300 seconds                       │
└─────────────────────────────────────────────┘
```

### Container Structure

```
Dockerfile (Multi-stage build)
    ↓
Stage 1: Build
- Node.js 18 Alpine
- Copy package files
- Install dependencies
    ↓
Stage 2: Production
- Node.js 18 Alpine
- Copy app files
- Copy node_modules
- Expose port 8080
- Run: node index.js
```

### Artifact Registry

```
asia-southeast2-docker.pkg.dev/
  └── stellar-zoo-478021-v8/
      └── whatsapp-bot-repo/
          └── whatsapp-bot:latest
```

## Scalability Design

### Horizontal Scaling

Cloud Run automatically scales based on:
- Request volume
- CPU usage
- Memory usage
- Custom metrics

```
1 request  → 1 instance
100 requests → 2-3 instances
1000 requests → 10-15 instances
```

### Database Scaling

Firestore automatically scales:
- No connection pooling needed
- Unlimited concurrent connections
- Auto-sharding for large collections
- Global distribution

### Caching Strategy

```
┌─────────────────────────────────────┐
│  Application Memory Cache           │
│  - User context (5 min TTL)        │
│  - Knowledge base (static)          │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Firestore (Source of Truth)        │
│  - User profiles                    │
│  - Majelis data                     │
│  - Transaction history              │
└─────────────────────────────────────┘
```

## Performance Optimization

### Response Time Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Text message | <2s | ~1.5s |
| Image analysis | <10s | ~8s |
| API request | <500ms | ~300ms |
| Dashboard load | <1s | ~800ms |

### Optimization Techniques

1. **Lazy Loading**: Load dashboard data on demand
2. **Pagination**: Limit query results (TODO)
3. **Caching**: Cache user context in memory
4. **Compression**: Gzip responses
5. **CDN**: Serve static assets (TODO)
6. **Connection Pooling**: Reuse Firestore connections
7. **Batch Operations**: Group database writes

## Monitoring and Observability

### Logging Strategy

```javascript
// Structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  service: 'whatsapp-bot',
  event: 'user_registered',
  phone: '628xxx',
  name: 'Ibu Siti'
}));
```

### Metrics to Track

- **Request metrics**: Count, latency, errors
- **User metrics**: Registrations, verifications, active users
- **AI metrics**: Token usage, response time, errors
- **Database metrics**: Read/write operations, latency
- **Business metrics**: Messages per day, conversion rate

### Error Handling

```
Error Occurs
    ↓
Log error with context
    ↓
Return user-friendly message
    ↓
Increment error counter
    ↓
Alert if threshold exceeded
```

## Future Architecture Enhancements

### Phase 2: Advanced Features

1. **Redis Cache**: Add Redis for session management
2. **Message Queue**: Use Pub/Sub for async processing
3. **CDN**: CloudFlare for static assets
4. **Load Balancer**: Multi-region deployment
5. **API Gateway**: Rate limiting and authentication

### Phase 3: Microservices

```
┌─────────────────────────────────────────────┐
│           API Gateway                       │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    ↓         ↓         ↓         ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ User   │ │ AI     │ │ Image  │ │ Majelis│
│Service │ │Service │ │Service │ │Service │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Phase 4: Machine Learning

1. **Custom Models**: Train on Amartha data
2. **Recommendation Engine**: Personalized tips
3. **Fraud Detection**: Anomaly detection
4. **Sentiment Analysis**: User satisfaction tracking

## Technology Decisions

### Why Node.js?
- Fast I/O for webhook handling
- Large ecosystem (npm packages)
- Easy integration with Google APIs
- Good for real-time applications

### Why Firestore?
- Serverless (no management)
- Auto-scaling
- Real-time updates
- Good for document-based data
- Integrated with GCP

### Why Cloud Run?
- Serverless (pay per use)
- Auto-scaling (0 to 100 instances)
- Easy deployment
- Built-in HTTPS
- No infrastructure management

### Why Gemini?
- Multimodal (text + vision)
- Tool calling support
- Good Indonesian language support
- Competitive pricing
- Fast response time

## Disaster Recovery

### Backup Strategy

```
Daily: Firestore export to Cloud Storage
Weekly: Full system backup
Monthly: Disaster recovery test
```

### Recovery Procedures

1. **Service Down**: Rollback to previous Cloud Run revision
2. **Data Loss**: Restore from Firestore backup
3. **API Outage**: Switch to fallback responses
4. **Security Breach**: Rotate all tokens, audit logs

---

**Last Updated**: November 22, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
