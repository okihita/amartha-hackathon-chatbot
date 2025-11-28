const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 8080;

// 🔑 CONFIGURATION
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  generationConfig: {
    maxOutputTokens: 600, 
    temperature: 0.7,
  },
  // 🇮🇩 CHANGED: System Instruction now enforces Bahasa Indonesia
  systemInstruction: `Anda adalah asisten WhatsApp yang membantu dan ringkas.
  - BAHASA: Gunakan SELALU Bahasa Indonesia untuk semua respons (teks dan analisis gambar).
  - Format: Gunakan format ramah WhatsApp.
  - Gunakan satu bintang (*) untuk menebalkan teks (contoh: *tebal*). 
  - Gunakan bullet (•) untuk daftar. 
  - Jika ada gambar, analisis isinya dalam Bahasa Indonesia.
  - Maksimal panjang: 300 kata.`
});

app.use(bodyParser.json());

// ------------------------------------------------------------------
// 🧠 AI LOGIC: Ask Gemini (Text OR Image)
// ------------------------------------------------------------------
async function getGeminiResponse(userText, imageBase64 = null) {
  try {
    const promptParts = [];
    
    // 1. Add Image if present
    if (imageBase64) {
      promptParts.push({
        inlineData: { mimeType: "image/jpeg", data: imageBase64 }
      });
      promptParts.push("Analisis gambar ini dalam Bahasa Indonesia. " + (userText || ""));
    } else {
      // 2. Or just text
      promptParts.push(userText);
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    if (error.message.includes('429')) {
      return "Saya sedang sibuk (Error 429). Coba lagi dalam 1 menit.";
    }
    return "Maaf, otak AI saya sedang offline.";
  }
}

// ------------------------------------------------------------------
// 📥 HELPER: Download Image from WhatsApp
// ------------------------------------------------------------------
async function downloadMedia(mediaId) {
  try {
    const urlRes = await axios.get(
      `https://graph.facebook.com/v24.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
    
    const fileRes = await axios.get(urlRes.data.url, {
      responseType: 'arraybuffer', 
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });

    return Buffer.from(fileRes.data).toString('base64');
  } catch (error) {
    console.error('❌ Media Download Failed:', error.message);
    return null;
  }
}

// ------------------------------------------------------------------
// 📤 OUTBOUND: Send Message
// ------------------------------------------------------------------
async function sendMessage(to, text) {
  try {
    if (text.length > 4000) text = text.substring(0, 4000) + '... [Terpotong]';

    await axios.post(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: formatForWhatsApp(text) },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error('❌ Send Failed:', error.response ? error.response.data : error.message);
  }
}

// ------------------------------------------------------------------
// 📥 INBOUND: Webhook
// ------------------------------------------------------------------
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
      
      // --- CASE A: IMAGE ---
      if (message.type === 'image') {
        console.log(`📸 Image received from ${senderPhone}`);
        const imageId = message.image.id;
        const caption = message.image.caption || "";

        const base64 = await downloadMedia(imageId);
        if (base64) {
          const aiReply = await getGeminiResponse(caption, base64);
          await sendMessage(senderPhone, aiReply);
        }
      } 
      // --- CASE B: TEXT ---
      else if (message.type === 'text') {
        const incomingText = message.text.body;
        console.log(`📝 Text from ${senderPhone}: ${incomingText}`);
        const aiReply = await getGeminiResponse(incomingText);
        await sendMessage(senderPhone, aiReply);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => console.log(`🚀 Vision Bot listening on ${PORT}`));

// ------------------------------------------------------------------
// 🧹 HELPER: Formatting
// ------------------------------------------------------------------
function formatForWhatsApp(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/__(.*?)__/g, '_$1_')
    .replace(/^#{1,6}\s+(.*)$/gm, '*$1*')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^[\*\-]\s/gm, '• ');
}