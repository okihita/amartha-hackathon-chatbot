# Amartha Chatbot - Complete Guide

## Quick Start

### Installation
```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### Deployment
```bash
./deploy.sh
```

### Testing
```bash
./tests/integration.test.sh
```

## API Reference

### User Management
```
GET    /api/users              - Get all users
GET    /api/users/:phone       - Get user by phone
POST   /api/users/verify       - Verify user
DELETE /api/users/:phone       - Delete user
GET    /api/users/:phone/images - Get business images
```

### Majelis Management
```
GET    /api/majelis            - Get all majelis
GET    /api/majelis/:id        - Get majelis by ID
POST   /api/majelis            - Create majelis
PUT    /api/majelis/:id        - Update majelis
DELETE /api/majelis/:id        - Delete majelis
POST   /api/majelis/:id/members - Add member
DELETE /api/majelis/:id/members/:phone - Remove member
```

### Content
```
GET    /api/business-types     - Get business classifications
GET    /api/financial-literacy - Get course modules
```

## Development

### Project Structure
```
src/
├── services/          # Business logic
├── repositories/      # Data access
├── aiEngine.js        # Gemini AI
├── db.js             # Database operations
├── imageAnalyzer.js  # Vision AI
├── knowledge.js      # RAG knowledge base
└── whatsapp.js       # WhatsApp client

public/               # Dashboard UI
tests/                # Integration tests
scripts/              # Import scripts
```

### Adding a New Feature

1. **Create Service** (if needed)
```javascript
// src/services/FeatureService.js
class FeatureService {
  constructor(repository) {
    this.repository = repository;
  }
  
  async doSomething() {
    return await this.repository.find();
  }
}
```

2. **Create Repository** (if needed)
```javascript
// src/repositories/FeatureRepository.js
class FeatureRepository {
  constructor(firestore) {
    this.db = firestore;
  }
  
  async find() {
    const snapshot = await this.db.collection('features').get();
    return snapshot.docs.map(doc => doc.data());
  }
}
```

3. **Add Route**
```javascript
// index.js
app.get('/api/features', async (req, res) => {
  const features = await featureService.getAll();
  res.json(features);
});
```

4. **Add Tests**
```bash
# Add test to tests/integration.test.sh
test_check "Features API" "curl -s $BASE_URL/api/features" "feature"
```

### Testing

Run all tests:
```bash
./tests/integration.test.sh
```

Verbose mode:
```bash
VERBOSE=true ./tests/integration.test.sh
```

Test specific environment:
```bash
TEST_URL=http://localhost:8080 ./tests/integration.test.sh
```

### Debugging

View logs:
```bash
gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 50
```

Follow logs:
```bash
gcloud run logs tail whatsapp-bot --region asia-southeast2
```

Test locally:
```bash
npm start
# Send test message via WhatsApp or curl
```

## Configuration

### Environment Variables

Required:
- `MY_VERIFY_TOKEN` - WhatsApp webhook verification
- `WHATSAPP_TOKEN` - WhatsApp API token
- `PHONE_NUMBER_ID` - WhatsApp phone number ID
- `GEMINI_API_KEY` - Google Gemini API key
- `GCP_PROJECT_ID` - Google Cloud project ID

Optional:
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)
- `FINANCIAL_LITERACY_FOLDER_ID` - Google Drive folder
- `BUSINESS_TYPES_FOLDER_ID` - Google Drive folder

### Firestore Collections

- `users` - User profiles
- `majelis` - Group meetings
- `business_intelligence` - Image analysis data
- `business_classifications` - Business types
- `financial_literacy` - Course modules

## Troubleshooting

### WhatsApp not responding
1. Check webhook URL is correct
2. Verify `MY_VERIFY_TOKEN` matches
3. Check logs for errors
4. Test health endpoint: `/health`

### Dashboard not loading
1. Check Cloud Run is deployed
2. Verify static files are served
3. Check browser console for errors
4. Test API endpoints directly

### Import scripts failing
1. Verify Google Drive folder is public
2. Check `GEMINI_API_KEY` is set
3. Ensure Firestore is enabled
4. Check folder IDs are correct

### Tests failing
1. Verify production URL is accessible
2. Check all services are running
3. Review test output for specific failures
4. Run with `VERBOSE=true` for details

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes following SOLID principles
3. Add tests for new features
4. Update documentation
5. Run tests: `./tests/integration.test.sh`
6. Commit with conventional commits
7. Push and create PR

### Commit Convention
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(api): add user search endpoint

Implement search functionality for users by name or phone.
Includes pagination and filtering.

Closes #123
```

## Resources

- **Specs**: `docs/specs/`
- **Scripts**: `scripts/README.md`
- **Architecture**: `docs/ARCHITECTURE.md`

---

For detailed architecture and design patterns, see `docs/ARCHITECTURE.md`
