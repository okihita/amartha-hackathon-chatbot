const UserRepository = require('../repositories/UserRepository');
const BusinessIntelligenceRepository = require('../repositories/BusinessIntelligenceRepository');
const MajelisRepository = require('../repositories/MajelisRepository');
const User = require('../core/User');
const { MOCK_USERS, MOCK_BI_DATA } = require('../config/mockData');

class UserService {
  async getUser(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) return null;
    
    if (user.majelis_id) {
      const majelis = await MajelisRepository.findById(user.majelis_id);
      if (majelis) {
        user.majelis_name = majelis.name;
        user.majelis_day = majelis.schedule_day;
        user.majelis_time = majelis.schedule_time;
        user.majelis_location = majelis.location;
      }
    }
    
    return user;
  }

  async getCompleteProfile(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) return null;

    // Add majelis info if user is member
    if (user.majelis_id) {
      const majelis = await MajelisRepository.findById(user.majelis_id);
      if (majelis) {
        user.majelis = {
          id: majelis.id,
          name: majelis.name,
          schedule_day: majelis.schedule_day,
          schedule_time: majelis.schedule_time,
          location: majelis.location,
          member_count: majelis.members?.length || 0
        };
      }
    }

    // Add business intelligence
    user.business_intelligence = await BusinessIntelligenceRepository.findByUser(phoneNumber);

    return user;
  }

  async createUser(phoneNumber, userData) {
    const existing = await UserRepository.findByPhone(phoneNumber);
    if (existing) {
      throw new Error('User already registered');
    }
    return UserRepository.create(phoneNumber, userData);
  }

  async getAllUsers() {
    const users = await UserRepository.findAll();
    
    const majelisCache = {};
    for (const user of users) {
      if (user.majelis_id) {
        if (!majelisCache[user.majelis_id]) {
          majelisCache[user.majelis_id] = await MajelisRepository.findById(user.majelis_id);
        }
        const majelis = majelisCache[user.majelis_id];
        if (majelis) {
          user.majelis_name = majelis.name;
          user.majelis_day = majelis.schedule_day;
          user.majelis_time = majelis.schedule_time;
          user.majelis_location = majelis.location;
        }
      }
    }
    
    return users;
  }

  async verifyUser(phoneNumber, isVerified) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    return UserRepository.update(phoneNumber, { 
      status: isVerified ? 'active' : 'pending'
    });
  }

  async deleteUser(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) return false;
    await UserRepository.delete(phoneNumber);
    return true;
  }

  async updateProfile(phoneNumber, data) {
    return UserRepository.updateProfile(phoneNumber, data);
  }

  async updateBusiness(phoneNumber, data) {
    return UserRepository.updateBusiness(phoneNumber, data);
  }

  async updateLoan(phoneNumber, data) {
    return UserRepository.updateLoan(phoneNumber, data);
  }

  async updateLiteracy(phoneNumber, data) {
    return UserRepository.updateLiteracy(phoneNumber, data);
  }

  async getBusinessIntelligence(phoneNumber) {
    return BusinessIntelligenceRepository.findByUser(phoneNumber);
  }

  async createBusinessIntelligence(phoneNumber, biData, imageUrl = null, caption = null) {
    return BusinessIntelligenceRepository.save(phoneNumber, biData, imageUrl, caption);
  }

  async deleteMockUsers() {
    return UserRepository.deleteMany({ field: 'is_mock', operator: '==', value: true });
  }

  async createMockUsers() {
    const createUser = async (user) => {
      const existing = await UserRepository.findByPhone(user.phone);
      if (existing) return 0;
      
      await UserRepository.create(user.phone, { ...user, is_mock: true });
      
      // Create all BI data in parallel
      const biPromises = MOCK_BI_DATA.map(biData => {
        let imageUrl = null;
        if (biData.type === 'building') {
          imageUrl = `https://picsum.photos/seed/building-${user.phone}/800/600`;
        } else if (biData.type === 'inventory') {
          imageUrl = `https://picsum.photos/seed/inventory-${user.phone}/800/600`;
        }
        return BusinessIntelligenceRepository.save(user.phone, biData, imageUrl, `Mock ${biData.type} data for ${user.name}`);
      });
      await Promise.all(biPromises);
      return 1;
    };
    
    const results = await Promise.all(MOCK_USERS.map(createUser));
    return results.reduce((a, b) => a + b, 0);
  }

  async createMockLoanData(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) return { error: 'User not found' };

    const loanAmount = 2000000;
    const installmentAmount = 150000;
    const paidInstallments = 5;

    let runningBalance = 0;
    const history = [];

    // Disbursement
    runningBalance += loanAmount;
    history.push({
      id: `loan-${Date.now()}`,
      type: 'disbursement',
      amount: loanAmount,
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Pinjaman Tahap 1',
      balance_after: runningBalance
    });

    // Payments
    for (let i = 0; i < paidInstallments; i++) {
      runningBalance -= installmentAmount;
      history.push({
        id: `payment-${Date.now()}-${i}`,
        type: 'payment',
        amount: installmentAmount,
        date: new Date(Date.now() - (28 - i * 7) * 24 * 60 * 60 * 1000).toISOString(),
        description: `Cicilan Minggu ${i + 1}`,
        balance_after: runningBalance
      });
    }

    const loanData = {
      limit: 5000000,
      used: loanAmount,
      remaining: 5000000 - loanAmount,
      next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      next_payment_amount: installmentAmount,
      history,
      updated_at: new Date().toISOString()
    };

    await UserRepository.updateLoan(phoneNumber, loanData);
    return { success: true, data: loanData };
  }

  async updateLiteracyScore(phoneNumber, weekNumber, score) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }

    const weekKey = `week_${String(weekNumber).padStart(2, '0')}`;
    const literacy = user.literacy || {};
    literacy[weekKey] = {
      score: Math.min(100, Math.max(0, score)),
      last_updated: new Date().toISOString()
    };

    await UserRepository.updateLiteracy(phoneNumber, literacy);

    return {
      literacy,
      progress: this.calculateLiteracyProgress(literacy)
    };
  }

  async getLiteracyProgress(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }

    return this.calculateLiteracyProgress(user.literacy || {});
  }

  calculateLiteracyProgress(literacy) {
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

  calculateRemainingDebt(loanHistory) {
    if (!loanHistory || loanHistory.length === 0) return 0;
    
    // Get the most recent transaction's balance
    const sortedHistory = [...loanHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedHistory[0]?.balance_after || 0;
  }
}

module.exports = new UserService();
