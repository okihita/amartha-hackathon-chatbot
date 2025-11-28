const UserRepository = require('../repositories/UserRepository');
const BusinessIntelligenceRepository = require('../repositories/BusinessIntelligenceRepository');
const MajelisRepository = require('../repositories/MajelisRepository');
const User = require('../core/User');
const { MOCK_USERS } = require('../config/mockData');

class UserService {
  async getUser(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) return null;
    
    // Fetch majelis data if user belongs to one
    if (user.majelis_id) {
      const majelis = await MajelisRepository.findById(user.majelis_id);
      if (majelis) {
        user.majelis_name = majelis.name;
        user.majelis_day = majelis.schedule_day;
      }
    }
    
    return user;
  }

  async registerUser(phoneNumber, data) {
    const existing = await UserRepository.findByPhone(phoneNumber);
    if (existing) {
      throw new Error('User already registered');
    }
    return UserRepository.create(phoneNumber, data);
  }

  async getAllUsers() {
    const users = await UserRepository.findAll();
    
    // Fetch majelis data for all users
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
    return UserRepository.update(phoneNumber, { is_verified: isVerified });
  }

  async deleteUser(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      return false;
    }
    await UserRepository.delete(phoneNumber);
    return true;
  }

  async updateBusinessProfile(phoneNumber, structuredData) {
    return UserRepository.update(phoneNumber, {
      business_profile: structuredData,
      profile_updated_at: new Date().toISOString()
    });
  }

  async getBusinessIntelligence(phoneNumber) {
    return BusinessIntelligenceRepository.findByUser(phoneNumber);
  }

  async saveBusinessIntelligence(phoneNumber, data, imageData = null, imageId = null) {
    return BusinessIntelligenceRepository.save(phoneNumber, data, imageData, imageId);
  }

  async calculateCreditScore(phoneNumber) {
    const biData = await this.getBusinessIntelligence(phoneNumber);
    
    if (biData.length === 0) {
      return null;
    }

    let totalScore = 0;
    let dataPoints = 0;
    const metrics = {
      inventory_management: 0,
      financial_records: 0,
      business_organization: 0,
      customer_service: 0,
      product_quality: 0
    };

    biData.forEach(item => {
      if (item.credit_indicators) {
        Object.keys(metrics).forEach(key => {
          if (item.credit_indicators[key] !== undefined) {
            metrics[key] += item.credit_indicators[key];
            dataPoints++;
          }
        });
      }
    });

    Object.keys(metrics).forEach(key => {
      metrics[key] = dataPoints > 0 ? Math.round(metrics[key] / (biData.length || 1)) : 0;
      totalScore += metrics[key];
    });

    const avgScore = Math.round(totalScore / Object.keys(metrics).length);
    const creditScore = avgScore >= 80 ? 'Excellent' : 
                       avgScore >= 60 ? 'Good' : 
                       avgScore >= 40 ? 'Fair' : 'Needs Improvement';

    await UserRepository.update(phoneNumber, {
      credit_score: creditScore,
      credit_score_value: avgScore,
      credit_metrics: metrics,
      credit_updated_at: new Date().toISOString()
    });

    return { creditScore, avgScore, metrics };
  }

  async deleteMockUsers() {
    return UserRepository.deleteMany({ field: 'is_mock', operator: '==', value: true });
  }

  async createMockUsers() {
    let count = 0;
    for (const user of MOCK_USERS) {
      const existing = await UserRepository.findByPhone(user.phone);
      if (!existing) {
        const mockUser = User.createMock(user);
        await UserRepository.create(user.phone, mockUser);
        count++;
      }
    }
    console.log(`✅ Created ${count} mock users`);
    return count;
  }

  async populateLoanData(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      return { error: 'User not found' };
    }

    const loanAmount = 2000000;
    const installmentAmount = 150000;
    const totalInstallments = 14;
    const paidInstallments = 5;

    const loanHistory = [
      {
        id: `loan-${Date.now()}`,
        type: 'disbursement',
        amount: loanAmount,
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Pinjaman Tahap 1'
      }
    ];

    for (let i = 0; i < paidInstallments; i++) {
      loanHistory.push({
        id: `payment-${Date.now()}-${i}`,
        type: 'payment',
        amount: installmentAmount,
        date: new Date(Date.now() - (28 - i * 7) * 24 * 60 * 60 * 1000).toISOString(),
        description: `Cicilan Minggu ${i + 1}`
      });
    }

    const loanUsed = loanAmount;
    const totalPaid = paidInstallments * installmentAmount;
    const remainingDebt = loanUsed - totalPaid;
    const nextPaymentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const loanData = {
      loan_limit: 5000000,
      loan_used: loanUsed,
      loan_remaining: 5000000 - loanUsed,
      remaining_debt: remainingDebt,
      next_payment_date: nextPaymentDate,
      next_payment_amount: installmentAmount,
      loan_history: loanHistory,
      loan_updated_at: new Date().toISOString()
    };

    await UserRepository.update(phoneNumber, loanData);
    return { success: true, data: loanData };
  }

  async updateLiteracyScore(phoneNumber, weekNumber, score) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedLiteracy = User.updateWeekScore(user.literacy || {}, weekNumber, score);
    await UserRepository.update(phoneNumber, { literacy: updatedLiteracy });

    return {
      literacy: updatedLiteracy,
      progress: User.getLiteracyProgress(updatedLiteracy)
    };
  }

  async getLiteracyProgress(phoneNumber) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }

    return User.getLiteracyProgress(user.literacy || {});
  }
}

module.exports = new UserService();
