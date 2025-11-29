/**
 * CreditScoringService - A-Score Calculator
 * Combines all components into creditworthiness score
 */

class CreditScoringService {
  // Component weights
  static WEIGHTS = {
    character: 0.25,   // CRBI psychometric
    capacity: 0.30,    // RPC score
    literacy: 0.25,    // Financial literacy progress
    engagement: 0.20   // WhatsApp engagement
  };

  // Risk zone thresholds
  static ZONES = {
    A: 70,  // Auto-approve
    B: 55,  // Approve with conditions
    C: 40,  // Approve with coaching
    // Below 40 = Zone D (Reject)
  };

  static calculateAScore(components) {
    const character = components.character ?? 50;
    const capacity = components.capacity ?? 50;
    const literacy = components.literacy ?? 50;
    const engagement = components.engagement ?? 50;
    
    const score = Math.round(
      (character * this.WEIGHTS.character) +
      (capacity * this.WEIGHTS.capacity) +
      (literacy * this.WEIGHTS.literacy) +
      (engagement * this.WEIGHTS.engagement)
    );
    
    return {
      score,
      zone: this.getRiskZone(score),
      components: { character, capacity, literacy, engagement }
    };
  }

  static getRiskZone(score) {
    if (score >= this.ZONES.A) return 'A';
    if (score >= this.ZONES.B) return 'B';
    if (score >= this.ZONES.C) return 'C';
    return 'D';
  }

  static getZoneRecommendation(zone) {
    const recommendations = {
      A: { action: 'auto_approve', message: 'Layak pinjaman, proses otomatis' },
      B: { action: 'approve_conditions', message: 'Layak dengan limit lebih rendah' },
      C: { action: 'approve_coaching', message: 'Perlu pendampingan intensif' },
      D: { action: 'reject', message: 'Belum memenuhi syarat, tingkatkan literasi' }
    };
    return recommendations[zone] || recommendations.D;
  }
}

module.exports = CreditScoringService;
