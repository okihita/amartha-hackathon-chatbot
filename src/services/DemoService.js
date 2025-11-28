const UserRepository = require('../repositories/UserRepository');
const MajelisRepository = require('../repositories/MajelisRepository');
const BusinessIntelligenceRepository = require('../repositories/BusinessIntelligenceRepository');
const db = require('../config/database');

const DEMO_MAJELIS_ID = 'demo-majelis-sejahtera';

// Business personas from 25 categories
const PERSONAS = {
  warung: {
    name: 'Siti Rahayu',
    gender: 'female',
    business: { name: 'Warung Sembako Berkah', location: 'Cibinong, Bogor', category: 'Warung Sembako', maturity_level: 3 },
    loan: { limit: 5000000, used: 2000000, remaining: 3000000, next_payment_amount: 450000 },
    quiz_weeks: 6, // 40%
  },
  toko: {
    name: 'Dewi Lestari',
    gender: 'female',
    business: { name: 'Toko Kelontong Makmur', location: 'Parung, Bogor', category: 'Toko Kelontong', maturity_level: 2 },
    loan: { limit: 3000000, used: 1500000, remaining: 1500000, next_payment_amount: 300000 },
    quiz_weeks: 3, // 20%
  },
  makanan: {
    name: 'Ratna Sari',
    gender: 'female',
    business: { name: 'Dapur Bu Ratna', location: 'Depok', category: 'Usaha Makanan', maturity_level: 4 },
    loan: { limit: 8000000, used: 3000000, remaining: 5000000, next_payment_amount: 600000 },
    quiz_weeks: 9, // 60%
  },
  jahit: {
    name: 'Aminah',
    gender: 'female',
    business: { name: 'Jahit Rapi Aminah', location: 'Cileungsi, Bogor', category: 'Jasa Jahit', maturity_level: 2 },
    loan: { limit: 2000000, used: 1000000, remaining: 1000000, next_payment_amount: 200000 },
    quiz_weeks: 2, // 13%
  },
  pertanian: {
    name: 'Ahmad Sugianto',
    gender: 'male',
    business: { name: 'Tani Subur Sugianto', location: 'Ciampea, Bogor', category: 'Pertanian', maturity_level: 3 },
    loan: { limit: 6000000, used: 2500000, remaining: 3500000, next_payment_amount: 500000 },
    quiz_weeks: 8, // 53%
  },
  salon: {
    name: 'Yuni Kartika',
    gender: 'female',
    business: { name: 'Salon Cantik Yuni', location: 'Cibubur', category: 'Salon & Kecantikan', maturity_level: 3 },
    loan: { limit: 4000000, used: 1500000, remaining: 2500000, next_payment_amount: 350000 },
    quiz_weeks: 5,
  },
  laundry: {
    name: 'Budi Santoso',
    gender: 'male',
    business: { name: 'Laundry Bersih Kilat', location: 'Bekasi', category: 'Jasa Laundry', maturity_level: 2 },
    loan: { limit: 3500000, used: 2000000, remaining: 1500000, next_payment_amount: 400000 },
    quiz_weeks: 4,
  },
};

// Scenario modifiers
const SCENARIOS = {
  sukses: {
    loan: { limit: 10000000, used: 2000000, remaining: 8000000, next_payment_amount: 800000 },
    quiz_weeks: 12,
    bi_count: 4,
    payment_status: 'on_time',
    assign_majelis: true,
  },
  baru: {
    loan: null,
    quiz_weeks: 0,
    bi_count: 0,
    payment_status: null,
    assign_majelis: false,
  },
  krisis: {
    loan: { limit: 5000000, used: 4000000, remaining: 1000000, next_payment_amount: 500000 },
    quiz_weeks: 2,
    bi_count: 1,
    payment_status: 'missed',
    assign_majelis: true,
  },
  lulus: {
    loan: { limit: 15000000, used: 0, remaining: 15000000, next_payment_amount: 0 },
    quiz_weeks: 15,
    bi_count: 5,
    payment_status: 'completed',
    assign_majelis: true,
  },
  fraud: {
    loan: { limit: 5000000, used: 4800000, remaining: 200000, next_payment_amount: 500000 },
    quiz_weeks: 1,
    bi_count: 2,
    payment_status: 'suspicious',
    assign_majelis: true,
    flags: ['multiple_loans_detected', 'inconsistent_business_data'],
  },
};

// Sample BI data templates
const BI_TEMPLATES = {
  building: {
    type: 'building',
    analysis_category: 'building',
    data: {
      building_type: 'warung',
      condition: 'baik',
      size_estimate: '3x4 meter',
      location_type: 'pinggir_jalan',
      visibility: 'cukup_terlihat',
      estimated_value: 15000000,
    },
  },
  inventory: {
    type: 'inventory',
    analysis_category: 'inventory',
    data: {
      items: [
        { name: 'Beras', quantity_estimate: 50, unit: 'kg', estimated_price: 12000 },
        { name: 'Minyak Goreng', quantity_estimate: 20, unit: 'liter', estimated_price: 18000 },
        { name: 'Gula', quantity_estimate: 30, unit: 'kg', estimated_price: 15000 },
      ],
      total_items_count: 100,
      inventory_value_estimate: 2500000,
      stock_level: 'cukup',
      turnover_indicator: 'sedang',
    },
  },
  ledger: {
    type: 'ledger',
    analysis_category: 'ledger',
    data: {
      record_type: 'buku_kas',
      daily_income_estimate: 500000,
      daily_expense_estimate: 350000,
      daily_profit_estimate: 150000,
      monthly_cashflow_estimate: 4500000,
      record_quality: 'cukup_rapi',
    },
  },
  transaction: {
    type: 'transaction',
    analysis_category: 'transaction',
    data: {
      transaction_type: 'penjualan',
      amount: 150000,
      date: new Date().toISOString().split('T')[0],
      items: ['Sembako', 'Minuman'],
      payment_method: 'tunai',
    },
  },
};

class DemoService {
  async ensureDemoMajelis() {
    const existing = await MajelisRepository.findById(DEMO_MAJELIS_ID);
    if (existing) return existing;

    const majelisData = {
      name: 'Majelis Sejahtera Demo',
      description: 'Majelis untuk demo hackathon',
      schedule_day: 'Senin',
      schedule_time: '09:00',
      location: 'Balai Desa Cibinong',
      members: [],
      is_mock: true,
    };
    
    await db.collection('majelis').doc(DEMO_MAJELIS_ID).set({
      ...majelisData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    return { id: DEMO_MAJELIS_ID, ...majelisData };
  }

  getRandomPersona() {
    const keys = Object.keys(PERSONAS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { key: randomKey, ...PERSONAS[randomKey] };
  }

  async injectDemo(phone, command) {
    const parts = command.toLowerCase().replace('/demo:', '').split('+');
    const personaKey = parts[0];
    const scenarioKey = parts[1];

    // Get persona
    let persona;
    if (personaKey === 'random') {
      persona = this.getRandomPersona();
    } else if (PERSONAS[personaKey]) {
      persona = { key: personaKey, ...PERSONAS[personaKey] };
    } else if (SCENARIOS[personaKey]) {
      // If only scenario provided, use random persona
      persona = this.getRandomPersona();
      parts[1] = personaKey;
    } else {
      return { error: true, message: this.getHelpMessage() };
    }

    // Get scenario modifier
    const scenario = SCENARIOS[parts[1]] || SCENARIOS.sukses;

    // Ensure demo majelis exists
    const majelis = await this.ensureDemoMajelis();

    // Build user data
    const now = new Date().toISOString();
    const userData = {
      phone,
      name: persona.name,
      status: 'active',
      majelis_id: scenario.assign_majelis ? DEMO_MAJELIS_ID : null,
      is_mock: false, // Real user, demo data
      is_demo: true,
      demo_persona: persona.key,
      demo_scenario: parts[1] || 'sukses',
      created_at: now,
      updated_at: now,
    };

    // Save main user doc
    await db.collection('users').doc(phone).set(userData);

    // Save profile subcollection (with gender)
    await db.collection('users').doc(phone).collection('profile').doc('data').set({
      gender: persona.gender || 'female',
      dob: null,
      address: persona.business.location,
      created_at: now,
      updated_at: now,
    });

    // Save business subcollection
    await db.collection('users').doc(phone).collection('business').doc('data').set({
      ...persona.business,
      created_at: now,
      updated_at: now,
    });

    // Save loan subcollection
    const loanData = scenario.loan || persona.loan;
    if (loanData) {
      const loanHistory = this.generateLoanHistory(loanData, scenario.payment_status);
      await db.collection('users').doc(phone).collection('loan').doc('data').set({
        ...loanData,
        next_payment_date: this.getNextPaymentDate(),
        history: loanHistory,
        created_at: now,
        updated_at: now,
      });
    }

    // Save literacy subcollection
    const quizWeeks = scenario.quiz_weeks !== undefined ? scenario.quiz_weeks : persona.quiz_weeks;
    const literacyData = this.generateLiteracyData(quizWeeks);
    await db.collection('users').doc(phone).collection('literacy').doc('data').set({
      ...literacyData,
      created_at: now,
      updated_at: now,
    });

    // Generate BI data
    const biCount = scenario.bi_count !== undefined ? scenario.bi_count : 2;
    await this.generateBIData(phone, biCount, persona.business.category);

    // Add to majelis members if assigned
    if (scenario.assign_majelis) {
      const majelisRef = db.collection('majelis').doc(DEMO_MAJELIS_ID);
      const majelisDoc = await majelisRef.get();
      const members = majelisDoc.data()?.members || [];
      if (!members.includes(phone)) {
        await majelisRef.update({ members: [...members, phone] });
      }
    }

    // Build response
    const scenarioName = parts[1] || 'sukses';
    const flags = scenario.flags ? `\n⚠️ Flags: ${scenario.flags.join(', ')}` : '';
    
    return {
      error: false,
      message: `✅ *Demo Mode Activated*\n\n` +
        `👤 Persona: ${persona.name}\n` +
        `🏪 Usaha: ${persona.business.name}\n` +
        `📍 Lokasi: ${persona.business.location}\n` +
        `⭐ Tingkat: ${persona.business.maturity_level}/5\n` +
        `📊 Skenario: ${scenarioName.toUpperCase()}\n` +
        `💰 Pinjaman: ${loanData ? `Rp ${loanData.limit.toLocaleString('id-ID')}` : 'Tidak ada'}\n` +
        `📚 Quiz: ${quizWeeks}/15 minggu\n` +
        `📸 BI Data: ${biCount} foto\n` +
        `👥 Majelis: ${scenario.assign_majelis ? majelis.name : 'Tidak terdaftar'}` +
        flags +
        `\n\nKetik "menu" untuk mulai demo! 🎉`,
    };
  }

  async resetDemo(phone) {
    // Delete all subcollections
    const subcollections = ['business', 'loan', 'literacy', 'profile', 'business_intelligence'];
    for (const sub of subcollections) {
      const snapshot = await db.collection('users').doc(phone).collection(sub).get();
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
      }
    }
    
    // Delete main user doc
    await db.collection('users').doc(phone).delete();

    // Remove from demo majelis
    const majelisRef = db.collection('majelis').doc(DEMO_MAJELIS_ID);
    const majelisDoc = await majelisRef.get();
    if (majelisDoc.exists) {
      const members = majelisDoc.data()?.members || [];
      await majelisRef.update({ members: members.filter(m => m !== phone) });
    }

    return `🗑️ *Demo Reset Complete*\n\nSemua data demo telah dihapus.\nKetik /demo:random untuk memulai demo baru.`;
  }

  generateLoanHistory(loan, status) {
    const history = [];
    const disbursementDate = new Date();
    disbursementDate.setMonth(disbursementDate.getMonth() - 3);

    // Initial disbursement
    history.push({
      id: 'txn_001',
      type: 'disbursement',
      amount: loan.used + (loan.limit - loan.remaining - loan.used),
      date: disbursementDate.toISOString(),
      description: 'Pencairan pinjaman',
      balance_after: loan.used + (loan.limit - loan.remaining - loan.used),
    });

    // Payments
    let balance = history[0].balance_after;
    for (let i = 0; i < 2; i++) {
      const paymentDate = new Date(disbursementDate);
      paymentDate.setMonth(paymentDate.getMonth() + i + 1);
      
      if (status === 'missed' && i === 1) {
        history.push({
          id: `txn_00${i + 2}`,
          type: 'payment',
          amount: 0,
          date: paymentDate.toISOString(),
          description: '❌ Pembayaran terlewat',
          balance_after: balance,
        });
      } else if (status !== 'missed') {
        const payment = loan.next_payment_amount;
        balance -= payment;
        history.push({
          id: `txn_00${i + 2}`,
          type: 'payment',
          amount: payment,
          date: paymentDate.toISOString(),
          description: 'Pembayaran cicilan',
          balance_after: Math.max(0, balance),
        });
      }
    }

    return history;
  }

  generateLiteracyData(completedWeeks) {
    const data = {};
    for (let i = 1; i <= 15; i++) {
      const weekKey = `week_${String(i).padStart(2, '0')}`;
      if (i <= completedWeeks) {
        data[weekKey] = {
          score: 100,
          completed: true,
          last_updated: new Date().toISOString(),
        };
      }
    }
    return data;
  }

  async generateBIData(phone, count, category) {
    const types = ['building', 'inventory', 'ledger', 'transaction'];
    const now = new Date();

    for (let i = 0; i < count && i < types.length; i++) {
      const template = { ...BI_TEMPLATES[types[i]] };
      const biData = {
        user_phone: phone,
        ...template,
        source: {
          type: 'image',
          image_url: null, // Demo data, no actual image
          caption: `Demo ${types[i]} untuk ${category}`,
        },
        analyzed_at: new Date(now - i * 86400000).toISOString(), // Spread over days
        created_at: new Date(now - i * 86400000).toISOString(),
      };

      await db.collection('users').doc(phone).collection('business_intelligence').add(biData);
    }
  }

  getNextPaymentDate() {
    const next = new Date();
    next.setDate(next.getDate() + 14);
    return next.toISOString();
  }

  getHelpMessage() {
    return `📋 *Demo Commands*\n\n` +
      `*Persona:*\n` +
      `/demo:warung - Warung Sembako\n` +
      `/demo:toko - Toko Kelontong\n` +
      `/demo:makanan - Usaha Makanan\n` +
      `/demo:jahit - Jasa Jahit\n` +
      `/demo:pertanian - Pertanian\n` +
      `/demo:salon - Salon Kecantikan\n` +
      `/demo:laundry - Jasa Laundry\n` +
      `/demo:random - Random persona\n\n` +
      `*Skenario:*\n` +
      `/demo:sukses - Sukses, 80% quiz\n` +
      `/demo:baru - Anggota baru\n` +
      `/demo:krisis - Krisis keuangan\n` +
      `/demo:lulus - 100% lulus\n` +
      `/demo:fraud - Suspicious activity\n\n` +
      `*Kombinasi:*\n` +
      `/demo:warung+krisis\n` +
      `/demo:random+lulus\n\n` +
      `/demo:reset - Hapus data demo`;
  }

  isValidCommand(text) {
    return text.toLowerCase().startsWith('/demo:');
  }
}

module.exports = new DemoService();
