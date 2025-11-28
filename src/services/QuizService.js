const RAGRepository = require('../repositories/RAGRepository');
const UserRepository = require('../repositories/UserRepository');
const QuizSessionRepository = require('../repositories/QuizSessionRepository');

class QuizService {
  constructor() {
    this.QUESTIONS_PER_QUIZ = 4;
    this.PASSING_SCORE = 70;
  }

  // Start or resume quiz for user
  async startQuiz(phone) {
    // Check if session exists
    let session = QuizSessionRepository.get(phone);
    if (session) {
      return { resumed: true, session };
    }

    // Get user's literacy progress
    const user = await UserRepository.findByPhone(phone);
    if (!user) throw new Error('User not found');

    const literacy = user.literacy || {};
    
    // Find next incomplete week
    const nextWeek = this.findNextIncompleteWeek(literacy);
    if (!nextWeek) {
      return { completed: true, message: '🎉 Selamat! Anda telah menyelesaikan semua 15 minggu literasi keuangan!' };
    }

    // Get questions for this week
    const allQuestions = await RAGRepository.getFinancialLiteracyByWeek(nextWeek);
    if (!allQuestions || !allQuestions.bank_soal || allQuestions.bank_soal.length === 0) {
      throw new Error(`No questions found for week ${nextWeek}`);
    }

    // Randomly select 4 questions
    const selectedQuestions = this.selectRandomQuestions(allQuestions.bank_soal, this.QUESTIONS_PER_QUIZ);
    
    // Create session
    session = QuizSessionRepository.create(phone, nextWeek, selectedQuestions);
    
    // Get first question
    const question = this.getNextQuestion(session);
    
    return { 
      started: true, 
      session, 
      question,
      weekInfo: {
        week_number: nextWeek,
        module_name: allQuestions.module_name,
        total_questions: this.QUESTIONS_PER_QUIZ
      }
    };
  }

  // Get next question for session
  getNextQuestion(session) {
    // Find unused question
    const unusedQuestions = session.questions_pool.filter(
      q => !session.questions_asked.includes(q.question)
    );

    if (unusedQuestions.length === 0) {
      return null; // No more questions
    }

    // Pick random from unused
    const question = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
    
    // Update session
    QuizSessionRepository.update(session.phone, {
      current_question: question,
      questions_asked: [...session.questions_asked, question.question]
    });

    return question;
  }

  // Check answer and update progress
  async checkAnswer(phone, answerIndex) {
    const session = QuizSessionRepository.get(phone);
    if (!session || !session.current_question) {
      throw new Error('No active quiz session');
    }

    const question = session.current_question;
    const isCorrect = answerIndex === question.correct;

    // Update session
    const updates = {
      total_asked: session.total_asked + 1,
      correct_count: isCorrect ? session.correct_count + 1 : session.correct_count,
      current_question: null
    };

    QuizSessionRepository.update(phone, updates);
    const updatedSession = QuizSessionRepository.get(phone);

    // Calculate progress
    const progress = (updatedSession.correct_count / this.QUESTIONS_PER_QUIZ) * 100;
    const isComplete = updatedSession.total_asked >= this.QUESTIONS_PER_QUIZ;

    let result = {
      correct: isCorrect,
      progress,
      correct_count: updatedSession.correct_count,
      total_asked: updatedSession.total_asked,
      explanation: question.explanation
    };

    if (isComplete) {
      // Save score to user literacy
      await this.saveProgress(phone, session.week_number, progress);
      QuizSessionRepository.delete(phone);
      
      result.completed = true;
      result.passed = progress >= this.PASSING_SCORE;
      result.score = Math.round(progress);
    } else {
      // Get next question
      result.next_question = this.getNextQuestion(updatedSession);
    }

    return result;
  }

  // Save progress to Firestore
  async saveProgress(phone, weekNumber, score) {
    const weekKey = `week_${String(weekNumber).padStart(2, '0')}`;
    const literacyData = {
      [weekKey]: {
        score: Math.round(score),
        last_updated: new Date(),
        completed: score >= this.PASSING_SCORE
      }
    };

    await UserRepository.updateLiteracy(phone, literacyData);
  }

  // Get user's quiz progress
  async getProgress(phone) {
    const user = await UserRepository.findByPhone(phone);
    if (!user) throw new Error('User not found');

    const literacy = user.literacy || {};
    const completed = [];
    const inProgress = [];

    for (let i = 1; i <= 15; i++) {
      const weekKey = `week_${String(i).padStart(2, '0')}`;
      const weekData = literacy[weekKey];
      
      if (weekData && weekData.score > 0) {
        const info = {
          week: i,
          score: weekData.score,
          completed: weekData.completed || weekData.score >= this.PASSING_SCORE,
          last_updated: weekData.last_updated
        };
        
        if (info.completed) {
          completed.push(info);
        } else {
          inProgress.push(info);
        }
      }
    }

    return {
      completed,
      inProgress,
      total_completed: completed.length,
      total_weeks: 15,
      percentage: Math.round((completed.length / 15) * 100)
    };
  }

  // Helper: Find next incomplete week
  findNextIncompleteWeek(literacy) {
    for (let i = 1; i <= 15; i++) {
      const weekKey = `week_${String(i).padStart(2, '0')}`;
      const weekData = literacy[weekKey];
      
      if (!weekData || !weekData.completed || weekData.score < this.PASSING_SCORE) {
        return i;
      }
    }
    return null; // All completed
  }

  // Helper: Select random questions
  selectRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  // Stop quiz session
  stopQuiz(phone) {
    return QuizSessionRepository.delete(phone);
  }
}

module.exports = new QuizService();
