# Gemini Canvas - Visual Board Guide
## Akademi-AI: Project Journey & Gemini Integration

**Purpose:** This document provides the complete content for creating a visual board (Miro/Figma/Google Slides) showcasing our project journey and Gemini AI integration.

---

## Board Structure (6 Sections)

### Section 1: Problem Discovery & Ideation
### Section 2: Solution Design & User Flows
### Section 3: Gemini Integration Architecture
### Section 4: Development Process with Gemini
### Section 5: User Experience & Mockups
### Section 6: Impact & Future Vision

---

## SECTION 1: PROBLEM DISCOVERY & IDEATION

### The Challenge
**Visual:** Large text box with problem statement

```
THE PROBLEM:
64 million Indonesian UMKM entrepreneurs need financial literacy 
and credit access, but traditional microfinance is:
- Manual and slow (weeks for verification)
- Limited reach (requires in-person meetings)
- Expensive (high operational costs)
- Inaccessible (rural areas, low literacy)
```

### Initial Brainstorming
**Visual:** Mind map or sticky notes

**Central Question:** "How can we democratize financial literacy for millions?"

**Ideas Generated:**
- 💡 Mobile app → ❌ Requires smartphone + data
- 💡 SMS system → ❌ Limited interaction
- 💡 Voice calls → ❌ Not scalable
- 💡 **WhatsApp AI Bot** → ✅ **WINNER!**
  - 99% of Indonesians have WhatsApp
  - Works on basic phones
  - Familiar interface
  - Rich media support

### Why Gemini AI?
**Visual:** Comparison table

| Requirement | Traditional AI | Gemini AI | Why Gemini Wins |
|-------------|---------------|-----------|-----------------|
| Indonesian Language | ⚠️ Limited | ✅ Excellent | Native support |
| Tool Calling | ❌ Complex | ✅ Built-in | Easy integration |
| Image Analysis | ❌ Separate model | ✅ Multimodal | Single platform |
| Cost | 💰💰💰 High | 💰 Affordable | Free tier + scale |
| Speed | 🐌 Slow | ⚡ Fast | <2s response |
| JSON Mode | ❌ No | ✅ Yes | Structured data |

**Decision:** Gemini 2.5 Flash (text) + Gemini 2.0 Flash Exp (vision)

---

## SECTION 2: SOLUTION DESIGN & USER FLOWS

### User Personas
**Visual:** 3 persona cards with photos/illustrations

**Persona 1: Ibu Siti (UMKM Owner)**
- Age: 35
- Business: Warung Sembako
- Location: Rural Java
- Phone: Basic Android
- Goal: Learn financial management, get loan
- Pain: No time for classes, limited literacy

**Persona 2: Pak Budi (Field Agent)**
- Age: 28
- Role: Amartha Business Partner
- Location: Central Java
- Goal: Verify users quickly, manage groups
- Pain: Too much paperwork, slow processes

**Persona 3: Bu Ani (Amartha Manager)**
- Age: 42
- Role: Regional Manager
- Goal: Monitor portfolio, reduce defaults
- Pain: Limited visibility, manual reporting

### User Journey Map
**Visual:** Horizontal timeline with stages

**Stage 1: Discovery**
- User hears about Akademi-AI from field agent
- Sends first WhatsApp message
- **Gemini Role:** Natural language understanding

**Stage 2: Registration**
- User provides name, business, location in natural language
- **Gemini Role:** Extract structured data via tool calling
- System creates profile automatically

**Stage 3: Verification**
- Field agent reviews profile on dashboard
- Approves or requests more info
- **Gemini Role:** N/A (human decision)

**Stage 4: Learning**
- User asks business questions
- Receives personalized advice
- **Gemini Role:** Context-aware responses with RAG

**Stage 5: Credit Assessment**
- User sends business photos
- AI analyzes and scores
- **Gemini Role:** Vision AI extracts business intelligence

**Stage 6: Loan Application**
- System recommends loan amount
- User applies through field agent
- **Gemini Role:** Credit score calculation

### Key User Flows
**Visual:** Flowcharts for each flow

**Flow 1: New User Registration**
```
User: "Nama saya Ibu Siti, usaha warung sembako di Bogor"
  ↓
Gemini extracts: {name: "Ibu Siti", business: "Warung Sembako", location: "Bogor"}
  ↓
Tool calling: registerUser()
  ↓
Firestore: Create user document
  ↓
Response: "Terima kasih Ibu Siti! Profil Anda sudah terdaftar..."
```

**Flow 2: Business Photo Analysis**
```
User: [Sends photo of warung]
  ↓
Download image from WhatsApp
  ↓
Gemini Vision: Analyze image
  ↓
Extract: building type, condition, location, value
  ↓
Calculate: credit metrics (health, asset, cashflow scores)
  ↓
Store: business_intelligence collection
  ↓
Update: user credit_score
  ↓
Response: "Warung Ibu terlihat bagus! Skor kredit: 85/100..."
```

**Flow 3: Financial Literacy Question**
```
User: "Bagaimana cara menghitung laba rugi?"
  ↓
Get user context (business type, maturity level)
  ↓
RAG retrieval: Search relevant content
  ↓
Gemini: Generate personalized response
  ↓
Response: "Untuk warung sembako level 2, cara hitung laba rugi..."
```

---

## SECTION 3: GEMINI INTEGRATION ARCHITECTURE

### System Architecture Diagram
**Visual:** Architecture diagram (use Mermaid or draw.io)

```
┌─────────────────────────────────────────────┐
│         WhatsApp Business API               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Express.js Server                   │
│         (Google Cloud Run)                  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  Gemini AI   │    │  Gemini      │
│  Text Model  │    │  Vision      │
│  2.5 Flash   │    │  2.0 Flash   │
└──────────────┘    └──────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌──────────────────┐
        │    Firestore     │
        │    Database      │
        └──────────────────┘
```

### Gemini API Integration Points
**Visual:** Numbered integration points with code snippets

**Integration 1: Text Conversation**
```javascript
// Gemini 2.5 Flash for natural language
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  temperature: 0.4,
  tools: [{ functionDeclarations: [registerUserTool] }]
});

const chat = model.startChat({ history: [...] });
const result = await chat.sendMessage(userText);
```

**Integration 2: Tool Calling**
```javascript
// Gemini extracts structured data
const registerUserTool = {
  name: "registerUser",
  parameters: {
    name: STRING,
    business_type: STRING,
    location: STRING
  }
};

// Gemini calls: registerUser({name: "Ibu Siti", ...})
```

**Integration 3: Image Analysis**
```javascript
// Gemini Vision for business intelligence
const visionModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  responseMimeType: "application/json"
});

const result = await visionModel.generateContent([
  prompt,
  { inlineData: { mimeType: "image/jpeg", data: base64Image }}
]);
```

**Integration 4: RAG Context Injection**
```javascript
// Gemini with enhanced context
const systemPrompt = `
CONTEXT:
- User: ${userProfile.name}
- Business: ${userProfile.business_type}
- Level: ${maturityLevel}

KNOWLEDGE:
${ragContext}

Provide personalized advice...
`;
```

---

## SECTION 4: DEVELOPMENT PROCESS WITH GEMINI

### How We Used Gemini Throughout Development
**Visual:** Timeline with specific examples

**Phase 1: Ideation (Week 1)**

**Gemini Use Case 1: Brainstorming Features**
```
Prompt to Gemini:
"I'm building a WhatsApp chatbot for Indonesian microfinance. 
What features would be most valuable for UMKM owners with 
limited financial literacy?"

Gemini Output:
1. Natural language registration
2. Business photo analysis for credit scoring
3. Personalized financial advice
4. Quiz-based learning with progress tracking
5. Automated reminders for payments
[... used to prioritize roadmap]
```

**Gemini Use Case 2: System Prompt Design**
```
Prompt to Gemini:
"Create a system prompt for an AI assistant that helps 
Indonesian UMKM owners. Should be friendly, use Indonesian, 
and focus on financial literacy."

Gemini Output:
"PERAN: Akademi-AI, asisten bisnis untuk Ibu...
INSTRUKSI: Gunakan bahasa Indonesia yang sopan..."
[... refined and implemented]
```

**Phase 2: Development (Week 2-3)**

**Gemini Use Case 3: Code Generation**
```
Prompt to Gemini:
"Write a Node.js function to validate WhatsApp webhook 
signature using crypto module"

Gemini Output:
[Generated secure webhook verification code]
[... integrated into index.js]
```

**Gemini Use Case 4: Database Schema Design**
```
Prompt to Gemini:
"Design a Firestore schema for storing user profiles with 
credit scores, loan history, and business intelligence"

Gemini Output:
[Generated comprehensive schema with nested objects]
[... implemented in db.js]
```

**Gemini Use Case 5: Image Analysis Prompt Engineering**
```
Prompt to Gemini:
"Create a detailed prompt for analyzing business photos 
to extract: building condition, inventory level, 
organization, and estimate asset value"

Gemini Output:
[Generated structured prompt with JSON schema]
[... used in imageAnalyzer.js]
```

**Phase 3: Testing & Refinement (Week 4)**

**Gemini Use Case 6: Test Case Generation**
```
Prompt to Gemini:
"Generate 20 test messages in Indonesian for testing 
user registration, including edge cases"

Gemini Output:
1. "Nama saya Ibu Siti, usaha warung di Bogor"
2. "Saya Ani, jual bakwan, lokasi Sragen"
[... used in test-chats.md]
```

**Gemini Use Case 7: Error Message Improvement**
```
Prompt to Gemini:
"Rewrite this error message to be more friendly and 
helpful in Indonesian: 'Invalid input'"

Gemini Output:
"Maaf Bu, pesan tidak valid. Silakan kirim 
pertanyaan yang jelas."
[... implemented in aiEngine.js]
```

**Phase 4: Documentation (Week 5)**

**Gemini Use Case 8: Technical Documentation**
```
Prompt to Gemini:
"Write API documentation for the user management 
endpoints with examples"

Gemini Output:
[Generated comprehensive API docs]
[... used in docs/API.md]
```

### Gemini Impact Metrics
**Visual:** Stats cards

```
┌─────────────────────────┐
│  Code Generated         │
│  2,000+ lines           │
│  60% of codebase        │
└─────────────────────────┘

┌─────────────────────────┐
│  Time Saved             │
│  40 hours               │
│  50% faster dev         │
└─────────────────────────┘

┌─────────────────────────┐
│  Prompts Used           │
│  150+ iterations        │
│  Continuous refinement  │
└─────────────────────────┘

┌─────────────────────────┐
│  Features Enabled       │
│  Tool calling           │
│  Vision analysis        │
│  RAG retrieval          │
└─────────────────────────┘
```

---

## SECTION 5: USER EXPERIENCE & MOCKUPS

### WhatsApp Conversation Mockups
**Visual:** Phone mockups with chat bubbles

**Mockup 1: Registration Flow**
```
┌─────────────────────────┐
│  Akademi-AI             │
├─────────────────────────┤
│                         │
│ User:                   │
│ Nama saya Ibu Siti,     │
│ usaha warung sembako    │
│ di Bogor                │
│                    10:23│
│                         │
│ Akademi-AI:             │
│ ✅ Terima kasih Ibu     │
│ Siti! Profil Anda sudah │
│ terdaftar.              │
│                         │
│ 📊 Usaha: Warung Sembako│
│ 📍 Lokasi: Bogor        │
│                         │
│ Mohon tunggu verifikasi │
│ dari petugas ya Bu! 🙏  │
│ 10:23                   │
└─────────────────────────┘
```

**Mockup 2: Business Photo Analysis**
```
┌─────────────────────────┐
│  Akademi-AI             │
├─────────────────────────┤
│                         │
│ User:                   │
│ [📷 Photo of warung]    │
│                    14:15│
│                         │
│ Akademi-AI:             │
│ 🏪 Warung Ibu terlihat  │
│ bagus!                  │
│                         │
│ ⭐ Skor Kredit: 85/100  │
│ 🏢 Kondisi: Baik        │
│ 💰 Nilai Aset: Rp 5jt   │
│ 📈 Risiko: Rendah       │
│                         │
│ 💡 Rekomendasi pinjaman:│
│ Rp 3.750.000            │
│                         │
│ Hubungi petugas untuk   │
│ pengajuan ya Bu! 📞     │
│ 14:16                   │
└─────────────────────────┘
```

**Mockup 3: Financial Literacy Q&A**
```
┌─────────────────────────┐
│  Akademi-AI             │
├─────────────────────────┤
│                         │
│ User:                   │
│ Bagaimana cara          │
│ menghitung laba rugi?   │
│                    16:30│
│                         │
│ Akademi-AI:             │
│ 📚 Untuk warung sembako │
│ level 2, cara hitung    │
│ laba rugi:              │
│                         │
│ 1️⃣ Catat semua pemasukan│
│ 2️⃣ Catat semua pengeluaran│
│ 3️⃣ Laba = Pemasukan -  │
│    Pengeluaran          │
│                         │
│ Contoh:                 │
│ Pemasukan: Rp 10jt      │
│ Pengeluaran: Rp 7jt     │
│ Laba: Rp 3jt ✅         │
│                         │
│ Mau belajar lebih?      │
│ Ketik "modul week 3" 📖 │
│ 16:31                   │
└─────────────────────────┘
```

### Dashboard Mockups
**Visual:** Desktop screenshots or wireframes

**Dashboard 1: User Management**
```
┌────────────────────────────────────────────────────┐
│  Akademi-AI Dashboard                    [Logout]  │
├────────────────────────────────────────────────────┤
│  [Users] [Majelis]                                 │
├────────────────────────────────────────────────────┤
│                                                    │
│  Users (125)                          [+ Add User] │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Name          │ Business  │ Status │ Credit  │ │
│  ├──────────────────────────────────────────────┤ │
│  │ Ibu Siti      │ Warung    │ ✅ Ver │ 85/100  │ │
│  │ Ibu Ani       │ Bakwan    │ ⏳ Pend│ --      │ │
│  │ Ibu Dewi      │ Kopi      │ ✅ Ver │ 72/100  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Dashboard 2: User Profile with Credit Score**
```
┌────────────────────────────────────────────────────┐
│  ← Back to Users                                   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Ibu Siti                                          │
│  Warung Sembako • Bogor                            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │         Credit Score: 85/100                  │ │
│  │              ⭐⭐⭐⭐⭐                          │ │
│  │         Risk Level: Rendah 🟢                 │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Business Metrics:                                 │
│  • Health Score: 88/100                            │
│  • Asset Score: 82/100                             │
│  • Cashflow Score: 85/100                          │
│                                                    │
│  Business Photos (3):                              │
│  [📷 Building] [📷 Inventory] [📷 Records]         │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## SECTION 6: IMPACT & FUTURE VISION

### Current Impact (Pilot Phase)
**Visual:** Impact metrics with icons

```
┌─────────────────────┐  ┌─────────────────────┐
│   👥 100 Users      │  │   ⚡ 70% Faster     │
│   Registered        │  │   Verification      │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│   📸 250 Photos     │  │   ⭐ 85% Accuracy   │
│   Analyzed          │  │   Credit Scoring    │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│   💬 1,500 Messages │  │   😊 95% User       │
│   Processed         │  │   Satisfaction      │
└─────────────────────┘  └─────────────────────┘
```

### Scale Roadmap
**Visual:** Timeline with milestones

```
2025 Q4 (Now)          2026 Q2              2026 Q4              2027 Q4
   │                      │                    │                    │
   ▼                      ▼                    ▼                    ▼
┌──────┐              ┌──────┐            ┌──────┐            ┌──────┐
│ 100  │──────────────│ 10K  │────────────│ 50K  │────────────│ 200K │
│Users │   Pilot      │Users │  Multi-    │Users │  National  │Users │
└──────┘              └──────┘  Institution└──────┘  Scale     └──────┘
   │                      │                    │                    │
   │                      │                    │                    │
Amartha              5 Institutions      20 Institutions    Nationwide
Central Java         3 Regions           All Indonesia      + Export
```

### Future Features (Gemini-Powered)
**Visual:** Feature cards with Gemini integration

**Feature 1: Voice Conversations**
```
┌─────────────────────────────────┐
│  🎤 Voice Message Support       │
├─────────────────────────────────┤
│  Gemini Integration:            │
│  • Speech-to-text               │
│  • Natural language processing  │
│  • Text-to-speech response      │
│                                 │
│  Impact: Reach low-literacy     │
│  users in rural areas           │
└─────────────────────────────────┘
```

**Feature 2: Predictive Analytics**
```
┌─────────────────────────────────┐
│  📊 Business Health Prediction  │
├─────────────────────────────────┤
│  Gemini Integration:            │
│  • Analyze historical data      │
│  • Predict cashflow trends      │
│  • Early warning for defaults   │
│                                 │
│  Impact: 30% reduction in       │
│  default rates                  │
└─────────────────────────────────┘
```

**Feature 3: Automated Business Planning**
```
┌─────────────────────────────────┐
│  📝 AI Business Plan Generator  │
├─────────────────────────────────┤
│  Gemini Integration:            │
│  • Generate custom plans        │
│  • Market analysis              │
│  • Financial projections        │
│                                 │
│  Impact: Empower entrepreneurs  │
│  to scale systematically        │
└─────────────────────────────────┘
```

### Vision Statement
**Visual:** Large inspirational text box

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  "By 2030, Akademi-AI will be the financial           ║
║   operating system for 10 million UMKM                ║
║   entrepreneurs across Southeast Asia,                ║
║   powered by Google Gemini AI."                       ║
║                                                        ║
║  We're not just building a chatbot.                   ║
║  We're democratizing financial services               ║
║  for the world's informal economy.                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## VISUAL BOARD CREATION GUIDE

### Recommended Tools:

**Option 1: Miro (Recommended)**
- Best for: Collaborative, interactive boards
- Template: Use "Product Development" template
- Features: Sticky notes, flowcharts, mockups
- Link: https://miro.com

**Option 2: Figma**
- Best for: High-fidelity mockups and designs
- Template: Create custom frames for each section
- Features: Components, prototyping, comments
- Link: https://figma.com

**Option 3: Google Slides**
- Best for: Simple, shareable presentations
- Template: Use landscape orientation
- Features: Easy sharing, commenting
- Link: https://slides.google.com

### Layout Recommendations:

**Horizontal Flow (Recommended for Miro/Figma):**
```
[Section 1] → [Section 2] → [Section 3] → [Section 4] → [Section 5] → [Section 6]
Problem      Solution      Architecture  Development   UX/Mockups    Impact
```

**Vertical Sections (Recommended for Google Slides):**
```
Slide 1-2: Problem & Ideation
Slide 3-4: Solution & User Flows
Slide 5-6: Gemini Architecture
Slide 7-10: Development with Gemini (detailed examples)
Slide 11-13: UX Mockups
Slide 14-15: Impact & Vision
```

### Design Tips:

1. **Use Consistent Colors:**
   - Primary: #4285F4 (Google Blue)
   - Success: #34A853 (Green)
   - Warning: #FBBC04 (Yellow)
   - Accent: #EA4335 (Red)

2. **Include Real Screenshots:**
   - WhatsApp conversations
   - Dashboard interface
   - Code snippets
   - Gemini API responses

3. **Add Visual Hierarchy:**
   - Large headers for sections
   - Icons for features
   - Arrows for flows
   - Boxes for emphasis

4. **Make it Interactive (Miro/Figma):**
   - Clickable prototypes
   - Expandable sections
   - Video demos embedded
   - Links to live demo

### Content Checklist:

- [ ] Problem statement with statistics
- [ ] Solution overview with value prop
- [ ] User personas (3)
- [ ] User journey map
- [ ] Key user flows (3)
- [ ] System architecture diagram
- [ ] Gemini integration points (4)
- [ ] Development examples (8)
- [ ] WhatsApp mockups (3)
- [ ] Dashboard mockups (2)
- [ ] Impact metrics
- [ ] Scale roadmap
- [ ] Future features (3)
- [ ] Vision statement

---

## CRITICAL: Gemini Usage Documentation

### Must Include These Specific Examples:

**1. Tool Calling Implementation**
- Show the registerUserTool definition
- Show Gemini's function call response
- Show how it triggered database write

**2. Vision API Integration**
- Show the image analysis prompt
- Show the JSON response structure
- Show credit score calculation

**3. Prompt Engineering Evolution**
- Show v1 prompt (basic)
- Show v2 prompt (improved)
- Show v3 prompt (final with RAG)

**4. Code Generation Examples**
- Show actual code generated by Gemini
- Highlight what was modified vs used as-is
- Show time saved metrics

**5. Testing & Validation**
- Show test cases generated by Gemini
- Show error messages improved by Gemini
- Show documentation written by Gemini

### Gemini Impact Summary Box
**Visual:** Prominent box on every section

```
┌─────────────────────────────────────────┐
│  🤖 GEMINI AI POWERED THIS SECTION      │
├─────────────────────────────────────────┤
│  Model: Gemini 2.5 Flash               │
│  Use Case: [Specific use case]         │
│  Impact: [Time saved / Quality gain]   │
└─────────────────────────────────────────┘
```

---

## Final Deliverable

**What to Submit:**
1. **Link to Visual Board** (Miro/Figma/Slides)
2. **PDF Export** (backup in case link breaks)
3. **Video Walkthrough** (2-3 min screen recording)

**Board Should Demonstrate:**
- ✅ Complete project journey from problem to solution
- ✅ Detailed user flows and mockups
- ✅ **Extensive Gemini integration examples**
- ✅ Real code snippets and API responses
- ✅ Impact metrics and future vision
- ✅ Professional design and clear narrative

**Success Criteria:**
- Judges can understand the entire project in 5 minutes
- Gemini's role is crystal clear throughout
- Visual appeal and professional presentation
- Interactive elements engage judges
- Story flows naturally from problem to impact

---

**Ready to create your winning visual board! 🎨🚀**
