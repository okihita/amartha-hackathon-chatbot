/**
 * Capacity Collection Chat Flow Tests (TDD)
 * Tests for collecting RPC data through natural conversation
 */

const CapacityCollectionService = require('../src/services/CapacityCollectionService');

describe('CapacityCollectionService', () => {
  const testPhone = '628123456789';

  describe('Session Management', () => {
    beforeEach(() => {
      CapacityCollectionService.clearSession(testPhone);
    });

    test('should create new session', () => {
      const session = CapacityCollectionService.startSession(testPhone);
      
      expect(session.phone).toBe(testPhone);
      expect(session.step).toBe(0);
      expect(session.data).toEqual({});
      expect(session.completed).toBe(false);
    });

    test('should get existing session', () => {
      CapacityCollectionService.startSession(testPhone);
      const session = CapacityCollectionService.getSession(testPhone);
      
      expect(session).not.toBeNull();
      expect(session.phone).toBe(testPhone);
    });

    test('should return null for non-existent session', () => {
      const session = CapacityCollectionService.getSession('nonexistent');
      expect(session).toBeNull();
    });
  });

  describe('Question Flow', () => {
    beforeEach(() => {
      CapacityCollectionService.clearSession(testPhone);
    });

    test('should have 5 questions in correct order', () => {
      const questions = CapacityCollectionService.getQuestions();
      
      expect(questions.length).toBe(5);
      expect(questions[0].field).toBe('daily_revenue');
      expect(questions[1].field).toBe('active_days');
      expect(questions[2].field).toBe('cogs_percentage');
      expect(questions[3].field).toBe('household_expenses');
      expect(questions[4].field).toBe('existing_obligations');
    });

    test('should get current question based on step', () => {
      const session = CapacityCollectionService.startSession(testPhone);
      const question = CapacityCollectionService.getCurrentQuestion(session);
      
      expect(question.field).toBe('daily_revenue');
      expect(question.text).toContain('omset');
    });

    test('should return null when all questions answered', () => {
      const session = CapacityCollectionService.startSession(testPhone);
      session.step = 5; // Past all questions
      
      const question = CapacityCollectionService.getCurrentQuestion(session);
      expect(question).toBeNull();
    });
  });

  describe('Answer Processing', () => {
    beforeEach(() => {
      CapacityCollectionService.clearSession(testPhone);
    });

    test('should parse currency from text', () => {
      expect(CapacityCollectionService.parseCurrency('500 ribu')).toBe(500000);
      expect(CapacityCollectionService.parseCurrency('500rb')).toBe(500000);
      expect(CapacityCollectionService.parseCurrency('1.5 juta')).toBe(1500000);
      expect(CapacityCollectionService.parseCurrency('2jt')).toBe(2000000);
      expect(CapacityCollectionService.parseCurrency('Rp 500.000')).toBe(500000);
      expect(CapacityCollectionService.parseCurrency('500000')).toBe(500000);
    });

    test('should parse days from text', () => {
      expect(CapacityCollectionService.parseDays('25 hari')).toBe(25);
      expect(CapacityCollectionService.parseDays('setiap hari')).toBe(30);
      expect(CapacityCollectionService.parseDays('6 hari seminggu')).toBe(26);
      expect(CapacityCollectionService.parseDays('25')).toBe(25);
    });

    test('should parse percentage from text', () => {
      expect(CapacityCollectionService.parsePercentage('60%')).toBe(60);
      expect(CapacityCollectionService.parsePercentage('60 persen')).toBe(60);
      expect(CapacityCollectionService.parsePercentage('setengah')).toBe(50);
      expect(CapacityCollectionService.parsePercentage('separuh')).toBe(50);
      expect(CapacityCollectionService.parsePercentage('60')).toBe(60);
    });

    test('should process answer and advance step', () => {
      CapacityCollectionService.startSession(testPhone);
      
      const result = CapacityCollectionService.processAnswer(testPhone, '500 ribu');
      
      expect(result.success).toBe(true);
      expect(result.value).toBe(500000);
      expect(result.field).toBe('daily_revenue');
      
      const session = CapacityCollectionService.getSession(testPhone);
      expect(session.step).toBe(1);
      expect(session.data.daily_revenue).toBe(500000);
    });

    test('should return error for invalid answer', () => {
      CapacityCollectionService.startSession(testPhone);
      
      const result = CapacityCollectionService.processAnswer(testPhone, 'tidak tahu');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should complete session after all answers', () => {
      CapacityCollectionService.startSession(testPhone);
      
      CapacityCollectionService.processAnswer(testPhone, '500 ribu');  // daily_revenue
      CapacityCollectionService.processAnswer(testPhone, '25 hari');   // active_days
      CapacityCollectionService.processAnswer(testPhone, '60%');       // cogs_percentage
      CapacityCollectionService.processAnswer(testPhone, '2 juta');    // household_expenses
      const result = CapacityCollectionService.processAnswer(testPhone, '500 ribu'); // obligations
      
      expect(result.completed).toBe(true);
      expect(result.data.daily_revenue).toBe(500000);
      expect(result.data.active_days).toBe(25);
      expect(result.data.cogs_percentage).toBe(60);
      expect(result.data.household_expenses).toBe(2000000);
      expect(result.data.existing_obligations).toBe(500000);
    });
  });

  describe('Trigger Detection', () => {
    test('should detect capacity collection triggers', () => {
      expect(CapacityCollectionService.shouldTrigger('hitung kapasitas')).toBe(true);
      expect(CapacityCollectionService.shouldTrigger('cek kemampuan bayar')).toBe(true);
      expect(CapacityCollectionService.shouldTrigger('berapa bisa pinjam')).toBe(true);
      expect(CapacityCollectionService.shouldTrigger('analisis usaha')).toBe(true);
      expect(CapacityCollectionService.shouldTrigger('kapasitas')).toBe(true);
    });

    test('should not trigger for unrelated messages', () => {
      expect(CapacityCollectionService.shouldTrigger('halo')).toBe(false);
      expect(CapacityCollectionService.shouldTrigger('quiz')).toBe(false);
      expect(CapacityCollectionService.shouldTrigger('cek data')).toBe(false);
    });
  });

  describe('Integration with RPC', () => {
    test('should calculate RPC from collected data', () => {
      const data = {
        daily_revenue: 500000,
        active_days: 25,
        cogs_percentage: 60,
        household_expenses: 2000000,
        existing_obligations: 500000
      };
      
      const rpc = CapacityCollectionService.calculateRPC(data);
      
      expect(rpc.monthly_income).toBe(12500000);
      expect(rpc.max_installment).toBe(750000);
      expect(rpc.sustainable_disposable_cash).toBe(2500000);
    });
  });
});

describe('Chat Flow Integration', () => {
  test('full conversation flow', () => {
    const phone = '628999999999';
    CapacityCollectionService.clearSession(phone);
    
    // User triggers capacity check
    expect(CapacityCollectionService.shouldTrigger('hitung kapasitas saya')).toBe(true);
    
    // Start session and get first question
    const session = CapacityCollectionService.startSession(phone);
    const q1 = CapacityCollectionService.getCurrentQuestion(session);
    expect(q1.text).toContain('omset');
    
    // Answer questions
    CapacityCollectionService.processAnswer(phone, '500rb');
    CapacityCollectionService.processAnswer(phone, '25');
    CapacityCollectionService.processAnswer(phone, '60');
    CapacityCollectionService.processAnswer(phone, '2jt');
    const final = CapacityCollectionService.processAnswer(phone, '500rb');
    
    // Verify completion
    expect(final.completed).toBe(true);
    expect(final.rpc.max_installment).toBe(750000);
    
    // Session should be cleared
    expect(CapacityCollectionService.getSession(phone)).toBeNull();
  });
});

console.log('✅ Capacity Collection tests defined. Run with: npm test');
