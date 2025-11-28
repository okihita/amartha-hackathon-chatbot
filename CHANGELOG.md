# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-22

### Added
- Initial production release
- WhatsApp bot with AI-powered conversations
- User registration via natural language
- Admin dashboard for user management
- Majelis (group) management system
- Loan tracking and payment reminders
- Image analysis with Gemini Vision
- Firestore database integration
- Google Cloud Run deployment
- Input validation and spam detection
- Topic filtering (business/finance only)
- Debug commands for user data
- Comprehensive documentation

### Features

#### User Management
- Natural language registration (name, business, location)
- Field agent verification system
- User profile with business details
- Exclusive Majelis membership (one per user)
- Profile viewing with `cek data` command

#### Majelis Management
- Create/edit/delete groups
- Schedule and location tracking
- Member autocomplete search
- Visual member list on cards
- Exclusive membership validation

#### Loan Management
- Loan limit tracking
- Payment schedule and reminders
- Transaction history
- Demo data population with `populate loan`
- Remaining balance calculation

#### AI Capabilities
- Gemini 2.5 Flash for conversations
- Gemini Vision for image analysis
- Context-aware responses
- Tool calling for user registration
- Business-relevant image classification
- Structured data extraction from images

#### Admin Dashboard
- User list with status indicators
- Majelis grid view with member counts
- Inline actions (approve, delete, edit)
- Responsive design
- Color-coded status (green/yellow/red)
- Layout stability (no button disappearing)

#### Security & Validation
- Spam detection (repeated chars, special chars)
- Message length limits (max 1000 chars)
- URL filtering
- Topic filtering (reject politics/religion)
- Input sanitization
- Malicious content blocking

### Technical
- Express.js server with REST API
- Firestore for persistent storage
- Docker containerization
- Optimized deployment pipeline (~40s)
- Artifact Registry for image caching
- CORS enabled for dashboard
- Cache-busting headers
- Comprehensive error handling

### Documentation
- README with setup instructions
- API documentation
- Setup guide with troubleshooting
- Architecture diagrams
- Contributing guidelines
- Git commit standards
- UI/UX design principles
- Deployment testing checklist
- Test scenarios documentation

## [Unreleased]

### Planned Features (Phase 2)
- Savings goal tracker
- Expense calculator
- Profit calculator
- Group chat access
- Video tutorial links

### Planned Features (Phase 3)
- Voice message support
- Receipt scanner with OCR
- AI business consultant
- Referral program
- Mobile app

---

## Version History

- **1.0.0** (2025-11-22) - Initial production release
- **0.1.0** (2025-11-15) - Alpha version with basic features
