# 🌾 Akademi-AI Amartha

> **Bringing AI-powered financial education to 10 million unbanked Indonesian women—through the app they already use every day: WhatsApp.**

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?logo=googlecloud)](https://cloud.google.com/run)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google)](https://ai.google.dev/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Business%20API-25D366?logo=whatsapp)](https://business.whatsapp.com/)

---

## 🎯 The Problem

In rural Indonesia, **70% of micro-entrepreneurs** have never used a banking app. They run businesses from handwritten notebooks, manage cash in plastic bags, and have zero credit history. Traditional fintech solutions fail them—they require app downloads, complex UIs, and assume digital literacy that doesn't exist.

**But 95% of them use WhatsApp daily.**

## 💡 Our Solution

Akademi-AI is a **zero-friction AI assistant** that lives inside WhatsApp. No app to download. No login to remember. Just chat—in Bahasa Indonesia, with voice notes, with photos of their warung.

```
Ibu Siti: "Halo"
Akademi-AI: "Halo Bu Siti! 👋 Mau belajar keuangan hari ini?"
Ibu Siti: [sends voice note] "Gimana cara pisahin uang usaha sama uang rumah tangga?"
Akademi-AI: "Bagus pertanyaannya Bu! Ada 3 cara mudah..."
```

### What Makes This Different

| Traditional Fintech | Akademi-AI |
|---------------------|------------|
| Download app (50MB+) | Already on their phone |
| Create account, verify email | Just send "Halo" |
| Read complex UI | Natural conversation |
| Type everything | Voice notes supported |
| Generic content | Personalized to their business |

---

## ✨ Key Features

### 📚 15-Week Financial Literacy Program
Interactive quiz-based learning delivered weekly via WhatsApp. Each session starts with bite-sized material, followed by 4 questions. Pass rate: 100% (because we want them to *learn*, not fail).

### 🎤 Voice-First Design
Many users are more comfortable speaking than typing. Gemini transcribes voice notes and responds naturally—like talking to a helpful neighbor.

### 📸 Business Intelligence from Photos
Send a photo of your warung, inventory, or handwritten ledger. Gemini Vision extracts:
- Estimated daily revenue
- Stock levels and variety
- Record-keeping quality
- Actionable improvement suggestions

### 🏘️ Majelis (Group) Management
Field agents manage lending groups through a web dashboard. Track member progress, schedule meetings, and monitor engagement—all synced with the chatbot.

### 📊 Credit Readiness Scoring
Behind the scenes, we calculate an "A-Score" based on:
- **Character**: Engagement consistency, quiz completion
- **Capacity**: Self-reported income/expenses via conversational collection
- **Capital**: Business growth tracked through photo analysis
- **Conditions**: Majelis participation and peer accountability

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WhatsApp Cloud API                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Google Cloud Run                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Express   │  │   Webhook   │  │     AI Engine           │  │
│  │   Server    │──│  Controller │──│  • Gemini 2.5 Flash     │  │
│  │             │  │             │  │  • Tool Calling         │  │
│  └─────────────┘  └─────────────┘  │  • Context Management   │  │
│                                     └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Service Layer                             ││
│  │  UserService │ QuizService │ MajelisService │ BIService     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Google Cloud Firestore                      │
│         users/  │  majelis/  │  financial_literacy/             │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | Node.js 20 + Express | Fast cold starts on Cloud Run |
| **AI** | Gemini 2.5 Flash | Best-in-class Indonesian language + vision |
| **Database** | Cloud Firestore | Serverless, real-time sync |
| **Messaging** | WhatsApp Business API | 2B+ users, zero friction |
| **Frontend** | Preact + Vite | 56KB gzipped dashboard |
| **Deployment** | Cloud Run | Scale to zero, pay per request |
| **Maps** | Leaflet + CartoDB | Visualize member locations |

### AI Capabilities

- **Conversational Registration**: Extract name, business type, and location from natural speech
- **Tool Calling**: Gemini autonomously triggers quiz, registration, or data lookup
- **Voice Transcription**: Process audio messages via Gemini's multimodal input
- **Image Analysis**: Classify business photos into ledger/inventory/building types
- **RAG Knowledge Base**: Ground responses in Amartha-specific terminology

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/okihita/amartha-hackathon-chatbot.git
cd amartha-hackathon-chatbot

# Install
npm install

# Configure
cp .env.example .env
# Add: GEMINI_API_KEY, WHATSAPP_TOKEN, PHONE_NUMBER_ID

# Run
npm start
```

### Deploy to Production

```bash
./deploy.sh  # Builds container, pushes to Artifact Registry, deploys to Cloud Run
```

---

## 📱 User Journey

```
Day 1: "Halo" → Registration via natural conversation
       ↓
Day 3: First quiz notification → Complete Week 1 literacy module
       ↓
Day 7: Send photo of warung → Receive business analysis
       ↓
Day 14: Voice note question → Personalized coaching response
       ↓
Week 15: Complete all modules → Credit-ready status unlocked
```

---

## 📊 Dashboard Preview

Field agents access a web dashboard to:
- View all registered users with A-Score breakdown
- Filter by verification status, majelis, or risk zone
- See engagement heatmaps and literacy progress
- Manage majelis membership and schedules
- Review AI-extracted business intelligence

---

## 🔒 Security & Privacy

- **Rate Limiting**: 100 req/min per IP on webhook
- **No PII in Logs**: Phone numbers hashed in analytics
- **Firestore Rules**: Role-based access for field agents
- **Environment Validation**: Startup checks for required secrets

---

## 📚 Documentation

- [Architecture & SOLID Principles](./docs/ARCHITECTURE.md)
- [Quiz Feature Spec](./docs/QUIZ_FEATURE.md)
- [Credit Scoring Model](./docs/CREDIT_SCORING_MODEL.md)
- [API Guide](./docs/GUIDE.md)

---

## 🤝 Team

Built with ❤️ for the **Google Developer Groups Hackathon 2025** by a team passionate about financial inclusion in Indonesia.

---

## 📄 License

ISC

---

> *"The best interface is no interface. The best app is the one they already have."*
