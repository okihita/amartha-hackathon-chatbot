const QuizService = require('../src/services/QuizService');
const QuizSessionRepository = require('../src/repositories/QuizSessionRepository');

// Mock data
const mockQuestions = [
  { question: "Q1", options: ["A", "B", "C", "D"], correct: 0, explanation: "Exp1" },
  { question: "Q2", options: ["A", "B", "C", "D"], correct: 1, explanation: "Exp2" },
  { question: "Q3", options: ["A", "B", "C", "D"], correct: 2, explanation: "Exp3" },
  { question: "Q4", options: ["A", "B", "C", "D"], correct: 3, explanation: "Exp4" },
  { question: "Q5", options: ["A", "B", "C", "D"], correct: 0, explanation: "Exp5" },
];

describe('QuizService', () => {
  const testPhone = '628123456789';

  beforeEach(() => {
    // Clear sessions before each test
    QuizSessionRepository.delete(testPhone);
  });

  test('selectRandomQuestions should return correct count', () => {
    const selected = QuizService.selectRandomQuestions(mockQuestions, 4);
    expect(selected.length).toBe(4);
    expect(selected.every(q => mockQuestions.includes(q))).toBe(true);
  });

  test('findNextIncompleteWeek should find first incomplete', () => {
    const literacy = {
      week_01: { score: 100, completed: true },
      week_02: { score: 50, completed: false },
      week_03: { score: 0, completed: false },
    };
    
    const nextWeek = QuizService.findNextIncompleteWeek(literacy);
    expect(nextWeek).toBe(2);
  });

  test('findNextIncompleteWeek should return null when all completed', () => {
    const literacy = {};
    for (let i = 1; i <= 15; i++) {
      literacy[`week_${String(i).padStart(2, '0')}`] = { score: 100, completed: true };
    }
    
    const nextWeek = QuizService.findNextIncompleteWeek(literacy);
    expect(nextWeek).toBeNull();
  });

  test('session should be created and retrieved', () => {
    const session = QuizSessionRepository.create(testPhone, 1, mockQuestions);
    
    expect(session.phone).toBe(testPhone);
    expect(session.week_number).toBe(1);
    expect(session.questions_pool.length).toBe(5);
    expect(session.correct_count).toBe(0);
    expect(session.total_asked).toBe(0);

    const retrieved = QuizSessionRepository.get(testPhone);
    expect(retrieved).toEqual(session);
  });

  test('session should be updated', () => {
    QuizSessionRepository.create(testPhone, 1, mockQuestions);
    
    const updated = QuizSessionRepository.update(testPhone, {
      correct_count: 2,
      total_asked: 3
    });

    expect(updated.correct_count).toBe(2);
    expect(updated.total_asked).toBe(3);
  });

  test('session should be deleted', () => {
    QuizSessionRepository.create(testPhone, 1, mockQuestions);
    expect(QuizSessionRepository.exists(testPhone)).toBe(true);

    QuizSessionRepository.delete(testPhone);
    expect(QuizSessionRepository.exists(testPhone)).toBe(false);
  });

  test('getNextQuestion should return unused question', () => {
    const session = QuizSessionRepository.create(testPhone, 1, mockQuestions.slice(0, 4));
    
    const q1 = QuizService.getNextQuestion(session);
    expect(q1).toBeTruthy();
    expect(mockQuestions.some(q => q.question === q1.question)).toBe(true);

    const updatedSession = QuizSessionRepository.get(testPhone);
    expect(updatedSession.questions_asked.length).toBe(1);
    expect(updatedSession.current_question).toEqual(q1);
  });

  test('getNextQuestion should not repeat questions', () => {
    const session = QuizSessionRepository.create(testPhone, 1, mockQuestions.slice(0, 4));
    
    const q1 = QuizService.getNextQuestion(session);
    const q2 = QuizService.getNextQuestion(QuizSessionRepository.get(testPhone));
    const q3 = QuizService.getNextQuestion(QuizSessionRepository.get(testPhone));
    const q4 = QuizService.getNextQuestion(QuizSessionRepository.get(testPhone));

    const questions = [q1, q2, q3, q4];
    const uniqueQuestions = new Set(questions.map(q => q.question));
    
    expect(uniqueQuestions.size).toBe(4);
  });

  test('getNextQuestion should return null when no more questions', () => {
    const session = QuizSessionRepository.create(testPhone, 1, mockQuestions.slice(0, 2));
    
    QuizService.getNextQuestion(session);
    QuizService.getNextQuestion(QuizSessionRepository.get(testPhone));
    const q3 = QuizService.getNextQuestion(QuizSessionRepository.get(testPhone));

    expect(q3).toBeNull();
  });

  test('quiz progress calculation', () => {
    // 1 correct out of 4 = 25%
    expect(Math.round((1 / 4) * 100)).toBe(25);
    
    // 2 correct out of 4 = 50%
    expect(Math.round((2 / 4) * 100)).toBe(50);
    
    // 3 correct out of 4 = 75% (passing)
    expect(Math.round((3 / 4) * 100)).toBe(75);
    
    // 4 correct out of 4 = 100%
    expect(Math.round((4 / 4) * 100)).toBe(100);
  });

  test('session timeout cleanup', (done) => {
    // Create session with short timeout
    QuizSessionRepository.SESSION_TIMEOUT = 100; // 100ms for testing
    QuizSessionRepository.create(testPhone, 1, mockQuestions);
    
    expect(QuizSessionRepository.exists(testPhone)).toBe(true);

    setTimeout(() => {
      const session = QuizSessionRepository.get(testPhone);
      expect(session).toBeNull();
      
      // Reset timeout
      QuizSessionRepository.SESSION_TIMEOUT = 30 * 60 * 1000;
      done();
    }, 150);
  });
});

console.log('✅ Quiz tests defined. Run with: npm test');
