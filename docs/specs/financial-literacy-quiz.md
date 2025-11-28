# Financial Literacy Quiz Feature

## Overview
Interactive WhatsApp quiz system that guides users through 15-week financial literacy course with progress tracking.

## User Flow

### 1. Starting Quiz
- User sends: "mulai kuis" or "quiz" or "belajar"
- Bot checks current progress from `users/{phone}/literacy`
- Bot presents next incomplete week

### 2. Quiz Session
- Each week has 15 questions in `financial_literacy` collection
- For hackathon: randomly pick 4 questions per week
- Each correct answer = 25% progress
- Wrong answer = no penalty, show next random question
- Use WhatsApp **List Message** or **Reply Buttons** for options

### 3. Progress Tracking
- Store in `users/{phone}/literacy/{week_XX}`
  - `score`: 0-100 (25% per correct answer)
  - `last_updated`: timestamp
  - `completed`: boolean (score >= 70)

### 4. Completion
- Week completed when score >= 70 (3/4 correct)
- Auto-advance to next week
- Show congratulations message
- Update literacy progress in user profile

## Data Model

### Quiz Session State (in-memory or Firestore)
```javascript
{
  phone: "628xxx",
  week_number: 3,
  questions_asked: ["q1_id", "q2_id"],
  correct_count: 2,
  total_asked: 3,
  current_question: {
    id: "q4_id",
    question: "...",
    options: ["a", "b", "c", "d"],
    correct: 2
  }
}
```

### Literacy Progress (existing)
```javascript
users/{phone}/literacy: {
  week_01: { score: 100, last_updated: timestamp, completed: true },
  week_02: { score: 75, last_updated: timestamp, completed: true },
  week_03: { score: 25, last_updated: timestamp, completed: false },
  ...
}
```

## WhatsApp Message Types

### Option 1: Reply Buttons (max 3 buttons)
```javascript
{
  type: "interactive",
  interactive: {
    type: "button",
    body: { text: "Question text" },
    action: {
      buttons: [
        { type: "reply", reply: { id: "opt_a", title: "A. Answer" }},
        { type: "reply", reply: { id: "opt_b", title: "B. Answer" }},
        { type: "reply", reply: { id: "opt_c", title: "C. Answer" }}
      ]
    }
  }
}
```

### Option 2: List Message (better for 4 options)
```javascript
{
  type: "interactive",
  interactive: {
    type: "list",
    body: { text: "Question text" },
    action: {
      button: "Pilih Jawaban",
      sections: [{
        rows: [
          { id: "opt_a", title: "A", description: "Answer text" },
          { id: "opt_b", title: "B", description: "Answer text" },
          { id: "opt_c", title: "C", description: "Answer text" },
          { id: "opt_d", title: "D", description: "Answer text" }
        ]
      }]
    }
  }
}
```

## Implementation Plan

### Phase 1: Core Quiz Logic
1. Create `QuizService` class
   - `startQuiz(phone)` - find next incomplete week
   - `getRandomQuestions(weekNumber, count=4)` - fetch from RAG
   - `checkAnswer(phone, questionId, answer)` - validate & update progress
   - `saveProgress(phone, weekNumber, score)` - update Firestore

### Phase 2: Session Management
1. Create `QuizSessionRepository` (in-memory Map or Firestore)
   - Store active quiz sessions
   - Track current question & progress
   - Auto-cleanup after 30 min inactivity

### Phase 3: WhatsApp Integration
1. Update `aiEngine.js` to detect quiz commands
2. Create `sendQuizQuestion()` in `whatsapp.js`
3. Handle interactive message responses in webhook

### Phase 4: Progress Display
1. Add "Lihat Progress" command
2. Show completed weeks with scores
3. Show current week progress

## Commands

- `mulai kuis` / `quiz` / `belajar` - Start/resume quiz
- `progress` / `nilai` - Show literacy progress
- `ulangi minggu X` - Retry specific week
- `berhenti` - Exit quiz session

## Edge Cases

1. **User already completed all 15 weeks**: Show congratulations + certificate message
2. **User in middle of quiz session**: Resume from last question
3. **Session timeout**: Clear after 30 minutes, allow restart
4. **Invalid answer format**: Prompt to use buttons/list
5. **Week already completed (score >= 70)**: Ask if want to retry or continue to next

## Success Metrics

- Quiz completion rate per week
- Average score per week
- Time to complete each week
- Drop-off points (which weeks users abandon)

## Future Enhancements

- Leaderboard per majelis
- Badges/achievements
- Retry limit (max 3 attempts per week)
- Explanation after wrong answer
- Progress sharing to field agent
