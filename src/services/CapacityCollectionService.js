/**
 * CapacityCollectionService
 * Collects RPC data through natural WhatsApp conversation
 */

const RPCService = require('./RPCService');

// In-memory sessions (like QuizSessionRepository)
const sessions = new Map();

const QUESTIONS = [
  {
    field: 'daily_revenue',
    text: 'Berapa rata-rata omset harian usaha Ibu? (contoh: 500 ribu, 1 juta)',
    parser: 'currency',
    validation: { min: 10000, max: 100000000 }
  },
  {
    field: 'active_days',
    text: 'Dalam sebulan, berapa hari Ibu buka usaha? (contoh: 25 hari)',
    parser: 'days',
    validation: { min: 1, max: 31 }
  },
  {
    field: 'cogs_percentage',
    text: 'Berapa persen dari omset untuk modal/belanja barang? (contoh: 60%)',
    parser: 'percentage',
    validation: { min: 0, max: 100 }
  },
  {
    field: 'household_expenses',
    text: 'Berapa pengeluaran rumah tangga per bulan? (listrik, makan, dll)',
    parser: 'currency',
    validation: { min: 0, max: 50000000 }
  },
  {
    field: 'existing_obligations',
    text: 'Ada cicilan atau arisan bulanan? Berapa totalnya? (0 jika tidak ada)',
    parser: 'currency',
    validation: { min: 0, max: 50000000 }
  }
];

const TRIGGERS = [
  'kapasitas', 'kemampuan bayar', 'bisa pinjam', 'analisis usaha',
  'hitung kapasitas', 'cek kapasitas', 'kemampuan cicilan'
];

class CapacityCollectionService {
  static getQuestions() {
    return QUESTIONS;
  }

  static startSession(phone) {
    const session = {
      phone,
      step: 0,
      data: {},
      completed: false,
      started_at: new Date().toISOString()
    };
    sessions.set(phone, session);
    return session;
  }

  static getSession(phone) {
    return sessions.get(phone) || null;
  }

  static clearSession(phone) {
    sessions.delete(phone);
  }

  static getCurrentQuestion(session) {
    if (session.step >= QUESTIONS.length) return null;
    return QUESTIONS[session.step];
  }

  static shouldTrigger(text) {
    const lower = (text || '').toLowerCase();
    return TRIGGERS.some(t => lower.includes(t));
  }

  static processAnswer(phone, answer) {
    const session = sessions.get(phone);
    if (!session) return { success: false, error: 'No active session' };

    const question = QUESTIONS[session.step];
    if (!question) return { success: false, error: 'No more questions' };

    // Parse answer based on type
    let value;
    switch (question.parser) {
      case 'currency':
        value = this.parseCurrency(answer);
        break;
      case 'days':
        value = this.parseDays(answer);
        break;
      case 'percentage':
        value = this.parsePercentage(answer);
        break;
      default:
        value = parseFloat(answer);
    }

    // Validate
    if (value === null || isNaN(value)) {
      return { 
        success: false, 
        error: `Maaf, saya tidak mengerti. ${question.text}`,
        retry: true
      };
    }

    const { min, max } = question.validation;
    if (value < min || value > max) {
      return {
        success: false,
        error: `Angka tidak valid (${min.toLocaleString('id-ID')} - ${max.toLocaleString('id-ID')}). Coba lagi.`,
        retry: true
      };
    }

    // Store and advance
    session.data[question.field] = value;
    session.step++;

    // Check if completed
    if (session.step >= QUESTIONS.length) {
      session.completed = true;
      const rpc = this.calculateRPC(session.data);
      const result = { 
        success: true, 
        completed: true, 
        data: session.data,
        rpc,
        field: question.field,
        value
      };
      this.clearSession(phone); // Clear after completion
      return result;
    }

    return {
      success: true,
      completed: false,
      field: question.field,
      value,
      nextQuestion: QUESTIONS[session.step]
    };
  }

  static parseCurrency(text) {
    if (!text) return null;
    const lower = text.toLowerCase().replace(/rp/g, '').trim();
    
    // Handle "juta" / "jt" first (higher multiplier)
    let match = lower.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)/);
    if (match) return parseFloat(match[1].replace(',', '.')) * 1000000;
    
    // Handle "ribu" / "rb"
    match = lower.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb)/);
    if (match) return parseFloat(match[1].replace(',', '.')) * 1000;
    
    // Plain number (remove dots as thousand separators)
    const cleaned = lower.replace(/\./g, '').replace(/,/g, '');
    const num = parseFloat(cleaned.replace(/\D/g, ''));
    return isNaN(num) ? null : num;
  }

  static parseDays(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    
    // Handle "X hari seminggu" pattern (convert to monthly)
    const weeklyMatch = lower.match(/(\d+)\s*hari\s*(seminggu|per\s*minggu)/);
    if (weeklyMatch) {
      const daysPerWeek = parseInt(weeklyMatch[1]);
      return Math.round(daysPerWeek * 4.33); // ~4.33 weeks per month
    }
    
    // Handle "setiap hari" without number
    if ((lower.includes('setiap hari') || lower.includes('tiap hari')) && !lower.match(/\d+/)) return 30;
    
    // Extract plain number
    const match = lower.match(/(\d+)/);
    if (match) return parseInt(match[1]);
    
    return null;
  }

  static parsePercentage(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    
    if (lower.includes('setengah') || lower.includes('separuh')) return 50;
    if (lower.includes('sepertiga')) return 33;
    if (lower.includes('seperempat')) return 25;
    
    const match = lower.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  static calculateRPC(data) {
    return RPCService.calculateRPC(data);
  }

  static formatRPCResult(rpc, data) {
    const fmt = (n) => `Rp ${n.toLocaleString('id-ID')}`;
    
    return `📊 *HASIL ANALISIS KAPASITAS*

💰 *Pendapatan*
Omset/hari: ${fmt(data.daily_revenue)}
Hari aktif: ${data.active_days} hari/bulan
Omset/bulan: ${fmt(rpc.monthly_income)}

💸 *Pengeluaran*
Modal usaha: ${fmt(rpc.cogs)} (${data.cogs_percentage}%)
Rumah tangga: ${fmt(data.household_expenses)}
Cicilan lain: ${fmt(data.existing_obligations)}
Total: ${fmt(rpc.monthly_expenses)}

✨ *Kapasitas Bayar*
Sisa bersih: ${fmt(rpc.sustainable_disposable_cash)}
Kemampuan cicilan: *${fmt(rpc.max_installment)}/bulan*

${rpc.max_installment >= 500000 
  ? '✅ Kapasitas baik untuk pengajuan pinjaman!' 
  : '⚠️ Kapasitas terbatas. Tingkatkan omset atau kurangi pengeluaran.'}`;
  }
}

module.exports = CapacityCollectionService;
