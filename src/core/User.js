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
    return {
      name: data.business_name || null,
      location: data.business_location || data.location || null,
      category: data.category || data.business_type || null,
      maturity_level: data.maturity_level || 1,
      created_at: now,
      updated_at: now
    };
  }

  static createLoan() {
    const now = new Date().toISOString();
    return {
      limit: 0,
      used: 0,
      remaining: 0,
      next_payment_date: null,
      next_payment_amount: 0,
      history: [],
      created_at: now,
      updated_at: now
    };
  }

  static createLiteracy() {
    const now = new Date().toISOString();
    return {
      current_module: "Welcome Phase",
      week_01: { score: 0, last_updated: now },
      created_at: now,
      updated_at: now
    };
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
