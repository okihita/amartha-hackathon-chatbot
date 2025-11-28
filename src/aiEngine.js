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

async function getGeminiResponse(userText, senderPhone) {
  try {
    const userProfile = getUserContext(senderPhone);
    
    // 🐛 DEBUG COMMAND
    const lowerText = userText.toLowerCase().trim();
    if (lowerText === 'debug' || lowerText === 'cek data') {
      if (!userProfile) {
        return "❌ Data tidak ditemukan. Anda belum terdaftar.";
      }
      return `📊 *Data Profil Anda:*\n\n` +
             `👤 Nama: ${userProfile.name}\n` +
             `🏪 Usaha: ${userProfile.business_type}\n` +
             `📍 Lokasi: ${userProfile.location}\n` +
             `📅 Jadwal Majelis: ${userProfile.majelis_day}\n` +
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
      PERAN: Akademi-AI, asisten pendaftaran Amartha.
      TUGAS: Kamu sedang berbicara dengan pengguna BARU (belum terdaftar).
      INSTRUKSI:
      1. Sapa dengan ramah SEKALI SAJA.
      2. Minta data diri: Nama, Jenis Usaha, dan Lokasi dalam SATU pesan.
      3. JANGAN minta data berulang-ulang. Tunggu user memberikan semua info.
      4. Jika mereka memberikan ketiga data tersebut, LANGSUNG GUNAKAN TOOL 'registerUser'.
      5. JANGAN jawab pertanyaan lain sebelum mereka mendaftar.
      `;
    } else {
      // 🔵 EXISTING USER FLOW
      systemPrompt = `
      PERAN: Akademi-AI, asisten bisnis Ibu ${userProfile.name}.
      CONTEXT: 
      - Nama: ${userProfile.name}
      - Usaha: ${userProfile.business_type}
      - Lokasi: ${userProfile.location}
      - Status: ${userProfile.is_verified ? "Terverifikasi" : "Belum Verifikasi (Limit Akses)"}
      - Jadwal Majelis: ${userProfile.majelis_day}
      
      KAMUS ISTILAH AMARTHA:
      ${ragContext}
      
      INSTRUKSI:
      1. User SUDAH TERDAFTAR. JANGAN minta data nama/usaha/lokasi lagi.
      2. Jawab pertanyaan bisnis/keuangan mereka.
      3. Jika user bertanya soal "Kapan Majelis?" atau "Limit Pinjaman", dan status mereka "Belum Verifikasi",
         jawab: "Maaf Bu, data Majelis harus diaktifkan oleh Petugas Lapangan (BP) dulu. Silakan hubungi petugas di pertemuan berikutnya."
      4. Gunakan bahasa Indonesia yang ramah.
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
        registerNewUser(senderPhone, args);
        
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