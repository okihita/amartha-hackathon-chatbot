/**
 * EngagementService - USP 1: Last Mile Solution
 * Tracks WhatsApp interactions to measure user engagement
 */

class EngagementService {
  // Activity weights for scoring
  static ACTIVITY_WEIGHTS = {
    quiz: 3,
    business_advice: 3,
    check_data: 1,
    menu: 0.5,
    other: 1
  };

  static createEngagement() {
    return {
      total_interactions: 0,
      streak_days: 0,
      activity_calendar: {},
      activity_breakdown: {},
      last_interaction: null,
      created_at: new Date().toISOString()
    };
  }

  static recordInteraction(engagement, type) {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...engagement };
    
    updated.total_interactions = (updated.total_interactions || 0) + 1;
    updated.activity_calendar = { ...updated.activity_calendar, [today]: true };
    updated.activity_breakdown = { 
      ...updated.activity_breakdown,
      [type]: (updated.activity_breakdown?.[type] || 0) + 1
    };
    updated.last_interaction = new Date().toISOString();
    updated.streak_days = this.calculateStreak(updated.activity_calendar);
    
    return updated;
  }

  static calculateStreak(calendar) {
    if (!calendar || Object.keys(calendar).length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    if (!calendar[today]) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (calendar[dateStr]) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    
    return streak;
  }

  static calculateEngagementScore(engagement) {
    if (!engagement || engagement.total_interactions === 0) return 0;
    
    const { total_interactions, streak_days, activity_breakdown } = engagement;
    
    // Base score from total interactions (max 30 points)
    const interactionScore = Math.min(30, total_interactions * 0.6);
    
    // Streak bonus (max 30 points)
    const streakScore = Math.min(30, streak_days * 2.5);
    
    // Quality score from weighted activities (max 40 points)
    let qualityScore = 0;
    if (activity_breakdown) {
      for (const [type, count] of Object.entries(activity_breakdown)) {
        const weight = this.ACTIVITY_WEIGHTS[type] || 1;
        qualityScore += count * weight * 0.5;
      }
    }
    qualityScore = Math.min(40, qualityScore);
    
    return Math.min(100, Math.round(interactionScore + streakScore + qualityScore));
  }
}

module.exports = EngagementService;
