class User {
  static create(data) {
    const now = new Date().toISOString();
    return {
      phone: data.phone,
      name: data.name,
      majelis_id: null,
      status: 'pending',
      is_mock: false,
      created_at: now,
      updated_at: now
    };
  }

  static createProfile(data) {
    const now = new Date().toISOString();
    return {
      dob: data.dob || null,
      gender: data.gender || null,
      address: data.address || null,
      created_at: now,
      updated_at: now
    };
  }

  static createBusiness(data) {
    const now = new Date().toISOString();
    const maturityLevel = data.maturity_level || 1;
    if (maturityLevel < 1 || maturityLevel > 5) {
      throw new Error('maturity_level must be between 1 and 5');
    }
    return {
      name: data.business_name || null,
      location: data.business_location || data.location || null,
      category: data.category || data.business_type || null,
      maturity_level: maturityLevel,
      created_at: now,
      updated_at: now
    };
  }

  static createLoan(data = {}) {
    const now = new Date().toISOString();
    const limit = data.loan_limit || 0;
    const used = data.loan_used || 0;
    const remaining = limit - used;
    
    // Create initial loan history if there's a loan
    const history = [];
    if (used > 0) {
      history.push({
        id: 'initial_disbursement',
        type: 'disbursement',
        amount: used,
        date: now,
        description: 'Initial loan disbursement',
        balance_after: used
      });
    }
    
    return {
      limit,
      used,
      remaining,
      next_payment_date: used > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      next_payment_amount: used > 0 ? Math.round(used * 0.1) : 0,
      history,
      created_at: now,
      updated_at: now
    };
  }

  static createLiteracy(data = {}) {
    const now = new Date().toISOString();
    const literacy = {
      created_at: now,
      updated_at: now
    };
    
    // Initialize with some completed weeks for mock data
    const completedWeeks = data.loan_limit ? Math.min(Math.floor(data.loan_limit / 1000000), 5) : 0;
    for (let i = 1; i <= 15; i++) {
      const weekKey = `week_${String(i).padStart(2, '0')}`;
      if (i <= completedWeeks) {
        literacy[weekKey] = {
          score: 70 + Math.floor(Math.random() * 30),
          last_updated: now
        };
      } else {
        literacy[weekKey] = {
          score: 0,
          last_updated: null
        };
      }
    }
    
    return literacy;
  }

  static createMock(userData) {
    const now = new Date().toISOString();
    return {
      phone: userData.phone,
      name: userData.name,
      majelis_id: null,
      status: 'pending',
      is_mock: true,
      created_at: now,
      updated_at: now
    };
  }
}

module.exports = User;
