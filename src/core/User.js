class User {
  static create(data) {
    return {
      name: data.name,
      business_type: data.business_type,
      location: data.location,
      majelis_id: null,
      current_module: "Welcome Phase",
      is_verified: false,
      pending_verification: null,
      verified_transactions: [],
      loan_limit: 0,
      loan_used: 0,
      loan_remaining: 0,
      next_payment_date: null,
      next_payment_amount: 0,
      loan_history: [],
      literacy: {},
      created_at: new Date().toISOString()
    };
  }

  static createMock(userData) {
    return {
      ...userData,
      status: 'pending',
      is_mock: true,
      registered_at: new Date().toISOString(),
      majelis_id: null,
      literacy: {}
    };
  }

  static createWeekScore(weekNumber) {
    return {
      [`week_${String(weekNumber).padStart(2, '0')}`]: {
        score: 0,
        last_updated: new Date().toISOString()
      }
    };
  }

  static updateWeekScore(literacy, weekNumber, score) {
    const weekKey = `week_${String(weekNumber).padStart(2, '0')}`;
    return {
      ...literacy,
      [weekKey]: {
        score: Math.min(100, Math.max(0, score)),
        last_updated: new Date().toISOString()
      }
    };
  }

  static getLiteracyProgress(literacy) {
    const weeks = Object.keys(literacy).filter(k => k.startsWith('week_'));
    if (weeks.length === 0) return { completed: 0, average: 0, total: 0 };

    const scores = weeks.map(w => literacy[w].score);
    const completed = scores.filter(s => s >= 70).length;
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      completed,
      average: Math.round(average),
      total: weeks.length
    };
  }
}

module.exports = User;
