# Architecture

## Layered Structure

**Request Flow**: Routes → Controllers → Services → Repositories → Firestore

### Directory Structure

```
src/
├── config/          # Database, constants
├── core/            # Domain models (User, Majelis)
├── repositories/    # Data access (Firestore)
├── services/        # Business logic
├── controllers/     # Request handlers
├── routes/          # API endpoints
└── chatbot/         # AI engine, WhatsApp client
```

## SOLID Principles

**Single Responsibility**: Each class has one reason to change
- Repository: Data access only
- Service: Business logic only
- Controller: HTTP handling only

**Dependency Inversion**: Services depend on repository interfaces, not implementations

**Open/Closed**: Extend via inheritance, don't modify existing code

## Patterns

**Repository**: Abstracts data access
**Factory**: Static methods for object creation (User.create, Majelis.create)
**Singleton**: Services and repositories are singleton instances

## Adding Features

1. Create model in `core/` (if new entity)
2. Create repository in `repositories/`
3. Create service in `services/`
4. Create controller in `controllers/`
5. Add routes in `routes/`
