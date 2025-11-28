const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 8080;

// 🔑 CONFIGURATION
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🛡️ FALLBACK MESSAGE
const FALLBACK_MESSAGE = "Maaf Ibu, sinyal AI sedang gangguan. Mohon tanya ulang ya.";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  generationConfig: {
    maxOutputTokens: 1500, 
    temperature: 0.4, // Lower temp for factual RAG responses
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ]
});

app.use(bodyParser.json());

// ==================================================================
// 📚 AMARTHA KNOWLEDGE BASE (Extended RAG)
// ==================================================================
// "The Brain" - Expanded with Amartha Product Overview data
const amarthaKnowledge = [
  {
    id: "majelis",
    keywords: ["majelis", "kumpulan", "pertemuan", "kelompok", "hari apa"],
    content: "DEFINISI MAJELIS AMARTHA: Pertemuan mingguan wajib bagi seluruh mitra (biasanya 15-20 orang). Di sini dilakukan transaksi pembayaran angsuran, menabung, dan materi edukasi. Kehadiran wajib untuk menjaga skor kredit dan tanggung renteng."
  },
  {
    id: "tanggung_renteng",
    keywords: ["tanggung renteng", "bayarin", "talang", "gantiin", "tanggung jawab"],
    content: "KONSEP TANGGUNG RENTENG: Sistem gotong royong dimana anggota kelompok saling menanggung beban jika ada satu anggota yang gagal bayar. Ini adalah kunci kedisiplinan dan kekompakan di Amartha."
  },
  {
    id: "celengan",
    keywords: ["celengan", "tabungan", "nabung", "simpan", "investasi"],
    content: "PRODUK CELENGAN: Fitur di aplikasi AmarthaFin untuk menabung dengan imbal hasil kompetitif (hingga 6% p.a., lebih tinggi dari bank). Bisa mulai dari Rp 10.000. Cocok untuk dana darurat atau tujuan khusus (misal: biaya sekolah)."
  },
  {
    id: "modal",
    keywords: ["modal", "pinjam", "utang", "plafond", "topup", "pengajuan"],
    content: "PRODUK MODAL KERJA: Pinjaman produktif untuk usaha mikro perempuan. Pencairan cepat (1 hari) setelah akad kredit. Plafond fleksibel sesuai kemampuan bayar dan A-Score."
  },
  {
    id: "amartha_link",
    keywords: ["amarthalink", "jualan pulsa", "token listrik", "tambah penghasilan", "agen"],
    content: "AMARTHALINK: Cara Ibu nambah penghasilan! Ibu bisa mendaftar jadi Agen AmarthaLink untuk jualan pulsa, paket data, token listrik, dan pembayaran air ke tetangga. Keuntungannya bisa dipakai bayar angsuran."
  },
  {
    id: "a_score",
    keywords: ["skor kredit", "a-score", "plafon naik", "pinjaman lebih besar", "naik kelas"],
    content: "A-SCORE AMARTHA: Ini adalah 'Nilai Rapor' kredit Ibu. Kalau Ibu rajin ikut Majelis, bayar tepat waktu, dan aktif pakai AmarthaFin, A-Score akan naik. A-Score tinggi artinya Ibu bisa dapat pinjaman modal yang lebih besar di siklus berikutnya."
  },
  {
    id: "poket",
    keywords: ["poket", "saldo", "dompet", "tarik tunai"],
    content: "POKET AMARTHA: Dompet digital aman di dalam aplikasi AmarthaFin. Uang pencairan modal masuk ke sini, dan bisa dipakai langsung untuk belanja stok atau bayar tagihan."
  },
  {
    id: "bp",
    keywords: ["bp", "petugas", "mas amartha", "mbak amartha", "pendamping"],
    content: "BUSINESS PARTNER (BP): Petugas lapangan Amartha yang mendampingi Mitra di setiap Majelis. Tugas mereka memfasilitasi pertemuan, mencatat transaksi, dan memberikan edukasi keuangan."
  }
];

// ==================================================================
// 📦 MOCK DATABASE
// ==================================================================
const userDatabase = {
  "628567881764": { // Testing Number
    name: "Ibu Marsinah",
    business_type: "Warung Sembako",
    location: "Sragen, Jawa Tengah",
    majelis_day: "Selasa",
    current_module: "Module 4: Scaling Up",
    literacy_score: "Medium"
  }
};

function getUserContext(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  // Default to Marsinah profile for demo purposes if number not found
  return userDatabase[cleanPhone] || {
    name: "Ibu Mitra",
    business_type: "Usaha Mikro",
    location: "Indonesia",
    majelis_day: "Kamis",
    current_module: "Welcome Phase",
    literacy_score: "Medium"
  };
}

// ==================================================================
// 🧠 AI LOGIC
// ==================================================================

// Helper for simple RAG (Retrieval)
function retrieveKnowledge(userText) {
  const lowerText = userText.toLowerCase();
  let foundKnowledge = [];

  amarthaKnowledge.forEach(item => {
    const match = item.keywords.some(keyword => lowerText.includes(keyword));
    if (match) {
      foundKnowledge.push(item.content);
    }
  });

  if (foundKnowledge.length === 0) return ""; 
  return foundKnowledge.join("\n\n");
}

async function getGeminiResponse(userText, senderPhone, imageBase64 = null) {
  try {
    const userProfile = getUserContext(senderPhone);
    
    // 1. Retrieve Knowledge (RAG)
    const ragContext = retrieveKnowledge(userText);
    
    console.log(`🧠 Processing for ${userProfile.name}: ${userText}`);
    console.log(`📚 Knowledge Injected: ${ragContext ? "Yes" : "No"}`);

    // ✨ DEBUG BYPASS
    const lowerText = userText.toLowerCase();
    if (lowerText === "cek data" || lowerText === "info profil" || lowerText === "debug") {
      return `🕵️ *DEBUG MODE: DATA PROFIL*\n\n` +
             `• Nama: ${userProfile.name}\n` +
             `• Usaha: ${userProfile.business_type}\n` +
             `• Lokasi: ${userProfile.location}\n` +
             `• Jadwal Majelis: ${userProfile.majelis_day}\n` +
             `• Modul Belajar: ${userProfile.current_module}\n` +
             `• Skor Literasi: ${userProfile.literacy_score}`;
    }

    // --- STANDARD GEMINI FLOW ---
    const systemPrompt = `
    PERAN: Anda adalah 'Akademi-AI', pelatih bisnis & pendamping digital untuk Mitra Amartha bernama ${userProfile.name}.
    
    CONTEXT USER:
    - Usaha: ${userProfile.business_type}
    - Lokasi: ${userProfile.location}
    - Jadwal Majelis: Hari ${userProfile.majelis_day} (PENTING!)
    
    KAMUS ISTILAH AMARTHA (WAJIB DIPAHAMI):
    ${ragContext}
    
    INSTRUKSI:
    1. Jawab dalam Bahasa Indonesia yang ramah, suportif, dan sederhana (seperti Ibu-ibu).
    2. Jika user bertanya tentang jadwal/kumpulan, ingatkan hari ${userProfile.majelis_day}.
    3. Selipkan promosi produk Amartha yang relevan (misal: "Simpan uang di Celengan" atau "Jadi agen AmarthaLink") jika sesuai konteks pertanyaan.
    4. Jawab ringkas (max 150 kata).
    5. Gunakan poin-poin (bullets) agar rapi.
    `;

    const promptParts = [];
    if (imageBase64) {
      promptParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
      promptParts.push(systemPrompt + "\n\nAnalisis gambar (Edukasi Bisnis): " + (userText || ""));
    } else {
      promptParts.push(systemPrompt + "\n\nUser (Edukasi Bisnis): " + userText);
    }

    const result = await model.generateContent(promptParts);
    
    if (!result || !result.response) {
      return "Maaf, pertanyaan ini tidak bisa saya jawab karena kebijakan keamanan.";
    }

    const text = result.response.text();
    if (!text || text.trim().length === 0) {
      if (result.response.promptFeedback && result.response.promptFeedback.blockReason) {
         return "Maaf, sistem mendeteksi topik sensitif. Bisa ditanyakan dengan cara lain?";
      }
      return FALLBACK_MESSAGE;
    }
    
    return text;
    
  } catch (error) {
    console.error('❌ Gemini Logic Error:', error.message);
    if (error.message && (error.message.includes("blocked") || error.message.includes("SAFETY"))) {
      return "Maaf, saya tidak bisa membahas topik ini karena batasan keamanan otomatis.";
    }
    return FALLBACK_MESSAGE;
  }
}

// ------------------------------------------------------------------
// 📤 OUTBOUND
// ------------------------------------------------------------------
async function sendMessage(to, text) {
  try {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      text = FALLBACK_MESSAGE;
    }
    
    if (text.length > 4000) text = text.substring(0, 3990) + '...';

    const formattedText = formatForWhatsApp(text);
    
    await axios.post(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: formattedText },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error('❌ Send Failed:', error.message);
  }
}

// ------------------------------------------------------------------
// 📥 INBOUND
// ------------------------------------------------------------------
app.get('/', (req, res) => res.status(200).send('🤖 Akademi-AI v1.7 (Amartha RAG) Online!'));

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === MY_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object) {
    const changes = body.entry?.[0]?.changes?.[0]?.value;
    if (changes?.messages?.[0]) {
      const message = changes.messages[0];
      const senderPhone = message.from;
      
      if (message.type === 'text') {
        const aiReply = await getGeminiResponse(message.text.body, senderPhone);
        await sendMessage(senderPhone, aiReply);
      } 
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

function formatForWhatsApp(text) {
  if (!text) return FALLBACK_MESSAGE;
  return text.replace(/\*\*(.*?)\*\*/g, '*$1*').replace(/^[\*\-]\s/gm, '• ');
}

app.listen(PORT, () => console.log(`🚀 Bot listening on ${PORT}`));