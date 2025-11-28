const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const UserService = require('../services/UserService');
const QuizService = require('../services/QuizService');
const { sendQuizQuestion } = require('./whatsapp');
const { retrieveKnowledge } = require('./knowledge');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const FALLBACK_MESSAGE = "Maaf Ibu, sinyal AI sedang gangguan. Mohon tanya ulang ya.";

// ✨ TOOL DEFINITION
const registerUserTool = {
  name: "registerUser",
  description: "Registers a new user with their name, business name, and location.",
  parameters: {
    type: "OBJECT",
    properties: {
      name: { type: "STRING", description: "The user's name (e.g., Ibu Siti)" },
      business_name: { type: "STRING", description: "Name of business (e.g., Warung Sembako Siti, Toko Bakso Pak Budi)" },
      business_location: { type: "STRING", description: "City or Village (e.g., Bogor, Ciseeng)" },
    },
    required: ["name", "business_name", "business_location"],
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
    
    // 📋 MENU COMMAND
    const menuTriggers = ['menu', 'bantuan', 'help', 'tolong', 'bantu', 'apa saja', 'bisa apa', 'halo', 'hi', 'hai'];
    if (menuTriggers.some(t => lowerText === t || lowerText.includes(t))) {
      return `📋 *Menu Utama*

Ketik angka atau kata:

1️⃣ *KUIS* - Mulai kuis belajar
2️⃣ *NILAI* - Lihat hasil belajar saya
3️⃣ *DATA SAYA* - Info profil & pinjaman
4️⃣ *FOTO* - Kirim foto usaha
5️⃣ *JADWAL* - Info pertemuan majelis

Atau langsung tanya apa saja soal usaha! 😊`;
    }
    
    // 📅 JADWAL/MAJELIS COMMAND
    const jadwalTriggers = ['jadwal', 'majelis', 'pertemuan', 'kapan ketemu', 'ketemu kapan', 'kumpul'];
    if (jadwalTriggers.some(t => lowerText === t || lowerText.includes(t))) {
      if (!userProfile) {
        return "Maaf Bu, Ibu belum terdaftar. Silakan daftar dulu ya.";
      }
      if (!userProfile.majelis_name) {
        return "Maaf Bu, Ibu belum terdaftar di Majelis.\n\nHubungi petugas lapangan untuk didaftarkan ke Majelis ya.";
      }
      return `📅 *Jadwal Majelis*

👥 Majelis: ${userProfile.majelis_name}
📆 Hari: ${userProfile.majelis_day}
🕐 Jam: ${userProfile.majelis_time || '-'}
📍 Lokasi: ${userProfile.majelis_location || '-'}

Jangan lupa hadir ya Bu! 😊`;
    }
    
    // 🐛 CEK DATA COMMAND
    const dataTriggers = ['debug', 'cek data', 'data saya', 'profil', 'info saya', 'lihat data', 'data', 'cek profil'];
    if (dataTriggers.some(t => lowerText === t || lowerText.includes(t))) {
      if (!userProfile) {
        return "❌ *Data tidak ditemukan*\n\nIbu belum terdaftar di Amartha. Silakan daftar dulu ya.";
      }
      
      const majelisInfo = userProfile.majelis_name 
        ? `${userProfile.majelis_name} (${userProfile.majelis_day}, ${userProfile.majelis_time || ''})`
        : '❌ Belum terdaftar';
      
      const currentDebt = userProfile.loan?.history?.length > 0
        ? userProfile.loan.history[userProfile.loan.history.length - 1].balance_after
        : 0;
      
      const loanInfo = userProfile.loan?.limit > 0
        ? `\n\n💰 *INFORMASI PINJAMAN*\n` +
          `• Limit Total: Rp ${userProfile.loan.limit.toLocaleString('id-ID')}\n` +
          `• Sisa Limit: Rp ${userProfile.loan.remaining.toLocaleString('id-ID')}\n` +
          `• Hutang Saat Ini: Rp ${currentDebt.toLocaleString('id-ID')}\n` +
          `• Cicilan Berikutnya: ${userProfile.loan.next_payment_date ? new Date(userProfile.loan.next_payment_date).toLocaleDateString('id-ID') : '-'}\n` +
          `• Jumlah Cicilan: Rp ${userProfile.loan.next_payment_amount.toLocaleString('id-ID')}`
        : '\n\n💰 *INFORMASI PINJAMAN*\n❌ Belum memiliki pinjaman aktif';
      
      const literacyInfo = userProfile.literacy 
        ? (() => {
            const weeks = Object.keys(userProfile.literacy).filter(k => k.startsWith('week_'));
            const completed = weeks.filter(w => userProfile.literacy[w]?.score >= 100).length;
            const percentage = Math.round((completed / 15) * 100);
            return `\n\n📚 *LITERASI KEUANGAN*\n• Progress: ${completed}/15 minggu (${percentage}%)\n• Status: ${completed >= 15 ? '✅ Selesai' : '🔄 Sedang berjalan'}`;
          })()
        : '\n\n📚 *LITERASI KEUANGAN*\n❌ Belum memulai program';
      
      return `✅ *PROFIL ANDA*\n\n` +
             `👤 Nama: ${userProfile.name}\n` +
             `📱 No. HP: ${userProfile.phone}\n` +
             `🏪 Usaha: ${userProfile.business?.name || '-'}\n` +
             `📍 Lokasi: ${userProfile.business?.location || '-'}\n` +
             `⭐ Tingkat Usaha: ${userProfile.business?.maturity_level || 1}/5\n` +
             `👥 Majelis: ${majelisInfo}\n` +
             `✅ Status: ${userProfile.status === 'active' ? 'Terverifikasi' : 'Menunggu Verifikasi'}` +
             loanInfo +
             literacyInfo;
    }
    
    // 💰 POPULATE LOAN COMMAND (for testing)
    if (lowerText === 'populate loan' || lowerText === 'isi pinjaman') {
      if (!userProfile) {
        return "❌ Anda belum terdaftar.";
      }
      const result = await UserService.createMockLoanData(senderPhone);
      if (result.error) {
        return `❌ Gagal: ${result.error}`;
      }
      return `✅ *Data pinjaman berhasil dibuat!*\n\n` +
             `💰 Limit: Rp ${result.data.limit.toLocaleString('id-ID')}\n` +
             `💳 Sisa Limit: Rp ${result.data.remaining.toLocaleString('id-ID')}\n` +
             `📅 Cicilan Berikutnya: ${new Date(result.data.next_payment_date).toLocaleDateString('id-ID')}\n` +
             `💵 Jumlah: Rp ${result.data.next_payment_amount.toLocaleString('id-ID')}\n\n` +
             `Ketik "cek data" untuk melihat detail lengkap.`;
    }
    
    const ragContext = retrieveKnowledge(userText);
    
    // 1. Construct Prompt
    let systemPrompt = "";
    
    if (!userProfile) {
      // 🟢 NEW USER FLOW
      systemPrompt = `
      PERAN: Akademi-AI, asisten pendaftaran Amartha untuk program literasi keuangan UMKM.
      TUGAS: Kamu sedang berbicara dengan pengguna BARU (belum terdaftar).
      
      BATASAN TOPIK:
      - HANYA jawab tentang: pendaftaran Amartha, literasi keuangan, UMKM, bisnis
      - TOLAK topik: politik, agama, gosip, hal pribadi, permintaan tidak pantas
      - Jika topik di luar scope, jawab: "Maaf Bu, saya hanya bisa membantu pendaftaran dan literasi keuangan Amartha. Ada yang bisa saya bantu terkait usaha Ibu?"
      
      INSTRUKSI PENDAFTARAN:
      1. Jika user BELUM memberikan data, minta: Nama, Jenis Usaha, dan Lokasi.
         Contoh: "Untuk mendaftar, mohon berikan: Nama Ibu, Jenis Usaha, dan Lokasi. Contoh: Nama saya Ibu Siti, usaha warung sembako di Bogor"
      2. Jika user SUDAH memberikan Nama DAN Jenis Usaha DAN Lokasi, WAJIB panggil tool 'registerUser'.
      3. JANGAN minta konfirmasi lagi. LANGSUNG PANGGIL TOOL.
      4. Setelah tool dipanggil, ucapkan terima kasih dan beritahu menunggu verifikasi petugas.
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
      
      systemPrompt = `
      PERAN: Akademi-AI, asisten bisnis Ibu ${userProfile.name} untuk program literasi keuangan Amartha.
      CONTEXT: 
      - Nama: ${userProfile.name}
      - Usaha: ${userProfile.business?.name || 'Belum diisi'}
      - Lokasi: ${userProfile.business?.location || 'Belum diisi'}
      - Status: ${userProfile.status === 'active' ? "Terverifikasi" : "Belum Verifikasi (Limit Akses)"}
      - Majelis: ${majelisInfo}${loanContext}
      
      BATASAN TOPIK:
      - HANYA jawab tentang: literasi keuangan, manajemen usaha, Amartha, bisnis UMKM
      - TOLAK topik: politik, agama, gosip, hal pribadi, permintaan tidak pantas
      - Jika topik di luar scope, jawab: "Maaf Bu, saya hanya bisa membantu literasi keuangan dan usaha. Ada yang bisa saya bantu terkait bisnis Ibu?"
      
      KAMUS ISTILAH AMARTHA:
      ${ragContext}
      
      INSTRUKSI:
      1. User SUDAH TERDAFTAR. JANGAN minta data nama/usaha/lokasi lagi.
      2. Jawab pertanyaan bisnis/keuangan dengan ramah dan informatif.
      3. Jika user bertanya soal "Kapan Majelis?" atau "Limit Pinjaman", dan status mereka "Belum Verifikasi",
         jawab: "Maaf Bu, data Majelis harus diaktifkan oleh Petugas Lapangan (BP) dulu. Silakan hubungi petugas di pertemuan berikutnya."
      4. Gunakan bahasa Indonesia yang sopan dan ramah.
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
          const intro = `📚 Quiz Minggu ${quizResult.weekInfo.week_number} dimulai!\n\n` +
                 `Topik: ${quizResult.weekInfo.module_name}\n\n` +
                 `Anda akan menjawab 4 pertanyaan. Setiap jawaban benar bernilai 25%. ` +
                 `Nilai minimal lulus: 100%.`;
          await sendMessage(senderPhone, intro);
          
          // Then send question
          await sendQuizQuestion(senderPhone, quizResult.question, 1, 4);
          
          return null; // Already sent messages
        }
      }
      
      if (name === "showProgress") {
        const progress = await QuizService.getProgress(senderPhone);
        
        let message = `📊 Progress Literasi Keuangan Anda:\n\n`;
        message += `✅ Selesai: ${progress.total_completed}/15 minggu (${progress.percentage}%)\n\n`;
        
        if (progress.completed.length > 0) {
          message += `🎯 Minggu yang Lulus:\n`;
          progress.completed.forEach(w => {
            message += `• Minggu ${w.week}: ${w.score}%\n`;
          });
        }
        
        if (progress.inProgress.length > 0) {
          message += `\n📝 Dalam Progress:\n`;
          progress.inProgress.forEach(w => {
            message += `• Minggu ${w.week}: ${w.score}% (belum lulus)\n`;
          });
        }
        
        if (progress.total_completed < 15) {
          message += `\n💡 Ketik "quiz" untuk melanjutkan!`;
        } else {
          message += `\n🎉 Selamat! Anda telah menyelesaikan semua minggu!`;
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