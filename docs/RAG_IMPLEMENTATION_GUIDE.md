# RAG Implementation Guide for Amartha Chatbot

## Overview

This guide explains how to integrate two sets of RAG documents:
1. **Business Classifications** - 20 business types with 5 maturity levels each
2. **Financial Literacy Modules** - 15 weeks of courses with quizzes

---

## Architecture Decision

### Recommended: Firestore-Based RAG

**Why Firestore?**
- ✅ Already integrated in the project
- ✅ Fast queries with compound indexes
- ✅ Real-time updates
- ✅ Cost-effective for <1000 documents
- ✅ No additional infrastructure
- ✅ Easy to maintain and update

**When to use Vector DB instead:**
- Need semantic similarity search
- Have >1000 documents
- Need multilingual support
- Want advanced RAG features

---

## Database Schema

### Collection: `business_classifications`

```javascript
{
  id: "warung_sembako",                    // Document ID
  business_type: "Warung Sembako",
  legal_category: "Mikro",                 // Mikro, Kecil, Menengah
  description: "Toko yang menjual kebutuhan pokok sehari-hari",
  
  // Maturity levels (1-5)
  levels: [
    {
      level: 1,
      name: "Pemula - Baru Memulai",
      criteria: [
        "Omzet < Rp 5 juta/bulan",
        "Belum ada pembukuan",
        "Modal dari tabungan pribadi"
      ],
      characteristics: [
        "Usaha baru berjalan <6 bulan",
        "Belum memiliki pelanggan tetap",
        "Stok barang terbatas"
      ],
      next_steps: [
        "Mulai catat pemasukan dan pengeluaran harian",
        "Buat daftar pelanggan tetap",
        "Pelajari cara menghitung laba rugi"
      ],
      swot: {
        strengths: [
          "Lokasi strategis di dekat rumah",
          "Kenal dengan warga sekitar"
        ],
        weaknesses: [
          "Modal terbatas",
          "Belum ada sistem pembukuan",
          "Stok barang sering habis"
        ],
        opportunities: [
          "Banyak warga yang belum punya warung dekat",
          "Bisa jual produk tambahan (pulsa, token listrik)"
        ],
        threats: [
          "Ada warung lain yang lebih besar",
          "Harga sembako naik turun"
        ]
      },
      recommended_actions: [
        "Ikuti pelatihan pembukuan dasar",
        "Bergabung dengan Majelis untuk belajar dari ibu-ibu lain",
        "Mulai gunakan aplikasi pencatatan sederhana"
      ],
      estimated_duration: "3-6 bulan"
    },
    {
      level: 2,
      name: "Berkembang - Mulai Stabil",
      criteria: [
        "Omzet Rp 5-15 juta/bulan",
        "Sudah ada pembukuan sederhana",
        "Punya pelanggan tetap"
      ],
      // ... similar structure
    },
    // ... levels 3-5
  ],
  
  // For RAG retrieval
  keywords: [
    "warung", "sembako", "toko kelontong", 
    "kebutuhan pokok", "beras", "minyak", "gula"
  ],
  
  // Metadata
  created_at: "2025-11-22T00:00:00Z",
  updated_at: "2025-11-22T00:00:00Z"
}
```

### Collection: `financial_literacy_modules`

```javascript
{
  id: "week_1",                            // Document ID
  week: 1,
  title: "Pengenalan Literasi Keuangan",
  subtitle: "Memahami Pentingnya Mengelola Uang",
  
  description: "Modul ini memperkenalkan konsep dasar literasi keuangan dan pentingnya mengelola keuangan untuk UMKM",
  
  learning_objectives: [
    "Memahami apa itu literasi keuangan",
    "Mengetahui manfaat literasi keuangan untuk usaha",
    "Mampu membedakan kebutuhan dan keinginan"
  ],
  
  content: {
    introduction: "Literasi keuangan adalah...",
    main_topics: [
      {
        topic: "Apa itu Literasi Keuangan?",
        content: "...",
        examples: ["..."]
      },
      {
        topic: "Mengapa Penting untuk UMKM?",
        content: "...",
        examples: ["..."]
      }
    ],
    summary: "...",
    key_takeaways: ["...", "...", "..."]
  },
  
  quiz: [
    {
      id: "q1",
      question: "Apa yang dimaksud dengan literasi keuangan?",
      options: [
        "A. Kemampuan membaca dan menulis tentang uang",
        "B. Kemampuan mengelola keuangan dengan baik",
        "C. Kemampuan menghitung uang dengan cepat",
        "D. Kemampuan menghasilkan uang banyak"
      ],
      correct_answer: "B",
      explanation: "Literasi keuangan adalah kemampuan untuk memahami dan mengelola keuangan dengan baik, termasuk perencanaan, penganggaran, dan investasi."
    },
    {
      id: "q2",
      question: "Manakah yang termasuk kebutuhan untuk usaha warung?",
      options: [
        "A. Membeli HP baru untuk jualan online",
        "B. Membeli stok beras dan minyak",
        "C. Renovasi warung dengan cat warna-warni",
        "D. Membeli etalase kaca yang mahal"
      ],
      correct_answer: "B",
      explanation: "Kebutuhan adalah hal yang harus dipenuhi untuk menjalankan usaha. Stok barang adalah kebutuhan utama warung."
    },
    // ... 8-10 questions per week
  ],
  
  passing_score: 70,
  
  // For RAG retrieval
  keywords: [
    "literasi keuangan", "mengelola uang", "kebutuhan", 
    "keinginan", "dasar keuangan"
  ],
  
  // Metadata
  difficulty: "Pemula",
  estimated_time: "30 menit",
  created_at: "2025-11-22T00:00:00Z",
  updated_at: "2025-11-22T00:00:00Z"
}
```

### Collection: `user_progress`

```javascript
{
  user_phone: "628567881764",              // Document ID
  
  // Business maturity tracking
  business_type: "warung_sembako",
  current_maturity_level: 2,
  maturity_history: [
    {
      level: 1,
      achieved_at: "2025-10-01T00:00:00Z",
      duration_days: 90
    },
    {
      level: 2,
      achieved_at: "2025-11-01T00:00:00Z",
      duration_days: 30
    }
  ],
  
  // Financial literacy tracking
  current_week: 3,
  completed_weeks: [1, 2],
  quiz_scores: [
    {
      week: 1,
      score: 80,
      total_questions: 10,
      correct_answers: 8,
      completed_at: "2025-11-08T10:00:00Z",
      time_taken_minutes: 15
    },
    {
      week: 2,
      score: 90,
      total_questions: 10,
      correct_answers: 9,
      completed_at: "2025-11-15T14:30:00Z",
      time_taken_minutes: 12
    }
  ],
  
  // Reminder tracking
  last_reminder_sent: "2025-11-22T09:00:00Z",
  next_quiz_due: "2025-11-29T00:00:00Z",
  reminder_frequency: "weekly",            // daily, weekly, biweekly
  preferred_reminder_time: "09:00",
  
  // Engagement metrics
  total_quizzes_taken: 2,
  average_score: 85,
  streak_days: 14,
  last_active: "2025-11-22T15:30:00Z",
  
  created_at: "2025-11-01T00:00:00Z",
  updated_at: "2025-11-22T15:30:00Z"
}
```

---

## Implementation Steps

### Step 1: Convert Google Docs to Structured Data

#### Option A: Manual Conversion (Recommended for Quality)

1. **Export Google Docs to Markdown**
   ```
   File → Download → Markdown (.md)
   ```

2. **Create Conversion Script**
   ```javascript
   // scripts/convert-docs-to-firestore.js
   const fs = require('fs');
   const { Firestore } = require('@google-cloud/firestore');
   
   async function importBusinessClassifications() {
     const db = new Firestore();
     
     // Read markdown files
     const files = fs.readdirSync('./data/business-classifications');
     
     for (const file of files) {
       const content = fs.readFileSync(`./data/business-classifications/${file}`, 'utf8');
       
       // Parse markdown to structured data
       const data = parseBusinessClassification(content);
       
       // Save to Firestore
       await db.collection('business_classifications').doc(data.id).set(data);
       console.log(`Imported: ${data.business_type}`);
     }
   }
   
   function parseBusinessClassification(markdown) {
     // Parse markdown structure
     // Extract: business_type, levels, SWOT, etc.
     // Return structured object
   }
   ```

#### Option B: Use Google Docs API (Automated)

```javascript
// scripts/import-from-google-docs.js
const { google } = require('googleapis');

async function fetchGoogleDoc(docId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });
  
  const docs = google.docs({ version: 'v1', auth });
  const doc = await docs.documents.get({ documentId: docId });
  
  return doc.data;
}
```

### Step 2: Create RAG Retrieval Functions

```javascript
// src/rag.js
const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();

// Get business classification by type
async function getBusinessClassification(businessType) {
  const snapshot = await db.collection('business_classifications')
    .where('keywords', 'array-contains', businessType.toLowerCase())
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

// Get current maturity level info
async function getMaturityLevelInfo(businessType, level) {
  const classification = await getBusinessClassification(businessType);
  if (!classification) return null;
  
  return classification.levels.find(l => l.level === level);
}

// Get financial literacy module
async function getFinancialModule(week) {
  const doc = await db.collection('financial_literacy_modules')
    .doc(`week_${week}`)
    .get();
  
  if (!doc.exists) return null;
  return doc.data();
}

// Get user progress
async function getUserProgress(phone) {
  const doc = await db.collection('user_progress').doc(phone).get();
  if (!doc.exists) return null;
  return doc.data();
}

// Search across all content
async function searchContent(query) {
  const keywords = query.toLowerCase().split(' ');
  
  // Search business classifications
  const businessResults = await db.collection('business_classifications')
    .where('keywords', 'array-contains-any', keywords.slice(0, 10))
    .limit(3)
    .get();
  
  // Search financial modules
  const moduleResults = await db.collection('financial_literacy_modules')
    .where('keywords', 'array-contains-any', keywords.slice(0, 10))
    .limit(3)
    .get();
  
  return {
    business: businessResults.docs.map(d => d.data()),
    modules: moduleResults.docs.map(d => d.data())
  };
}

module.exports = {
  getBusinessClassification,
  getMaturityLevelInfo,
  getFinancialModule,
  getUserProgress,
  searchContent
};
```

### Step 3: Integrate with AI Engine

```javascript
// src/aiEngine.js - Add RAG context

const { searchContent, getMaturityLevelInfo, getUserProgress } = require('./rag');

async function getGeminiResponse(userText, senderPhone) {
  const userProfile = await getUserContext(senderPhone);
  const userProgress = await getUserProgress(senderPhone);
  
  // Search RAG content
  const ragResults = await searchContent(userText);
  
  // Build context
  let ragContext = '';
  
  // Add business maturity context
  if (userProfile.business_type && userProgress) {
    const maturityInfo = await getMaturityLevelInfo(
      userProfile.business_type, 
      userProgress.current_maturity_level
    );
    
    if (maturityInfo) {
      ragContext += `\n\nBUSINESS MATURITY LEVEL:\n`;
      ragContext += `Current Level: ${maturityInfo.level} - ${maturityInfo.name}\n`;
      ragContext += `Next Steps: ${maturityInfo.next_steps.join(', ')}\n`;
    }
  }
  
  // Add financial literacy context
  if (ragResults.modules.length > 0) {
    ragContext += `\n\nRELEVANT FINANCIAL LITERACY CONTENT:\n`;
    ragResults.modules.forEach(module => {
      ragContext += `Week ${module.week}: ${module.title}\n`;
      ragContext += `Key Points: ${module.content.key_takeaways.join(', ')}\n`;
    });
  }
  
  // Build system prompt with RAG context
  const systemPrompt = `
  PERAN: Akademi-AI, asisten bisnis untuk ${userProfile.name}
  
  USER CONTEXT:
  - Nama: ${userProfile.name}
  - Usaha: ${userProfile.business_type}
  - Level Kematangan: ${userProgress?.current_maturity_level || 1}
  - Modul Literasi: Week ${userProgress?.current_week || 1}
  
  ${ragContext}
  
  INSTRUKSI:
  - Gunakan informasi di atas untuk memberikan saran yang relevan
  - Sesuaikan jawaban dengan level kematangan bisnis user
  - Referensikan modul literasi keuangan yang sesuai
  - Berikan langkah konkret yang bisa dilakukan
  `;
  
  // Continue with Gemini call...
}
```

### Step 4: Add Quiz Functionality

```javascript
// src/quiz.js
const { getFinancialModule, getUserProgress } = require('./rag');
const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();

async function startQuiz(phone, week) {
  const module = await getFinancialModule(week);
  if (!module) return { error: 'Module not found' };
  
  // Store quiz session
  await db.collection('quiz_sessions').doc(`${phone}_${week}`).set({
    phone,
    week,
    questions: module.quiz,
    current_question: 0,
    answers: [],
    started_at: new Date().toISOString()
  });
  
  return {
    title: module.title,
    total_questions: module.quiz.length,
    first_question: module.quiz[0]
  };
}

async function answerQuestion(phone, week, answer) {
  const sessionDoc = await db.collection('quiz_sessions')
    .doc(`${phone}_${week}`)
    .get();
  
  if (!sessionDoc.exists) return { error: 'Quiz session not found' };
  
  const session = sessionDoc.data();
  const currentQ = session.questions[session.current_question];
  const isCorrect = currentQ.correct_answer === answer;
  
  // Save answer
  session.answers.push({
    question_id: currentQ.id,
    answer,
    is_correct: isCorrect
  });
  
  session.current_question++;
  
  // Check if quiz completed
  if (session.current_question >= session.questions.length) {
    return await completeQuiz(phone, week, session);
  }
  
  // Update session and return next question
  await db.collection('quiz_sessions').doc(`${phone}_${week}`).update(session);
  
  return {
    is_correct: isCorrect,
    explanation: currentQ.explanation,
    next_question: session.questions[session.current_question],
    progress: `${session.current_question}/${session.questions.length}`
  };
}

async function completeQuiz(phone, week, session) {
  const correctAnswers = session.answers.filter(a => a.is_correct).length;
  const score = Math.round((correctAnswers / session.questions.length) * 100);
  
  // Save to user progress
  const progressRef = db.collection('user_progress').doc(phone);
  const progress = (await progressRef.get()).data() || {};
  
  progress.quiz_scores = progress.quiz_scores || [];
  progress.quiz_scores.push({
    week,
    score,
    total_questions: session.questions.length,
    correct_answers: correctAnswers,
    completed_at: new Date().toISOString()
  });
  
  if (score >= 70) {
    progress.completed_weeks = progress.completed_weeks || [];
    if (!progress.completed_weeks.includes(week)) {
      progress.completed_weeks.push(week);
    }
    progress.current_week = week + 1;
  }
  
  await progressRef.set(progress, { merge: true });
  
  // Delete quiz session
  await db.collection('quiz_sessions').doc(`${phone}_${week}`).delete();
  
  return {
    completed: true,
    score,
    correct_answers: correctAnswers,
    total_questions: session.questions.length,
    passed: score >= 70,
    message: score >= 70 
      ? `Selamat! Anda lulus dengan skor ${score}. Lanjut ke Week ${week + 1}!`
      : `Skor Anda ${score}. Coba lagi untuk mencapai minimal 70.`
  };
}

module.exports = { startQuiz, answerQuestion, completeQuiz };
```

### Step 5: Add Reminder System

```javascript
// src/reminders.js
const { Firestore } = require('@google-cloud/firestore');
const { sendMessage } = require('./whatsapp');
const db = new Firestore();

async function sendWeeklyReminders() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Send reminders on Monday (1)
  if (dayOfWeek !== 1) return;
  
  const usersSnapshot = await db.collection('user_progress')
    .where('reminder_frequency', '==', 'weekly')
    .get();
  
  for (const doc of usersSnapshot.docs) {
    const progress = doc.data();
    const phone = doc.id;
    
    // Check if reminder already sent today
    const lastReminder = new Date(progress.last_reminder_sent);
    if (lastReminder.toDateString() === now.toDateString()) continue;
    
    // Get current module
    const week = progress.current_week || 1;
    const module = await getFinancialModule(week);
    
    if (!module) continue;
    
    const message = `📚 *Reminder Literasi Keuangan*\n\n` +
      `Halo Ibu! Sudah waktunya belajar modul baru:\n\n` +
      `📖 Week ${week}: ${module.title}\n` +
      `⏱️ Estimasi: ${module.estimated_time}\n\n` +
      `Ketik "mulai quiz week ${week}" untuk memulai!\n\n` +
      `Semangat belajar! 💪`;
    
    await sendMessage(phone, message);
    
    // Update last reminder sent
    await db.collection('user_progress').doc(phone).update({
      last_reminder_sent: now.toISOString()
    });
  }
}

// Run this with Cloud Scheduler or cron job
module.exports = { sendWeeklyReminders };
```

---

## Deployment Steps

### 1. Prepare Data Files

```bash
# Create data directory
mkdir -p data/business-classifications
mkdir -p data/financial-modules

# Export Google Docs to Markdown
# Place files in respective directories
```

### 2. Create Import Script

```bash
# Create script
touch scripts/import-rag-data.js

# Run import
node scripts/import-rag-data.js
```

### 3. Update AI Engine

```bash
# Add RAG integration to aiEngine.js
# Add quiz functionality
# Add reminder system
```

### 4. Deploy

```bash
# Deploy to Cloud Run
./deploy.sh

# Set up Cloud Scheduler for reminders
gcloud scheduler jobs create http weekly-reminders \
  --schedule="0 9 * * 1" \
  --uri="https://your-app.run.app/api/send-reminders" \
  --http-method=POST
```

---

## Testing

### Test Business Classification RAG

```
User: "Bagaimana cara mengembangkan warung sembako saya?"
Bot: [Uses RAG to provide level-specific advice]
```

### Test Financial Literacy Quiz

```
User: "Mulai quiz week 1"
Bot: [Starts quiz with first question]

User: "B"
Bot: [Validates answer, shows next question]
```

### Test Reminders

```
# Manually trigger
curl -X POST https://your-app.run.app/api/send-reminders
```

---

## Maintenance

### Updating Content

```javascript
// Update a business classification
await db.collection('business_classifications')
  .doc('warung_sembako')
  .update({
    'levels.0.next_steps': ['New step 1', 'New step 2']
  });

// Update a financial module
await db.collection('financial_literacy_modules')
  .doc('week_1')
  .update({
    'quiz': newQuizQuestions
  });
```

### Monitoring

```javascript
// Track quiz completion rates
const stats = await db.collection('user_progress')
  .where('completed_weeks', 'array-contains', 1)
  .get();

console.log(`Week 1 completion: ${stats.size} users`);
```

---

## Cost Estimation

### Firestore Costs (for 1000 users)
- **Storage**: ~1GB = $0.18/month
- **Reads**: ~100k/day = $0.36/day
- **Writes**: ~10k/day = $0.18/day
- **Total**: ~$20/month

### Gemini API Costs
- **Text**: ~1M tokens/day = $0.50/day
- **Total**: ~$15/month

**Total Estimated Cost**: ~$35/month for 1000 active users

---

## Next Steps

1. ✅ Export Google Docs to Markdown
2. ✅ Create import scripts
3. ✅ Set up Firestore collections
4. ✅ Integrate RAG with AI engine
5. ✅ Add quiz functionality
6. ✅ Set up reminder system
7. ✅ Test with sample users
8. ✅ Deploy to production
9. ✅ Monitor and iterate

---

**Questions?** Check the implementation examples in the code above or refer to Firestore documentation.
