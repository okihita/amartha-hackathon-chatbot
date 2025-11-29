/**
 * Credit Risk Features Tests (TDD)
 * Tests for: Engagement tracking, RPC calculation, A-Score, Dashboard data
 */

const EngagementService = require('../src/services/EngagementService');
const RPCService = require('../src/services/RPCService');
const CreditScoringService = require('../src/services/CreditScoringService');

describe('EngagementService', () => {
  describe('calculateStreak', () => {
    test('should return 0 for empty calendar', () => {
      const streak = EngagementService.calculateStreak({});
      expect(streak).toBe(0);
    });

    test('should count consecutive days ending today', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
      
      const calendar = {
        [twoDaysAgo]: true,
        [yesterday]: true,
        [today]: true,
      };
      
      const streak = EngagementService.calculateStreak(calendar);
      expect(streak).toBe(3);
    });

    test('should break streak on gap', () => {
      const today = new Date().toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
      
      const calendar = {
        [twoDaysAgo]: true,
        // yesterday missing
        [today]: true,
      };
      
      const streak = EngagementService.calculateStreak(calendar);
      expect(streak).toBe(1);
    });

    test('should return 0 if no activity today', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const calendar = { [yesterday]: true };
      
      const streak = EngagementService.calculateStreak(calendar);
      expect(streak).toBe(0);
    });
  });

  describe('calculateEngagementScore', () => {
    test('should return 0 for no engagement', () => {
      const score = EngagementService.calculateEngagementScore({
        total_interactions: 0,
        streak_days: 0,
        activity_breakdown: {}
      });
      expect(score).toBe(0);
    });

    test('should cap at 100', () => {
      const score = EngagementService.calculateEngagementScore({
        total_interactions: 1000,
        streak_days: 100,
        activity_breakdown: { quiz: 500, business_advice: 500 }
      });
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should weight quiz and business_advice higher', () => {
      const quizHeavy = EngagementService.calculateEngagementScore({
        total_interactions: 20,
        streak_days: 5,
        activity_breakdown: { quiz: 15, check_data: 5 }
      });
      
      const checkDataHeavy = EngagementService.calculateEngagementScore({
        total_interactions: 20,
        streak_days: 5,
        activity_breakdown: { quiz: 5, check_data: 15 }
      });
      
      expect(quizHeavy).toBeGreaterThan(checkDataHeavy);
    });
  });

  describe('trackInteraction', () => {
    test('should create engagement object for new user', () => {
      const engagement = EngagementService.createEngagement();
      
      expect(engagement.total_interactions).toBe(0);
      expect(engagement.streak_days).toBe(0);
      expect(engagement.activity_calendar).toEqual({});
      expect(engagement.activity_breakdown).toEqual({});
    });

    test('should increment interaction correctly', () => {
      const engagement = EngagementService.createEngagement();
      const updated = EngagementService.recordInteraction(engagement, 'quiz');
      
      expect(updated.total_interactions).toBe(1);
      expect(updated.activity_breakdown.quiz).toBe(1);
      
      const today = new Date().toISOString().split('T')[0];
      expect(updated.activity_calendar[today]).toBe(true);
    });
  });
});

describe('RPCService', () => {
  describe('calculateRPC', () => {
    test('should calculate basic RPC', () => {
      const result = RPCService.calculateRPC({
        daily_revenue: 500000,
        active_days: 25,
        cogs_percentage: 60,
        household_expenses: 2000000,
        existing_obligations: 500000
      });
      
      // Revenue: 500k * 25 = 12.5M
      // COGS: 12.5M * 60% = 7.5M
      // Gross: 12.5M - 7.5M = 5M
      // SDC: 5M - 2M - 0.5M = 2.5M
      // Max installment: 2.5M * 30% = 750k
      
      expect(result.monthly_income).toBe(12500000);
      expect(result.monthly_expenses).toBe(10000000); // COGS + household + obligations
      expect(result.sustainable_disposable_cash).toBe(2500000);
      expect(result.max_installment).toBe(750000);
    });

    test('should return 0 max_installment if SDC is negative', () => {
      const result = RPCService.calculateRPC({
        daily_revenue: 100000,
        active_days: 20,
        cogs_percentage: 80,
        household_expenses: 1000000,
        existing_obligations: 500000
      });
      
      // Revenue: 100k * 20 = 2M
      // COGS: 2M * 80% = 1.6M
      // Gross: 2M - 1.6M = 400k
      // SDC: 400k - 1M - 500k = -1.1M
      
      expect(result.sustainable_disposable_cash).toBeLessThan(0);
      expect(result.max_installment).toBe(0);
    });

    test('should handle missing values with defaults', () => {
      const result = RPCService.calculateRPC({
        daily_revenue: 500000,
        active_days: 25
      });
      
      expect(result.monthly_income).toBe(12500000);
      expect(result.max_installment).toBeGreaterThan(0);
    });
  });

  describe('calculateRPCScore', () => {
    test('should return high score for healthy RPC', () => {
      const score = RPCService.calculateRPCScore({
        sustainable_disposable_cash: 5000000,
        max_installment: 1500000
      });
      
      expect(score).toBeGreaterThanOrEqual(70);
    });

    test('should return low score for poor RPC', () => {
      const score = RPCService.calculateRPCScore({
        sustainable_disposable_cash: 500000,
        max_installment: 150000
      });
      
      expect(score).toBeLessThan(50);
    });

    test('should return 0 for negative SDC', () => {
      const score = RPCService.calculateRPCScore({
        sustainable_disposable_cash: -100000,
        max_installment: 0
      });
      
      expect(score).toBe(0);
    });
  });

  describe('calculateTrends', () => {
    test('should calculate percentage change', () => {
      const current = { monthly_income: 12000000, monthly_expenses: 8000000 };
      const previous = { monthly_income: 10000000, monthly_expenses: 9000000 };
      
      const trends = RPCService.calculateTrends(current, previous);
      
      expect(trends.income_change_pct).toBe(20); // +20%
      expect(trends.expense_change_pct).toBe(-11); // -11% (rounded)
    });

    test('should return 0 for no previous data', () => {
      const current = { monthly_income: 12000000, monthly_expenses: 8000000 };
      
      const trends = RPCService.calculateTrends(current, null);
      
      expect(trends.income_change_pct).toBe(0);
      expect(trends.expense_change_pct).toBe(0);
    });
  });
});

describe('CreditScoringService', () => {
  describe('calculateAScore', () => {
    test('should calculate weighted A-Score', () => {
      const components = {
        character: 80,
        capacity: 70,
        literacy: 90,
        engagement: 60
      };
      
      const result = CreditScoringService.calculateAScore(components);
      
      // (80*0.25) + (70*0.30) + (90*0.25) + (60*0.20) = 20 + 21 + 22.5 + 12 = 75.5
      expect(result.score).toBe(76); // rounded
      expect(result.zone).toBe('A');
    });

    test('should assign correct risk zones', () => {
      expect(CreditScoringService.getRiskZone(75)).toBe('A');
      expect(CreditScoringService.getRiskZone(60)).toBe('B');
      expect(CreditScoringService.getRiskZone(45)).toBe('C');
      expect(CreditScoringService.getRiskZone(30)).toBe('D');
    });

    test('should handle missing components with defaults', () => {
      const result = CreditScoringService.calculateAScore({
        capacity: 70
        // others missing
      });
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.components.character).toBe(50); // default
      expect(result.components.capacity).toBe(70);
    });
  });

  describe('getZoneRecommendation', () => {
    test('Zone A should auto-approve', () => {
      const rec = CreditScoringService.getZoneRecommendation('A');
      expect(rec.action).toBe('auto_approve');
    });

    test('Zone D should reject', () => {
      const rec = CreditScoringService.getZoneRecommendation('D');
      expect(rec.action).toBe('reject');
    });
  });
});

describe('Dashboard Data Assembly', () => {
  test('should assemble complete profile with all USP data', () => {
    const user = {
      phone: '628123456789',
      name: 'Siti',
      status: 'active',
      business: { name: 'Warung Siti', maturity_level: 2 },
      capacity: {
        daily_revenue: 500000,
        active_days: 25,
        cogs_percentage: 60,
        household_expenses: 2000000,
        existing_obligations: 500000
      },
      literacy: {
        week_01: { score: 100, completed: true },
        week_02: { score: 100, completed: true },
        week_03: { score: 85, completed: false },
      },
      engagement: {
        total_interactions: 47,
        streak_days: 12,
        activity_calendar: {},
        activity_breakdown: { quiz: 18, business_advice: 15 }
      }
    };

    // Calculate RPC
    const rpc = RPCService.calculateRPC(user.capacity);
    expect(rpc.max_installment).toBe(750000);

    // Calculate literacy progress
    const literacyScore = calculateLiteracyScore(user.literacy);
    expect(literacyScore.completed_weeks).toBe(2);
    expect(literacyScore.avg_score).toBeGreaterThan(0);

    // Calculate engagement score
    const engagementScore = EngagementService.calculateEngagementScore(user.engagement);
    expect(engagementScore).toBeGreaterThan(0);

    // Calculate A-Score
    const aScore = CreditScoringService.calculateAScore({
      character: 50, // default, no CRBI yet
      capacity: RPCService.calculateRPCScore(rpc),
      literacy: literacyScore.avg_score,
      engagement: engagementScore
    });
    
    expect(aScore.score).toBeGreaterThan(0);
    expect(['A', 'B', 'C', 'D']).toContain(aScore.zone);
  });
});

// Helper for tests
function calculateLiteracyScore(literacy) {
  const weeks = Object.keys(literacy || {}).filter(k => k.startsWith('week_'));
  const scores = weeks.map(w => literacy[w].score);
  const completed = weeks.filter(w => literacy[w].completed).length;
  
  return {
    completed_weeks: completed,
    total_weeks: 15,
    avg_score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  };
}

console.log('✅ Credit Risk tests defined. Run with: npm test');
