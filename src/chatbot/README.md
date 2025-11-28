# Chatbot Brain 🤖

This folder contains all AI-powered chatbot components for the Amartha WhatsApp assistant.

## Components

### 🧠 aiEngine.js
**Gemini AI Integration**
- Conversational AI using Gemini 2.5 Flash
- Tool calling for user registration
- Context-aware responses based on user profile
- Input validation and spam detection
- Handles both new user registration and existing user queries

**Key Features:**
- Natural language registration flow
- Financial literacy coaching
- Loan information queries
- Debug commands for user data inspection

### 📸 imageAnalyzer.js
**Vision AI for Business Analysis**
- Image classification using Gemini 2.0 Flash
- Structured data extraction from business photos
- Credit scoring metrics calculation
- Business intelligence storage

**Supported Image Types:**
- 🏪 Building/Store conditions
- 📦 Inventory/Stock analysis
- 📒 Financial records (receipts, ledgers)

**Output:**
- Business health scores
- Asset valuations
- Cashflow predictions
- Loan recommendations

### 📚 knowledge.js
**RAG Knowledge Base**
- Static Amartha knowledge base
- Dynamic financial literacy module retrieval
- Keyword-based knowledge matching
- Integration with Firestore financial literacy collection

**Knowledge Topics:**
- Majelis (group meetings)
- Tanggung Renteng (joint liability)
- Celengan (savings)
- Modal (working capital)
- AmarthaLink (agent program)
- A-Score (credit scoring)
- Poket (digital wallet)
- Business Partner (field agents)

### 💬 whatsapp.js
**WhatsApp API Client**
- Message sending via WhatsApp Business API
- Text formatting (bold, bullets)
- Message length validation
- Error handling and fallbacks

## Usage

```javascript
// Import chatbot components
const { getGeminiResponse } = require('./src/chatbot/aiEngine');
const { sendMessage } = require('./src/chatbot/whatsapp');
const { analyzeImage } = require('./src/chatbot/imageAnalyzer');
const { retrieveKnowledge } = require('./src/chatbot/knowledge');

// Process text message
const reply = await getGeminiResponse(userText, phoneNumber);
await sendMessage(phoneNumber, reply);

// Process image
const imageReply = await analyzeImage(imageId, caption, phoneNumber);
await sendMessage(phoneNumber, imageReply);
```

## Dependencies

- `@google/generative-ai` - Gemini AI SDK
- `@google-cloud/firestore` - Database operations
- `axios` - HTTP requests for WhatsApp API

## Environment Variables

Required in `.env`:
- `GEMINI_API_KEY` - Google Gemini API key
- `WHATSAPP_TOKEN` - WhatsApp Business API token
- `PHONE_NUMBER_ID` - WhatsApp Business phone number ID
- `GCP_PROJECT_ID` - Google Cloud project ID

## Architecture

```
User Message (WhatsApp)
    ↓
index.js (webhook handler)
    ↓
chatbot/
    ├─ aiEngine.js → Gemini AI processing
    ├─ knowledge.js → RAG context retrieval
    ├─ imageAnalyzer.js → Vision AI analysis
    └─ whatsapp.js → Response delivery
    ↓
User receives reply
```

## Notes

- All chatbot logic is isolated in this folder
- Database operations are handled by `../db.js`
- Route handlers are in `../routes/`
- This separation keeps AI/chatbot concerns separate from business logic
