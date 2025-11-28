# Financial Literacy Quiz Feature

## Overview
Interactive WhatsApp quiz system that guides users through a 15-week financial literacy course with automatic progress tracking.

## User Commands
- `mulai kuis` / `quiz` / `belajar` - Start or resume quiz
- `progress` / `nilai` - Show literacy progress and scores

## How It Works

### 1. Starting a Quiz
When user sends "quiz" or similar command:
1. AI detects intent and calls `startQuiz` tool
2. System finds next incomplete week (score < 70%)
3. Randomly selects 4 questions from that week's question bank
4. Sends first question as WhatsApp List Message

### 2. Answering Questions
- User receives interactive list with 4 options (A, B, C, D)
- User selects answer from list
- System validates answer and provides feedback
- Shows explanation (if available)
- Displays current progress (e.g., "2/4 correct")

### 3. Quiz Completion
After 4 questions:
- Calculate score: each correct answer = 25%
- Passing score: 70% (3/4 correct)
- Save score to Firestore `users/{phone}/literacy/week_XX`
- If passed: congratulate and prompt for next week
- If failed: allow retry

### 4. Progress Tracking
User can check progress anytime:
- Shows completed weeks with scores
- Shows in-progress weeks
- Shows overall completion percentage
- Prompts to continue next week

## Technical Implementation

### Components Created
1. **QuizService** (`src/services/QuizService.js`)
   - Core quiz logic
   - Question selection
   - Answer validation
   - Progress calculation

2. **QuizSessionRepository** (`src/repositories/QuizSessionRepository.js`)
   - In-memory session storage
   - 30-minute timeout
   - Session cleanup

3. **WhatsApp Interactive Messages** (`src/chatbot/whatsapp.js`)
   - `sendListMessage()` - Send list with options
   - `sendQuizQuestion()` - Format quiz question

4. **Webhook Handler** (`src/controllers/WebhookController.js`)
   - Handle interactive message responses
   - Extract selected option
   - Process answer and send feedback

5. **AI Tools** (`src/chatbot/aiEngine.js`)
   - `startQuiz` - Detect quiz start intent
   - `showProgress` - Detect progress check intent

### Data Flow
```
User: "quiz"
  ↓
AI Engine detects intent → calls startQuiz tool
  ↓
QuizService.startQuiz(phone)
  ↓
- Get user literacy progress
- Find next incomplete week
- Fetch questions from RAG
- Select 4 random questions
- Create session
  ↓
Send first question via WhatsApp List Message
  ↓
User selects option (e.g., "opt_2")
  ↓
Webhook receives interactive message
  ↓
QuizService.checkAnswer(phone, 2)
  ↓
- Validate answer
- Update session
- Calculate progress
- Check if quiz complete
  ↓
If complete: Save to Firestore
If not: Send next question
```

### Session Management
- Sessions stored in-memory (Map)
- Auto-cleanup after 30 minutes inactivity
- Prevents duplicate sessions
- Tracks:
  - Current week
  - Questions asked
  - Correct count
  - Current question

### Progress Storage
Stored in Firestore: `users/{phone}/literacy/data`
```javascript
{
  week_01: {
    score: 100,
    last_updated: "2025-11-24T...",
    completed: true
  },
  week_02: {
    score: 75,
    last_updated: "2025-11-24T...",
    completed: true
  },
  // ... week_03 to week_15
}
```

## Testing

### Unit Tests
```bash
npm test -- tests/quiz.test.js
```

Tests cover:
- Random question selection
- Finding next incomplete week
- Session creation/update/delete
- Question rotation (no repeats)
- Progress calculation
- Session timeout

### Integration Tests
```bash
./tests/quiz-integration.test.sh
```

Tests full flow:
- Start quiz command
- Answer 4 questions
- Check progress
- Start next quiz

## WhatsApp Message Format

### List Message (Question)
```
📚 Pertanyaan 1/4

Apa itu arus kas?

[Button: 📝 Pilih Jawaban]
  A. Uang masuk dan keluar
  B. Keuntungan usaha
  C. Modal awal
  D. Hutang piutang
```

### Feedback Message
```
✅ Benar!

Arus kas adalah catatan uang masuk dan keluar dari usaha.

📊 Progress: 1/4 benar
```

### Completion Message (Passed)
```
🎉 Selamat! Anda lulus minggu ini dengan nilai 75!

Ketik "quiz" untuk lanjut ke minggu berikutnya.
```

### Completion Message (Failed)
```
📚 Nilai Anda: 50

Anda perlu nilai minimal 70 untuk lulus. Ketik "quiz" untuk mengulang.
```

### Progress Message
```
📊 Progress Literasi Keuangan Anda:

✅ Selesai: 3/15 minggu (20%)

🎯 Minggu yang Lulus:
• Minggu 1: 100%
• Minggu 2: 75%
• Minggu 3: 100%

💡 Ketik "quiz" untuk melanjutkan!
```

## Edge Cases Handled
1. ✅ User already completed all 15 weeks
2. ✅ User in middle of quiz session (resume)
3. ✅ Session timeout (auto-cleanup)
4. ✅ Invalid answer format (error message)
5. ✅ Week already completed (allow retry)
6. ✅ No questions available for week (error)
7. ✅ User not found (error)

## Future Enhancements
- [ ] Leaderboard per majelis
- [ ] Badges/achievements
- [ ] Retry limit (max 3 attempts per week)
- [ ] Detailed explanation after wrong answer
- [ ] Progress sharing to field agent
- [ ] Quiz reminders
- [ ] Certificate generation after completion

## Performance
- In-memory sessions: O(1) lookup
- Question selection: O(n) shuffle
- Progress calculation: O(1)
- Session cleanup: O(n) periodic scan

## Security
- Phone number validation
- Session timeout (30 min)
- No sensitive data in sessions
- Firestore security rules apply
