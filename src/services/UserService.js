const UserRepository = require('../repositories/UserRepository');
const BusinessIntelligenceRepository = require('../repositories/BusinessIntelligenceRepository');
const MajelisRepository = require('../repositories/MajelisRepository');
const EngagementService = require('./EngagementService');
const RPCService = require('./RPCService');
const CreditScoringService = require('./CreditScoringService');
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

    // Calculate RPC (USP 2 + 3)
    if (user.capacity) {
      const rpcData = RPCService.calculateRPC(user.capacity);
      const trends = RPCService.calculateTrends(rpcData, user.capacity_previous);
      user.rpc = { ...rpcData, ...trends };
    }

    // Calculate literacy progress (USP 3)
    user.literacy_progress = this.calculateLiteracyProgress(user.literacy || {});

    // Calculate engagement score (USP 1)
    const engagementScore = EngagementService.calculateEngagementScore(user.engagement || {});
    user.engagement_score = engagementScore;

    // Calculate A-Score
    user.a_score = CreditScoringService.calculateAScore({
      character: user.psychometric?.crbi_score || 50,
      capacity: user.rpc ? RPCService.calculateRPCScore(user.rpc) : 50,
      literacy: user.literacy_progress?.average || 50,
      engagement: engagementScore
    });

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
    const [users, allMajelis] = await Promise.all([
      UserRepository.findAll(),
      MajelisRepository.findAll()
    ]);
    
    const majelisMap = new Map(allMajelis.map(m => [m.id, m]));
    
    for (const user of users) {
      if (user.majelis_id) {
        const majelis = majelisMap.get(user.majelis_id);
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
    
    const result = await UserRepository.update(phoneNumber, { 
      status: isVerified ? 'active' : 'pending'
    });

    // Send WhatsApp welcome message when approved
    if (isVerified) {
      const { sendMessage } = require('../chatbot/whatsapp');
      const honorific = user.profile?.gender === 'male' ? 'Pak' : 'Bu';
      const welcomeMsg = `🎉 *Selamat ${honorific} ${user.name}!*

Akun Anda sudah diverifikasi dan aktif di Akademi-AI Amartha.

Fitur yang bisa ${honorific} gunakan:

1️⃣ *KUIS* - Belajar literasi keuangan (15 minggu)
2️⃣ *KAPASITAS* - Hitung kemampuan cicilan
3️⃣ *FOTO* - Analisis usaha dengan AI
4️⃣ *JADWAL* - Info majelis mingguan
5️⃣ *DATA* - Lihat profil & pinjaman

Ketik *menu* kapan saja untuk bantuan.

Selamat belajar! 📚💪`;
      
      sendMessage(phoneNumber, welcomeMsg).catch(err => {
        console.error('Failed to send welcome message:', err.message);
      });
    }

    return result;
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
    const createUser = async (user, index) => {
      const existing = await UserRepository.findByPhone(user.phone);
      if (existing) return 0;
      
      await UserRepository.create(user.phone, { ...user, is_mock: true });
      
      // Generate mock engagement data based on user index
      const hash = user.phone.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      
      // Generate last 5 days of activity history
      const activityTypes = ['greeting', 'quiz', 'check_loan', 'business_advice', 'upload_image', 'check_majelis', 'menu'];
      const dailyHistory = [];
      for (let d = 0; d < 5; d++) {
        const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayHash = hash + d * 17;
        
        // Generate 2-5 activities per day
        const numActivities = 2 + (dayHash % 4);
        const activities = {};
        for (let a = 0; a < numActivities; a++) {
          const actType = activityTypes[(dayHash + a * 7) % activityTypes.length];
          activities[actType] = (activities[actType] || 0) + 1 + ((dayHash + a) % 2);
        }
        
        // Generate AI summary based on activities
        const summaries = [];
        if (activities.quiz) summaries.push(`mengerjakan ${activities.quiz} quiz literasi keuangan`);
        if (activities.greeting) summaries.push(`menyapa bot ${activities.greeting}x`);
        if (activities.business_advice) summaries.push(`bertanya tips bisnis ${activities.business_advice}x`);
        if (activities.check_loan) summaries.push(`mengecek status pinjaman`);
        if (activities.upload_image) summaries.push(`mengunggah ${activities.upload_image} foto usaha`);
        if (activities.check_majelis) summaries.push(`melihat info majelis`);
        if (activities.menu) summaries.push(`membuka menu utama`);
        
        const totalActions = Object.values(activities).reduce((a, b) => a + b, 0);
        const engagement = totalActions > 5 ? 'sangat aktif' : totalActions > 2 ? 'cukup aktif' : 'kurang aktif';
        const summary = `Hari ini ${user.name.split(' ')[0]} ${engagement}: ${summaries.slice(0, 3).join(', ')}.`;
        
        dailyHistory.push({ date: dateStr, activities, total_actions: totalActions, ai_summary: summary });
      }
      
      const engagementData = {
        total_interactions: 15 + (hash % 40),
        last_interaction: new Date().toISOString(),
        messages_sent: 10 + (hash % 30),
        images_sent: 2 + (hash % 5),
        quiz_attempts: 1 + (hash % 3),
        streak_days: hash % 10,
        daily_history: dailyHistory,
      };
      await UserRepository.updateEngagement(user.phone, engagementData);

      // Generate mock capacity data
      const capacityData = {
        monthly_income: 3000000 + (hash % 5) * 500000,
        monthly_expense: 2000000 + (hash % 4) * 300000,
        monthly_surplus: 1000000 + (hash % 3) * 200000,
        dependents: 1 + (hash % 4),
        repayment_capacity: 500000 + (hash % 5) * 100000,
        collected_at: new Date().toISOString(),
      };
      await UserRepository.updateCapacity(user.phone, capacityData);

      // Generate mock loan data with history
      const loanAmount = 1500000 + (hash % 5) * 500000;
      const installmentAmount = 100000 + (hash % 5) * 25000;
      const paidInstallments = 2 + (hash % 4);
      let runningBalance = loanAmount;
      const loanHistory = [
        { type: 'disbursement', amount: loanAmount, date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), description: 'Pencairan Pinjaman' }
      ];
      for (let i = 0; i < paidInstallments; i++) {
        runningBalance -= installmentAmount;
        loanHistory.push({ type: 'payment', amount: installmentAmount, date: new Date(Date.now() - (28 - i * 7) * 24 * 60 * 60 * 1000).toISOString(), description: `Cicilan Minggu ${i + 1}` });
      }
      await UserRepository.updateLoan(user.phone, {
        limit: 5000000,
        used: loanAmount,
        remaining: 5000000 - loanAmount + (paidInstallments * installmentAmount),
        history: loanHistory,
      });
      
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
    
    const results = await Promise.all(MOCK_USERS.map((u, i) => createUser(u, i)));
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

  // Track WhatsApp interaction for engagement scoring
  async trackInteraction(phoneNumber, type) {
    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) return null;
    
    const currentEngagement = user.engagement || EngagementService.createEngagement();
    const updated = EngagementService.recordInteraction(currentEngagement, type);
    
    await UserRepository.updateEngagement(phoneNumber, updated);
    return updated;
  }

  // Update capacity data (RPC inputs)
  async updateCapacity(phoneNumber, data) {
    return UserRepository.updateCapacity(phoneNumber, data);
  }
}

module.exports = new UserService();
