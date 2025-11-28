const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const UserService = require('../services/UserService');
const QuizService = require('../services/QuizService');
const { sendQuizQuestion } = require('./whatsapp');
const { retrieveKnowledge, getBusinessKPIs } = require('./knowledge');
const { BUSINESS_CATEGORIES } = require('../config/constants');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const FALLBACK_MESSAGE = "Maaf Bu, sinyal AI sedang gangguan. Mohon tanya ulang ya.";

// ✨ TOOL DEFINITION - Use category names for display
const CATEGORY_NAMES = BUSINESS_CATEGORIES.map(c => c.name);
const BUSINESS_CATEGORIES_NUMBERED = BUSINESS_CATEGORIES.map(c => `${c.num}. ${c.name}`).join('\n');

const registerUserTool = {
  name: "registerUser",
  description: "Registers a new user with their name, gender, business name, category number (1-25), and location.",
  parameters: {
    type: "OBJECT",
    properties: {
      name: { type: "STRING", description: "The user's name without honorific (e.g., Siti, Budi, Ahmad)" },
      gender: { type: "STRING", description: "User's gender: 'female' or 'male'. Infer from name or context." },
      business_name: { type: "STRING", description: "Name of business (e.g., Warung Sembako Siti, Toko Bakso Pak Budi)" },
      business_category_num: { type: "INTEGER", description: `Business category number (1-25). Match user's business to the closest category.` },
      business_location: { type: "STRING", description: "City or Village (e.g., Bogor, Ciseeng)" },
    },
    required: ["name", "gender", "business_name", "business_category_num", "business_location"],
  },
};

const startQuizTool = {
  name: "startQuiz",
  description: "Start or resume financial literacy quiz when user says: 'kuis', 'quiz', 'belajar', 'tes', 'ujian', 'soal', 'mulai kuis', or similar.",
  parameters: { type: "OBJECT", properties: {} },
};

const showProgressTool = {
  name: "showProgress",
  description: "Show user's financial literacy progress/scores when they ask about: 'nilai', 'hasil', 'skor', 'progress', 'hasil kuis', 'nilai saya'.",
  parameters: { type: "OBJECT", properties: {} },
};

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  generationConfig: { maxOutputTokens: 1500, temperature: 0.4 },
  tools: [{ functionDeclarations: [registerUserTool, startQuizTool, showProgressTool] }],
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ]
});

// 🛡️ INPUT VALIDATION
function validateInput(text) {
  // Check length
  if (!text || text.trim().length === 0) {
    return { valid: false, reason: "empty" };
  }
  if (text.length > 1000) {
    return { valid: false, reason: "too_long" };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/i, // Repeated characters (aaaaaaaaaa)
    /^[^a-zA-Z0-9\s]{20,}$/, // Only special characters
    /(https?:\/\/|www\.)/gi, // URLs (multiple)
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return { valid: false, reason: "spam" };
    }
  }
  
  return { valid: true };
}

async function getGeminiResponse(userText, senderPhone) {
  try {
    // 🛡️ VALIDATE INPUT
    const validation = validateInput(userText);
    if (!validation.valid) {
      if (validation.reason === "empty") {
        return "Maaf Bu, pesan kosong tidak bisa diproses.";
      }
      if (validation.reason === "too_long") {
        return "Maaf Bu, pesannya kepanjangan. Coba lebih singkat ya.";
      }
      if (validation.reason === "spam") {
        return "Maaf Bu, pesan tidak valid. Coba kirim pertanyaan yang jelas ya.";
      }
    }
    
    const userProfile = await UserService.getUser(senderPhone);
    const lowerText = userText.toLowerCase().trim();
    
    // 📋 MENU COMMAND - Different for new vs existing users
    const menuTriggers = ['menu', 'bantuan', 'help', 'tolong', 'bantu', 'apa saja', 'bisa apa', 'halo', 'hi', 'hai', 'hello', 'test', 'ping', 'tes'];
    if (menuTriggers.some(t => lowerText === t || lowerText.includes(t))) {
      if (!userProfile) {
        // NEW USER - Welcome & registration prompt
        return `*Selamat datang di Akademi-AI Amartha!*

Saya asisten digital untuk program literasi keuangan UMKM.

Untuk mendaftar, silakan berikan:
• Nama Anda
• Jenis usaha
• Lokasi usaha

Contoh: "Nama saya Siti, usaha warung sembako di Bogor"`;
      }
      // EXISTING USER - Full menu
      const honorific = userProfile.profile?.gender === 'male' ? 'Pak' : 'Bu';
      return `*Menu Utama*

Halo ${honorific} ${userProfile.name}! Ketik:

1. *KUIS* - Mulai kuis belajar
2. *NILAI* - Lihat hasil belajar
3. *DATA SAYA* - Info profil & pinjaman
4. *FOTO* - Kirim foto usaha
5. *JADWAL* - Info pertemuan majelis

Atau langsung tanya soal usaha Anda.`;
    }
    
    // 📅 JADWAL/MAJELIS COMMAND
    const jadwalTriggers = ['jadwal', 'majelis', 'pertemuan', 'kapan ketemu', 'ketemu kapan', 'kumpul'];
    if (jadwalTriggers.some(t => lowerText === t || lowerText.includes(t))) {
      if (!userProfile) {
        return "Maaf, Anda belum terdaftar. Silakan daftar dulu ya.";
      }
      const honorific = userProfile.profile?.gender === 'male' ? 'Pak' : 'Bu';
      if (!userProfile.majelis_name) {
        return `Maaf ${honorific}, Anda belum terdaftar di Majelis.\n\nHubungi petugas lapangan untuk didaftarkan ke Majelis ya.`;
      }
      return `*Jadwal Majelis*

Majelis: ${userProfile.majelis_name}
Hari: ${userProfile.majelis_day}
Jam: ${userProfile.majelis_time || '-'}
Lokasi: ${userProfile.majelis_location || '-'}

Jangan lupa hadir ya ${honorific}.`;
    }
    
    // 🐛 CEK DATA COMMAND
    const dataTriggers = ['debug', 'cek data', 'data saya', 'profil', 'info saya', 'lihat data', 'data', 'cek profil'];
    if (dataTriggers.some(t => lowerText === t || lowerText.includes(t))) {
      if (!userProfile) {
        return "*Data tidak ditemukan*\n\nAnda belum terdaftar di Amartha. Silakan daftar dulu.";
      }
      
      const majelisInfo = userProfile.majelis_name 
        ? `${userProfile.majelis_name} (${userProfile.majelis_day}, ${userProfile.majelis_time || ''})`
        : 'Belum terdaftar';
      
      const currentDebt = userProfile.loan?.history?.length > 0
        ? userProfile.loan.history[userProfile.loan.history.length - 1].balance_after
        : 0;
      
      const loanInfo = userProfile.loan?.limit > 0
        ? `\n\n*PINJAMAN*\n` +
          `Limit: Rp ${userProfile.loan.limit.toLocaleString('id-ID')}\n` +
          `Sisa Limit: Rp ${userProfile.loan.remaining.toLocaleString('id-ID')}\n` +
          `Hutang: Rp ${currentDebt.toLocaleString('id-ID')}\n` +
          `Cicilan: ${userProfile.loan.next_payment_date ? new Date(userProfile.loan.next_payment_date).toLocaleDateString('id-ID') : '-'} - Rp ${userProfile.loan.next_payment_amount.toLocaleString('id-ID')}`
        : '\n\n*PINJAMAN*\nBelum memiliki pinjaman aktif';
      
      const literacyInfo = userProfile.literacy 
        ? (() => {
            const weeks = Object.keys(userProfile.literacy).filter(k => k.startsWith('week_'));
            const completed = weeks.filter(w => userProfile.literacy[w]?.score >= 100).length;
            const percentage = Math.round((completed / 15) * 100);
            return `\n\n*LITERASI*\nProgress: ${completed}/15 minggu (${percentage}%)`;
          })()
        : '\n\n*LITERASI*\nBelum memulai program';
      
      return `*PROFIL ANDA*\n\n` +
             `Nama: ${userProfile.name}\n` +
             `No. HP: ${userProfile.phone}\n` +
             `Usaha: ${userProfile.business?.name || '-'}\n` +
             `Kategori: ${userProfile.business?.category || '-'}\n` +
             `Lokasi: ${userProfile.business?.location || '-'}\n` +
             `Tingkat: ${userProfile.business?.maturity_level || 1}/5\n` +
             `Majelis: ${majelisInfo}\n` +
             `Status: ${userProfile.status === 'active' ? 'Terverifikasi' : 'Menunggu Verifikasi'}` +
             loanInfo +
             literacyInfo;
    }
    
    // 💰 POPULATE LOAN COMMAND (for testing)
    if (lowerText === 'populate loan' || lowerText === 'isi pinjaman') {
      if (!userProfile) {
        return "Anda belum terdaftar.";
      }
      const result = await UserService.createMockLoanData(senderPhone);
      if (result.error) {
        return `Gagal: ${result.error}`;
      }
      return `*Data pinjaman berhasil dibuat*\n\n` +
             `Limit: Rp ${result.data.limit.toLocaleString('id-ID')}\n` +
             `Sisa: Rp ${result.data.remaining.toLocaleString('id-ID')}\n` +
             `Cicilan: ${new Date(result.data.next_payment_date).toLocaleDateString('id-ID')} - Rp ${result.data.next_payment_amount.toLocaleString('id-ID')}\n\n` +
             `Ketik "cek data" untuk detail lengkap.`;
    }
    
    const ragContext = await retrieveKnowledge(userText);
    
    // Get business KPIs for existing users (use category_id for direct lookup)
    let businessKPIsContext = '';
    if (userProfile?.business?.category_id) {
      const kpis = await getBusinessKPIs(
        userProfile.business.category_id, 
        userProfile.business.maturity_level || 1
      );
      if (kpis && kpis.kpis?.length > 0) {
        businessKPIsContext = `
      
      TARGET NAIK LEVEL (dari Level ${kpis.current_level} ke Level ${kpis.next_level}):
      Tujuan: ${kpis.goal || 'Meningkatkan kapasitas usaha'}
      KPI yang harus dicapai:
      ${kpis.kpis.slice(0, 5).map((k, i) => `${i + 1}. ${k}`).join('\n      ')}
      
      Gunakan KPI ini untuk memberikan saran spesifik ketika user bertanya tentang cara mengembangkan usaha.`;
      }
    }
    
    // 1. Construct Prompt
    let systemPrompt = "";
    
    if (!userProfile) {
      // 🟢 NEW USER FLOW
      systemPrompt = `
      PERAN: Akademi-AI, asisten pendaftaran Amartha untuk program literasi keuangan UMKM.
      TUGAS: Kamu sedang berbicara dengan pengguna BARU (belum terdaftar).
      
      JIKA USER MENYAPA (halo, hi, hello, test, ping, tes, dll):
      Balas dengan menu:
      "*Selamat datang di Akademi-AI Amartha!*
      
      Saya bisa membantu Anda:
      1. *DAFTAR* - Daftar program literasi keuangan
      2. *INFO* - Informasi tentang Amartha
      
      Untuk mendaftar, silakan berikan: Nama, Jenis Usaha, dan Lokasi.
      Contoh: Nama saya Siti, usaha warung sembako di Bogor"
      
      INSTRUKSI PENDAFTARAN:
      1. Jika user BELUM memberikan data lengkap, minta: Nama, Jenis Usaha, dan Lokasi.
      2. Jika user memberikan jenis usaha yang TIDAK ADA di daftar kategori, tanyakan ulang dengan menampilkan daftar kategori dalam format bernomor.
      3. Jika user SUDAH memberikan Nama DAN Jenis Usaha (yang valid) DAN Lokasi, WAJIB panggil tool 'registerUser'.
      4. JANGAN minta konfirmasi lagi. LANGSUNG PANGGIL TOOL.
      
      DAFTAR KATEGORI USAHA (jika perlu ditampilkan):
${BUSINESS_CATEGORIES_NUMBERED}
      
      Jika usaha user tidak cocok dengan kategori manapun, gunakan "Lainnya".
      `;
    } else {
      // 🔵 EXISTING USER FLOW
      const majelisInfo = userProfile.majelis_name 
        ? `${userProfile.majelis_name} (${userProfile.majelis_day})`
        : 'Belum terdaftar di Majelis';
      
      const hasLoan = userProfile.loan?.limit > 0;
      const loanContext = hasLoan 
        ? `\n- Limit Pinjaman: Rp ${userProfile.loan.limit.toLocaleString('id-ID')}\n` +
          `- Sisa Limit: Rp ${userProfile.loan.remaining.toLocaleString('id-ID')}\n` +
          `- Cicilan Berikutnya: ${userProfile.loan.next_payment_date ? new Date(userProfile.loan.next_payment_date).toLocaleDateString('id-ID') : 'Tidak ada'}\n` +
          `- Jumlah Cicilan: Rp ${userProfile.loan.next_payment_amount.toLocaleString('id-ID')}`
        : '\n- Belum memiliki pinjaman aktif';
      
      const honorific = userProfile.profile?.gender === 'male' ? 'Pak' : 'Bu';
      
      systemPrompt = `
      PERAN: Akademi-AI, asisten bisnis ${userProfile.name} untuk program literasi keuangan Amartha.
      SAPAAN: Gunakan "${honorific}" untuk menyapa user ini.
      CONTEXT: 
      - Nama: ${userProfile.name}
      - Gender: ${userProfile.profile?.gender || 'unknown'}
      - Usaha: ${userProfile.business?.name || 'Belum diisi'}
      - Kategori: ${userProfile.business?.category || 'Belum dikategorikan'}
      - Lokasi: ${userProfile.business?.location || 'Belum diisi'}
      - Tingkat Usaha: ${userProfile.business?.maturity_level || 1}/5
      - Status: ${userProfile.status === 'active' ? "Terverifikasi" : "Belum Verifikasi (Limit Akses)"}
      - Majelis: ${majelisInfo}${loanContext}
      
      BATASAN TOPIK:
      - HANYA jawab tentang: literasi keuangan, manajemen usaha, Amartha, bisnis UMKM
      - TOLAK topik: politik, agama, gosip, hal pribadi, permintaan tidak pantas
      - Jika topik di luar scope, jawab: "Maaf ${honorific}, saya hanya bisa membantu literasi keuangan dan usaha. Ada yang bisa saya bantu terkait bisnis Anda?"
      
      KAMUS ISTILAH AMARTHA:
      ${ragContext}${businessKPIsContext}
      
      INSTRUKSI:
      1. User SUDAH TERDAFTAR. JANGAN minta data nama/usaha/lokasi lagi.
      2. Jawab pertanyaan bisnis/keuangan dengan ramah dan informatif.
      3. Jika user bertanya soal "Kapan Majelis?" atau "Limit Pinjaman", dan status mereka "Belum Verifikasi",
         jawab: "Maaf ${honorific}, data Majelis harus diaktifkan oleh Petugas Lapangan (BP) dulu. Silakan hubungi petugas di pertemuan berikutnya."
      4. Gunakan bahasa Indonesia yang sopan dan ramah. Sapa user dengan "${honorific}".
      `;
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Mengerti. Saya siap melayani sesuai status user." }] },
      ],
    });

    const result = await chat.sendMessage(userText);
    const response = await result.response;
    
    // ✨ HANDLE TOOL CALLS
    const functionCall = response.functionCalls() ? response.functionCalls()[0] : null;
    
    
    if (functionCall) {
      const { name, args } = functionCall;
      
      if (name === "registerUser") {
        // Execute DB Update
        const newUser = await UserService.createUser(senderPhone, args);
        
        if (!newUser) {
          return "Maaf, terjadi kesalahan saat mendaftar. Silakan coba lagi.";
        }
        
        // Send Tool Output back to Gemini
        const finalResult = await chat.sendMessage([
          {
            functionResponse: {
              name: "registerUser",
              response: { status: "success", message: "User registered. Pending BP verification." },
            },
          }
        ]);
        return finalResult.response.text();
      }
      
      if (name === "startQuiz") {
        const quizResult = await QuizService.startQuiz(senderPhone);
        
        if (quizResult.completed) {
          return quizResult.message;
        }
        
        if (quizResult.resumed) {
          return "Anda masih memiliki sesi quiz aktif. Silakan selesaikan pertanyaan yang sedang berjalan.";
        }
        
        if (quizResult.started && quizResult.question) {
          const { sendMessage } = require('./whatsapp');
          
          // Send intro first
          const intro = `*Quiz Minggu ${quizResult.weekInfo.week_number}*\n\n` +
                 `Topik: ${quizResult.weekInfo.module_name}\n\n` +
                 `4 pertanyaan, nilai lulus 100% (4/4 benar).`;
          await sendMessage(senderPhone, intro);
          
          // Then send question
          await sendQuizQuestion(senderPhone, quizResult.question, 1, 4);
          
          return null; // Already sent messages
        }
      }
      
      if (name === "showProgress") {
        const progress = await QuizService.getProgress(senderPhone);
        
        let message = `*Progress Literasi Keuangan*\n\n`;
        message += `Selesai: ${progress.total_completed}/15 minggu (${progress.percentage}%)\n`;
        
        if (progress.completed.length > 0) {
          message += `\nLulus:\n`;
          progress.completed.forEach(w => {
            message += `- Minggu ${w.week}: ${w.score}%\n`;
          });
        }
        
        if (progress.inProgress.length > 0) {
          message += `\nDalam Progress:\n`;
          progress.inProgress.forEach(w => {
            message += `- Minggu ${w.week}: ${w.score}%\n`;
          });
        }
        
        if (progress.total_completed < 15) {
          message += `\nKetik "quiz" untuk melanjutkan.`;
        } else {
          message += `\nSelamat! Semua minggu selesai.`;
        }
        
        return message;
      }
    }

    return response.text();
    
  } catch (error) {
    console.error('Gemini Error:', error.message);
    return FALLBACK_MESSAGE;
  }
}

module.exports = { getGeminiResponse };