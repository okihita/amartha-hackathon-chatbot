const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { getUserContext, registerNewUser } = require('./db');
const { retrieveKnowledge } = require('./knowledge');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const FALLBACK_MESSAGE = "Maaf Ibu, sinyal AI sedang gangguan. Mohon tanya ulang ya.";

// ✨ TOOL DEFINITION
const registerUserTool = {
  name: "registerUser",
  description: "Registers a new user with their name, business type, and location.",
  parameters: {
    type: "OBJECT",
    properties: {
      name: { type: "STRING", description: "The user's name (e.g., Ibu Siti)" },
      business_type: { type: "STRING", description: "Type of business (e.g., Warung Sembako, Jual Bakso)" },
      location: { type: "STRING", description: "City or Village (e.g., Bogor, Ciseeng)" },
    },
    required: ["name", "business_type", "location"],
  },
};

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  generationConfig: { maxOutputTokens: 1500, temperature: 0.4 },
  tools: [{ functionDeclarations: [registerUserTool] }],
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
        return "Maaf, pesan kosong tidak dapat diproses.";
      }
      if (validation.reason === "too_long") {
        return "Maaf, pesan terlalu panjang. Mohon kirim pesan yang lebih singkat.";
      }
      if (validation.reason === "spam") {
        console.log(`⚠️ Spam detected from ${senderPhone}: ${userText.substring(0, 50)}`);
        return "Maaf, pesan tidak valid. Silakan kirim pertanyaan yang jelas.";
      }
    }
    
    const userProfile = await getUserContext(senderPhone);
    
    // 🐛 DEBUG COMMAND
    const lowerText = userText.toLowerCase().trim();
    if (lowerText === 'debug' || lowerText === 'cek data') {
      if (!userProfile) {
        return "❌ Data tidak ditemukan. Anda belum terdaftar.";
      }
      const majelisInfo = userProfile.majelis_name 
        ? `${userProfile.majelis_name} (${userProfile.majelis_day})`
        : 'Belum terdaftar di Majelis';
      
      return `📊 *Data Profil Anda:*\n\n` +
             `👤 Nama: ${userProfile.name}\n` +
             `🏪 Usaha: ${userProfile.business_type}\n` +
             `📍 Lokasi: ${userProfile.location}\n` +
             `📅 Majelis: ${majelisInfo}\n` +
             `📚 Modul: ${userProfile.current_module}\n` +
             `📊 Literasi: ${userProfile.literacy_score}\n` +
             `✅ Status: ${userProfile.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}`;
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
      
      systemPrompt = `
      PERAN: Akademi-AI, asisten bisnis Ibu ${userProfile.name} untuk program literasi keuangan Amartha.
      CONTEXT: 
      - Nama: ${userProfile.name}
      - Usaha: ${userProfile.business_type}
      - Lokasi: ${userProfile.location}
      - Status: ${userProfile.is_verified ? "Terverifikasi" : "Belum Verifikasi (Limit Akses)"}
      - Majelis: ${majelisInfo}
      
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
    
    console.log('🔍 Function Call:', functionCall ? JSON.stringify(functionCall) : 'None');
    
    if (functionCall) {
      const { name, args } = functionCall;
      if (name === "registerUser") {
        console.log('📝 Registering user with args:', JSON.stringify(args));
        // Execute DB Update
        const newUser = await registerNewUser(senderPhone, args);
        
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
    }

    return response.text();
    
  } catch (error) {
    console.error('Gemini Error:', error.message);
    return FALLBACK_MESSAGE;
  }
}

module.exports = { getGeminiResponse };