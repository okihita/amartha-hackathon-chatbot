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

## 🏗️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: Google Cloud Firestore
- **AI**: Google Gemini (Text + Vision)
- **Messaging**: WhatsApp Business API
- **Deployment**: Google Cloud Run
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
See [Business Types Import Guide](./docs/BUSINESS_TYPES_IMPORT.md) for details.

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required variables:

- `MY_VERIFY_TOKEN` - WhatsApp webhook verification token
- `WHATSAPP_TOKEN` - WhatsApp API access token
- `PHONE_NUMBER_ID` - WhatsApp Business phone number ID
- `GEMINI_API_KEY` - Google Gemini API key
- `GCP_PROJECT_ID` - Google Cloud project ID
- `PORT` - Server port (default: 8080)

## 📚 Documentation

- **[Complete Guide](./docs/GUIDE.md)** - Setup, API, development, troubleshooting
- **[Requirements](./kiro/specs/amartha-chatbot/requirements.md)** - Functional & non-functional requirements
- **[Design](./kiro/specs/amartha-chatbot/design.md)** - Architecture & design patterns
- **[Scripts Guide](./scripts/README.md)** - Import scripts documentation
- **[Changelog](./CHANGELOG.md)** - Version history

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
├── index.js                 # Express server & API routes
├── src/
│   ├── aiEngine.js         # Gemini AI integration
│   ├── db.js               # Firestore database operations
│   ├── imageAnalyzer.js    # Vision AI for image analysis
│   ├── whatsapp.js         # WhatsApp API client
│   └── knowledge.js        # Amartha knowledge base
├── public/
│   ├── index.html          # User management dashboard
│   ├── majelis.html        # Majelis management page
│   ├── business-types.html # Business classifications library
│   └── layout.js           # Shared UI components
├── scripts/
│   └── import-business-types.js  # Google Drive import script
├── docs/                   # Documentation
├── .kiro/steering/         # Development standards
├── Dockerfile              # Container configuration
└── deploy.sh               # Deployment script
```

## 🌐 Live URLs

- **Production**: Your Cloud Run URL will be displayed after deployment
- **Dashboard**: `https://YOUR_SERVICE_URL/`
- **Majelis**: `https://YOUR_SERVICE_URL/majelis`
- **Business Types**: `https://YOUR_SERVICE_URL/business-types`

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check [troubleshooting guide](./docs/SETUP.md#troubleshooting)
2. Review logs: `gcloud run logs read whatsapp-bot`
3. Open an issue on GitHub

---

**Built with ❤️ for Amartha UMKM Program**
