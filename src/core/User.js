class User {
  static create(data) {
    return {
      name: data.name,
      business_type: data.business_type,
      location: data.location,
      majelis_id: null,
      majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)",
      current_module: "Welcome Phase",
      literacy_score: "Low",
      is_verified: false,
      pending_verification: null,
      verified_transactions: [],
      loan_limit: 0,
      loan_used: 0,
      loan_remaining: 0,
      next_payment_date: null,
      next_payment_amount: 0,
      loan_history: [],
      created_at: new Date().toISOString()
    };
  }

  static createMock(userData) {
    return {
      ...userData,
      status: 'pending',
      is_mock: true,
      registered_at: new Date().toISOString(),
      majelis_id: null
    };
  }
}

module.exports = User;
