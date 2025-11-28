# Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP Request                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Routes Layer                           │
│  (URL mapping, middleware attachment)                    │
│  • userRoutes.js                                         │
│  • majelisRoutes.js                                      │
│  • webhookRoutes.js                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Controllers Layer                        │
│  (Request/response handling, validation)                 │
│  • UserController                                        │
│  • MajelisController                                     │
│  • WebhookController                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Services Layer                          │
│  (Business logic, orchestration)                         │
│  • UserService                                           │
│  • MajelisService                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Repositories Layer                        │
│  (Data access, database operations)                      │
│  • UserRepository                                        │
│  • MajelisRepository                                     │
│  • BusinessIntelligenceRepository                        │
│  • RAGRepository                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Core Layer                              │
│  (Domain models, entities)                               │
│  • User                                                  │
│  • Majelis                                               │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Config Layer                             │
│  (Database, constants, configuration)                    │
│  • database.js                                           │
│  • constants.js                                          │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Google Cloud Firestore                      │
└─────────────────────────────────────────────────────────┘
```

## SOLID Principles Implementation

This codebase follows SOLID principles for maintainability and scalability.

### Directory Structure

```
src/
├── config/              # Configuration & constants
│   ├── database.js      # Firestore initialization
│   ├── constants.js     # Collection names
│   └── mockData.js      # Test data
├── core/                # Domain models
│   ├── User.js          # User entity & factory
│   └── Majelis.js       # Majelis entity & factory
├── repositories/        # Data access layer (Dependency Inversion)
│   ├── UserRepository.js
│   ├── MajelisRepository.js
│   ├── BusinessIntelligenceRepository.js
│   └── RAGRepository.js
├── services/            # Business logic (Single Responsibility)
│   ├── UserService.js
│   └── MajelisService.js
├── controllers/         # Request handlers
│   ├── UserController.js
│   ├── MajelisController.js
│   └── WebhookController.js
├── routes/              # Route definitions (Interface Segregation)
│   ├── userRoutes.js
│   ├── majelisRoutes.js
│   ├── webhookRoutes.js
│   ├── superadminRoutes.js
│   └── ragRoutes.js
└── chatbot/             # Chatbot domain
    ├── aiEngine.js      # Gemini AI integration
    ├── imageAnalyzer.js # Vision AI
    ├── knowledge.js     # RAG system
    └── whatsapp.js      # WhatsApp API client
```

## Layer Responsibilities

### 1. Config Layer
- Database connections
- Environment variables
- Constants and configuration

### 2. Core Layer (Domain Models)
- Pure business entities
- Factory methods for object creation
- No external dependencies

### 3. Repository Layer (Data Access)
- Single responsibility: database operations
- Abstracts Firestore implementation
- Returns domain objects
- Singleton instances

### 4. Service Layer (Business Logic)
- Orchestrates repositories
- Implements business rules
- Transaction management
- Validation logic

### 5. Controller Layer (Presentation)
- HTTP request/response handling
- Input validation
- Error formatting
- Delegates to services

### 6. Routes Layer
- URL mapping
- Middleware attachment
- Route grouping

## Design Patterns

### Repository Pattern
Separates data access from business logic. Each repository handles one entity.

```javascript
// Repository handles data access
class UserRepository {
  async findByPhone(phoneNumber) { /* ... */ }
  async create(phoneNumber, data) { /* ... */ }
}

// Service uses repository
class UserService {
  async getUser(phoneNumber) {
    return UserRepository.findByPhone(phoneNumber);
  }
}
```

### Factory Pattern
Domain models use static factory methods for object creation.

```javascript
class User {
  static create(data) {
    return { /* validated user object */ };
  }
  
  static createMock(userData) {
    return { /* mock user object */ };
  }
}
```

### Singleton Pattern
Services and repositories are singleton instances.

```javascript
module.exports = new UserService();
```

## SOLID Principles

### Single Responsibility Principle (SRP)
Each class has one reason to change:
- `UserRepository`: Only changes if data access changes
- `UserService`: Only changes if business rules change
- `UserController`: Only changes if API contract changes

### Open/Closed Principle (OCP)
- Services are open for extension (inheritance)
- Closed for modification (stable interfaces)

### Liskov Substitution Principle (LSP)
- Repositories can be swapped (e.g., Firestore → PostgreSQL)
- Services depend on interfaces, not implementations

### Interface Segregation Principle (ISP)
- Routes are segregated by domain (users, majelis, webhook)
- Controllers have focused methods

### Dependency Inversion Principle (DIP)
- High-level modules (services) don't depend on low-level modules (repositories)
- Both depend on abstractions (method signatures)

## Adding New Features

### 1. Add New Entity
```javascript
// 1. Create model in core/
class Payment {
  static create(data) { /* ... */ }
}

// 2. Create repository in repositories/
class PaymentRepository {
  async findById(id) { /* ... */ }
}

// 3. Create service in services/
class PaymentService {
  async processPayment(data) { /* ... */ }
}

// 4. Create controller in controllers/
class PaymentController {
  async create(req, res) { /* ... */ }
}

// 5. Create routes in routes/
router.post('/', PaymentController.create);
```

### 2. Add New Business Logic
Add methods to existing service:

```javascript
// services/UserService.js
async calculateLoyaltyPoints(phoneNumber) {
  const user = await UserRepository.findByPhone(phoneNumber);
  // Business logic here
  return points;
}
```

### 3. Add New API Endpoint
Add route and controller method:

```javascript
// controllers/UserController.js
async getLoyaltyPoints(req, res) {
  const points = await UserService.calculateLoyaltyPoints(req.params.phone);
  res.json({ points });
}

// routes/userRoutes.js
router.get('/:phone/loyalty', UserController.getLoyaltyPoints);
```

## Testing Strategy

### Unit Tests
- Test services in isolation
- Mock repositories
- Test business logic

### Integration Tests
- Test controllers with real services
- Test repositories with test database
- Test API endpoints

### Example
```javascript
// Test service
const UserService = require('../services/UserService');
jest.mock('../repositories/UserRepository');

test('getUser returns user data', async () => {
  const user = await UserService.getUser('123');
  expect(user).toBeDefined();
});
```

## Migration from Old Structure

Old `db.js` (716 lines) split into:
- `config/database.js` - DB connection
- `core/User.js`, `core/Majelis.js` - Models
- `repositories/*` - Data access (4 files)
- `services/*` - Business logic (2 files)

Benefits:
- Easier to test
- Easier to understand
- Easier to modify
- Better separation of concerns
