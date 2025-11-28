# Amartha WhatsApp Chatbot

AI-powered WhatsApp chatbot for Amartha's financial literacy program, providing personalized business coaching and management tools for Indonesian micro-entrepreneurs (UMKM).

## 🎯 Overview

This chatbot serves as a digital assistant for Amartha's field agents and UMKM members, offering:
- Automated user registration and verification
- AI-powered financial literacy coaching
- Loan management and payment tracking
- Business image analysis with AI vision
- Majelis (group) management system
- Admin dashboard for field agents

## ✨ Key Features

### For UMKM Members
- **Smart Registration**: Natural language registration via WhatsApp
- **Financial Coaching**: AI-powered business advice in Indonesian
- **Interactive Quiz**: 15-week financial literacy course with progress tracking
- **Loan Tracking**: Check limits, payments, and transaction history
- **Image Analysis**: Upload business photos for AI insights
- **Majelis Info**: View group schedule and meeting details

### For Field Agents
- **Admin Dashboard**: Web interface for user management
- **User Verification**: Approve/reject new registrations
- **Majelis Management**: Create and manage groups
- **Member Assignment**: Add/remove members with validation
- **Business Intelligence**: View analyzed business data
- **Business Types Library**: 25 UMKM categories with maturity levels

### AI Capabilities
- **Gemini 2.5 Flash**: Conversational AI with tool calling
- **Gemini Vision**: Image classification and data extraction
- **Context-Aware**: Personalized responses based on user profile
- **Input Validation**: Spam detection and topic filtering
- **Interactive Quiz**: WhatsApp list messages for multiple choice questions

### Security & Performance
- **Rate Limiting**: 100 requests/minute per IP on webhook endpoint
- **Environment Validation**: Startup checks for required credentials
- **Error Handling**: Unhandled promise rejection tracking

## 🏗️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: Google Cloud Firestore
- **AI**: Google Gemini (Text + Vision)
- **Messaging**: WhatsApp Business API
- **Deployment**: Google Cloud Run
- **Security**: express-rate-limit
- **Frontend**: Vanilla HTML/CSS/JavaScript

## 📦 Installation

### Prerequisites
- Node.js 18+
- Google Cloud Platform account
- WhatsApp Business API access
- Gemini API key

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd wa-chatbot-gcp-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Set up Firestore**
- Enable Firestore in your GCP project
- Create collections: `users`, `majelis`

5. **Run locally**
```bash
npm start
```

## 🚀 Deployment

### Deploy to Google Cloud Run

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

The script will:
- Build Docker image
- Push to Artifact Registry
- Deploy to Cloud Run
- Configure environment variables

### Import Business Types from Google Drive

After deployment, import business classifications:

```bash
# Set folder ID (already configured in script)
node scripts/import-business-types.js
```

This imports 25 business type categories with maturity levels from Google Drive.
See [Scripts Guide](./scripts/README.md) for details.

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required variables:

Required:
- `MY_VERIFY_TOKEN` - WhatsApp webhook verification token
- `WHATSAPP_TOKEN` - WhatsApp API access token
- `PHONE_NUMBER_ID` - WhatsApp Business phone number ID
- `GEMINI_API_KEY` - Google Gemini API key
- `GCP_PROJECT_ID` - Google Cloud project ID

Optional:
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)
- `FINANCIAL_LITERACY_FOLDER_ID` - Google Drive folder for course content
- `BUSINESS_TYPES_FOLDER_ID` - Google Drive folder for business classifications

## 📚 Documentation

- **[Complete Guide](./docs/GUIDE.md)** - Setup, API, development, troubleshooting
- **[Architecture](./docs/ARCHITECTURE.md)** - Architecture & SOLID principles
- **[Scripts Guide](./scripts/README.md)** - Import scripts documentation
- **[Specs](./docs/specs/)** - Feature specifications

## 🧪 Testing

```bash
# Run all integration tests
./tests/integration.test.sh

# Verbose mode
VERBOSE=true ./tests/integration.test.sh

# Test different environment
TEST_URL=http://localhost:8080 ./tests/integration.test.sh
```

## 📊 Project Structure

```
.
├── index.js                 # Express server entry point
├── src/
│   ├── config/             # Configuration & constants
│   │   ├── database.js     # Firestore initialization
│   │   ├── constants.js    # Collection names
│   │   └── mockData.js     # Test data
│   ├── core/               # Domain models (entities)
│   │   ├── User.js         # User entity & factory
│   │   └── Majelis.js      # Majelis entity & factory
│   ├── repositories/       # Data access layer
│   │   ├── UserRepository.js
│   │   ├── MajelisRepository.js
│   │   ├── BusinessIntelligenceRepository.js
│   │   └── RAGRepository.js
│   ├── services/           # Business logic layer
│   │   ├── UserService.js
│   │   └── MajelisService.js
│   ├── controllers/        # Request handlers
│   │   ├── UserController.js
│   │   ├── MajelisController.js
│   │   └── WebhookController.js
│   ├── routes/             # API route definitions
│   │   ├── userRoutes.js
│   │   ├── majelisRoutes.js
│   │   ├── webhookRoutes.js
│   │   ├── superadminRoutes.js
│   │   └── ragRoutes.js
│   ├── chatbot/            # Chatbot domain
│   │   ├── aiEngine.js     # Gemini AI integration
│   │   ├── imageAnalyzer.js # Vision AI for image analysis
│   │   ├── knowledge.js    # Amartha knowledge base (RAG)
│   │   └── whatsapp.js     # WhatsApp API client
│   ├── db.js               # Legacy database (deprecated)
│   └── schemas.js          # Legacy schemas (deprecated)
├── public/
│   ├── index.html          # User management dashboard
│   └── assets/             # Frontend static files
├── scripts/
│   └── import-business-types.js  # Google Drive import script
├── docs/
│   ├── ARCHITECTURE.md     # Architecture & SOLID principles
│   └── GUIDE.md            # Complete setup guide
├── Dockerfile              # Container configuration
└── deploy.sh               # Deployment script
```

## 🏛️ Architecture

This project follows **SOLID principles** with a layered architecture:

- **Config Layer**: Database connections, constants, configuration
- **Core Layer**: Domain models and business entities
- **Repository Layer**: Data access abstraction (Firestore)
- **Service Layer**: Business logic and orchestration
- **Controller Layer**: HTTP request/response handling
- **Routes Layer**: API endpoint definitions

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed design patterns and principles.

## 🌐 Live URLs

- **Production**: Your Cloud Run URL will be displayed after deployment
- **Dashboard**: `https://YOUR_SERVICE_URL/`
- **Majelis**: `https://YOUR_SERVICE_URL/majelis`
- **Business Types**: `https://YOUR_SERVICE_URL/business-types`

## 🤝 Contributing

See [GUIDE.md](./docs/GUIDE.md) for development guidelines and contribution workflow.

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check [troubleshooting guide](./docs/GUIDE.md#troubleshooting)
2. Review logs: `gcloud run logs read whatsapp-bot`
3. Open an issue on GitHub

---

**Built with ❤️ for Amartha UMKM Program**
