# Amartha WhatsApp Chatbot - Design Document

## Architecture Overview

### System Architecture (SOLID Principles)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
├──────────────────────┬──────────────────────────────────────────┤
│   WhatsApp Client    │        Web Dashboard (HTML/CSS/JS)       │
└──────────┬───────────┴──────────────────┬───────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routes     │  │ Controllers  │  │  Middleware  │          │
│  │  (Express)   │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Business Logic Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │UserService   │  │MajelisService│  │  AIService   │          │
│  │              │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │UserRepository│  │MajelisRepo   │  │  BIRepo      │          │
│  │              │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Firestore   │  │  Gemini AI   │  │ WhatsApp API │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

Each class has one reason to change:

**UserService**: User business logic only
```javascript
class UserService {
  - registerUser()
  - getUserContext()
  - updateUserStatus()
  - deleteUser()
}
```

**UserRepository**: Data access only
```javascript
class UserRepository {
  - findByPhone()
  - create()
  - update()
  - delete()
}
```

**AIService**: AI integration only
```javascript
class AIService {
  - generateResponse()
  - validateInput()
  - handleToolCalls()
}
```

### Open/Closed Principle (OCP)

Open for extension, closed for modification:

**Repository Pattern**: Add new repositories without changing existing code
```javascript
// Base Repository (abstract)
class BaseRepository {
  constructor(firestore, collection) {
    this.db = firestore;
    this.collection = collection;
  }
  
  async findById(id) { /* implementation */ }
  async findAll() { /* implementation */ }
  async create(data) { /* implementation */ }
}

// Extend for specific entities
class UserRepository extends BaseRepository {
  constructor(firestore) {
    super(firestore, 'users');
  }
  
  // User-specific methods
  async findByPhone(phone) { /* implementation */ }
}
```

### Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types:

```javascript
// Any repository can be used where BaseRepository is expected
function processEntity(repository) {
  const entity = await repository.findById(id);
  // Works with UserRepository, MajelisRepository, etc.
}
```

### Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use:

```javascript
// Separate interfaces for different concerns
interface IUserReader {
  getUserContext(phone): Promise<User>
  getAllUsers(): Promise<User[]>
}

interface IUserWriter {
  registerUser(phone, data): Promise<User>
  updateUserStatus(phone, status): Promise<User>
  deleteUser(phone): Promise<boolean>
}

// Services implement only what they need
class UserQueryService implements IUserReader { }
class UserCommandService implements IUserWriter { }
```

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:

```javascript
// High-level module depends on abstraction
class UserService {
  constructor(userRepository) {  // Depends on interface, not implementation
    this.userRepository = userRepository;
  }
}

// Dependency injection
const firestore = new Firestore();
const userRepository = new UserRepository(firestore);
const userService = new UserService(userRepository);
```

## Design Patterns

### 1. Repository Pattern

**Purpose**: Separate data access logic from business logic

**Implementation**:
```javascript
// Repository handles all Firestore operations
class UserRepository {
  async findByPhone(phone) {
    const doc = await this.db.collection('users').doc(phone).get();
    return doc.exists ? doc.data() : null;
  }
}

// Service uses repository
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async getUserContext(phone) {
    return await this.userRepository.findByPhone(phone);
  }
}
```

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic

**Implementation**:
```javascript
// Service contains business rules
class UserService {
  async registerUser(phone, data) {
    // Validation
    if (!data.name || !data.business_type) {
      throw new Error('Invalid data');
    }
    
    // Business logic
    const user = {
      ...data,
      is_verified: false,
      created_at: new Date().toISOString()
    };
    
    // Delegate to repository
    return await this.userRepository.create(phone, user);
  }
}
```

### 3. Factory Pattern

**Purpose**: Create objects without specifying exact class

**Implementation**:
```javascript
class RepositoryFactory {
  static create(type, firestore) {
    switch(type) {
      case 'user':
        return new UserRepository(firestore);
      case 'majelis':
        return new MajelisRepository(firestore);
      case 'bi':
        return new BusinessIntelligenceRepository(firestore);
      default:
        throw new Error('Unknown repository type');
    }
  }
}
```

### 4. Strategy Pattern

**Purpose**: Define family of algorithms, make them interchangeable

**Implementation**:
```javascript
// Different AI strategies
class GeminiStrategy {
  async generateResponse(prompt) {
    return await gemini.generate(prompt);
  }
}

class FallbackStrategy {
  async generateResponse(prompt) {
    return "Maaf, AI sedang gangguan.";
  }
}

// Context uses strategy
class AIService {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  async respond(message) {
    return await this.strategy.generateResponse(message);
  }
}
```

### 5. Observer Pattern

**Purpose**: Define one-to-many dependency between objects

**Implementation**:
```javascript
// Event emitter for user events
class UserEventEmitter {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

// Usage
userEvents.on('user:registered', (user) => {
  console.log(`New user: ${user.name}`);
  // Send welcome message
  // Update analytics
});
```

## Data Models

### User Model

```javascript
{
  phone: "628567881764",           // Primary key
  name: "Ibu Marsinah",
  business_type: "Warung Sembako",
  location: "Sragen",
  
  // Majelis info
  majelis_id: "majelis_123",
  majelis_name: "Majelis Sragen A",
  majelis_day: "Selasa",
  
  // Status
  is_verified: true,
  current_module: "Week 3",
  literacy_score: "Medium",
  
  // Loan info
  loan_limit: 5000000,
  loan_used: 2000000,
  loan_remaining: 3000000,
  next_payment_date: "2025-11-25T00:00:00Z",
  next_payment_amount: 150000,
  loan_history: [
    {
      id: "loan_001",
      type: "disbursement",
      amount: 2000000,
      date: "2025-10-20T00:00:00Z",
      description: "Pinjaman Tahap 1"
    }
  ],
  
  // Business intelligence
  credit_score: 75,
  credit_metrics: {
    business_health_score: 80,
    asset_score: 70,
    cashflow_score: 75,
    management_score: 70,
    growth_potential: 80,
    risk_level: "rendah",
    total_asset_value: 15000000,
    total_inventory_value: 8000000,
    estimated_monthly_cashflow: 2000000,
    recommended_loan_amount: 5000000,
    last_updated: "2025-11-23T00:00:00Z",
    data_points: 3
  },
  
  // Timestamps
  created_at: "2025-11-22T10:00:00Z",
  updated_at: "2025-11-23T10:00:00Z"
}
```

### Majelis Model

```javascript
{
  id: "majelis_123",              // Auto-generated
  name: "Majelis Sragen A",
  description: "Kelompok UMKM Sragen",
  schedule_day: "Selasa",
  schedule_time: "10:00",
  location: "Balai Desa Sragen",
  members: [
    "628567881764",
    "628567881765"
  ],
  created_at: "2025-11-22T10:00:00Z",
  updated_at: "2025-11-23T10:00:00Z"
}
```

### Business Intelligence Model

```javascript
{
  id: "bi_001",                   // Auto-generated
  user_phone: "628567881764",
  category: "building",           // building, inventory, financial_records
  confidence: 0.95,
  
  extracted_data: {
    estimated_value: 10000000,
    condition: "baik",
    size_estimate: "5x8 meter",
    features: ["etalase", "rak", "meja kasir"]
  },
  
  credit_metrics: {
    business_health_score: 80,
    asset_score: 75,
    cashflow_score: 70,
    management_score: 75,
    growth_potential: 80
  },
  
  insights: [
    "Toko dalam kondisi baik",
    "Lokasi strategis",
    "Penataan rapi"
  ],
  
  recommendations: [
    "Pertahankan kebersihan toko",
    "Tambah pencahayaan",
    "Update signage"
  ],
  
  user_business_type: "Warung Sembako",
  user_location: "Sragen",
  
  // Image data (for building and inventory only)
  image_data: "base64_encoded_string",
  image_id: "whatsapp_image_id",
  has_image: true,
  
  analyzed_at: "2025-11-23T10:00:00Z"
}
```

## API Design

### RESTful Endpoints

#### User Management

```
GET    /api/users              - Get all users
GET    /api/users/:phone       - Get user by phone
POST   /api/users              - Create user (not used, registration via WhatsApp)
PUT    /api/users/:phone       - Update user
DELETE /api/users/:phone       - Delete user
POST   /api/users/verify       - Verify user status

GET    /api/users/:phone/images - Get user business images
```

#### Majelis Management

```
GET    /api/majelis            - Get all majelis
GET    /api/majelis/:id        - Get majelis by ID
POST   /api/majelis            - Create majelis
PUT    /api/majelis/:id        - Update majelis
DELETE /api/majelis/:id        - Delete majelis

POST   /api/majelis/:id/members        - Add member
DELETE /api/majelis/:id/members/:phone - Remove member
```

#### Business Types

```
GET    /api/business-types     - Get all business classifications
GET    /api/business-types/:id - Get business type by ID
```

#### Financial Literacy

```
GET    /api/financial-literacy - Get all modules
GET    /api/financial-literacy/:id - Get module by ID
```

### Request/Response Examples

#### Register User (via WhatsApp)

**Request**:
```
User Message: "Nama saya Ibu Siti, usaha warung sembako di Bogor"
```

**AI Processing**:
```javascript
{
  tool_call: "registerUser",
  arguments: {
    name: "Ibu Siti",
    business_type: "Warung Sembako",
    location: "Bogor"
  }
}
```

**Response**:
```
"Terima kasih Ibu Siti! Data Anda sudah kami terima:
✅ Nama: Ibu Siti
✅ Usaha: Warung Sembako
✅ Lokasi: Bogor

Mohon tunggu verifikasi dari Petugas Lapangan (BP) kami ya. Setelah diverifikasi, Ibu bisa akses semua fitur Akademi-AI! 🎓"
```

#### Verify User (via Dashboard)

**Request**:
```http
POST /api/users/verify
Content-Type: application/json

{
  "phone": "628567881764",
  "status": true
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "phone": "628567881764",
    "name": "Ibu Siti",
    "is_verified": true,
    ...
  }
}
```

## Security Design

### Input Validation

```javascript
class InputValidator {
  static validateMessage(text) {
    // Length check
    if (text.length > 1000) {
      throw new ValidationError('Message too long');
    }
    
    // Spam detection
    if (/(.)\1{10,}/.test(text)) {
      throw new ValidationError('Spam detected');
    }
    
    // URL detection
    if (/(https?:\/\/|www\.)/gi.test(text)) {
      throw new ValidationError('URLs not allowed');
    }
    
    return true;
  }
}
```

### Topic Filtering

```javascript
class TopicFilter {
  static BLOCKED_TOPICS = [
    'politik', 'pilpres', 'pemilu',
    'agama', 'aliran', 'kepercayaan',
    'gosip', 'artis', 'selebriti'
  ];
  
  static isAllowed(text) {
    const lowerText = text.toLowerCase();
    return !this.BLOCKED_TOPICS.some(topic => 
      lowerText.includes(topic)
    );
  }
}
```

### Authentication

```javascript
// WhatsApp webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
```

## Error Handling

### Error Hierarchy

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class AIError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}
```

### Error Handling Middleware

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.isOperational) {
    res.status(err.statusCode).json({
      error: err.message
    });
  } else {
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});
```

## Testing Strategy

### Unit Tests

```javascript
describe('UserService', () => {
  it('should register new user', async () => {
    const mockRepo = {
      create: jest.fn().mockResolvedValue({ phone: '628xxx', name: 'Test' })
    };
    
    const service = new UserService(mockRepo);
    const result = await service.registerUser('628xxx', { name: 'Test' });
    
    expect(result.name).toBe('Test');
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

### Integration Tests

```bash
# Test API endpoints
curl -X POST $BASE_URL/api/users/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"628xxx","status":true}'
```

### End-to-End Tests

```bash
# Test full user flow
1. Send WhatsApp message (registration)
2. Check Firestore for user creation
3. Verify via dashboard API
4. Send WhatsApp message (query)
5. Check response
```

## Performance Optimization

### Caching Strategy

```javascript
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }
}
```

### Database Optimization

```javascript
// Index strategy
users: {
  indexes: [
    { field: 'phone', unique: true },
    { field: 'is_verified' },
    { field: 'majelis_id' },
    { field: 'created_at' }
  ]
}

// Query optimization
const users = await db.collection('users')
  .where('is_verified', '==', false)
  .orderBy('created_at', 'desc')
  .limit(50)
  .get();
```

## Deployment Design

### CI/CD Pipeline

```
Code Push → GitHub
    ↓
Run Tests (Jest)
    ↓
Build Docker Image
    ↓
Push to Artifact Registry
    ↓
Deploy to Cloud Run
    ↓
Run Integration Tests
    ↓
Health Check
    ↓
Success ✅
```

### Environment Configuration

```javascript
// config/environment.js
module.exports = {
  development: {
    port: 8080,
    logLevel: 'debug',
    aiTimeout: 30000
  },
  production: {
    port: process.env.PORT || 8080,
    logLevel: 'info',
    aiTimeout: 10000
  }
};
```

---

**Version**: 1.0  
**Last Updated**: 2025-11-23  
**Status**: Active Development
