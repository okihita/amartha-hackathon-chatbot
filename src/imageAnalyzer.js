const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getUserContext } = require('./db');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WA_ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Model with vision capabilities
const visionModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: { 
    maxOutputTokens: 2000, 
    temperature: 0.3,
    responseMimeType: "application/json"
  }
});

async function analyzeImage(imageId, caption, senderPhone) {
  try {
    const userProfile = await getUserContext(senderPhone);
    
    // Check if user is registered
    if (!userProfile) {
      return "Maaf Bu, Anda belum terdaftar. Silakan daftar terlebih dahulu dengan memberikan Nama, Jenis Usaha, dan Lokasi.";
    }
    
    // Download image from WhatsApp
    const imageBuffer = await downloadWhatsAppImage(imageId);
    
    if (!imageBuffer) {
      return "Maaf Bu, gagal mengunduh gambar. Silakan coba lagi.";
    }
    
    // Prepare image for Gemini
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };
    
    // System prompt for image analysis
    const prompt = `
    PERAN: Akademi-AI, asisten bisnis untuk UMKM Amartha.
    USER: ${userProfile.name}, Usaha: ${userProfile.business_type}
    
    TUGAS: Analisis gambar ini dan tentukan apakah relevan dengan bisnis.
    
    KATEGORI GAMBAR RELEVAN:
    1. Buku Kas/Catatan Transaksi Harian (ledger, pembukuan)
    2. Stok Barang/Inventori (foto produk, stok gudang)
    3. Kondisi Toko/Warung (showcase, etalase, tempat usaha)
    4. Kondisi Bangunan Usaha (renovasi, perbaikan)
    5. Nota/Struk Pembelian (bukti transaksi)
    
    KATEGORI GAMBAR TIDAK RELEVAN:
    - Selfie/foto pribadi
    - Foto keluarga
    - Meme/gambar lucu
    - Screenshot chat
    - Foto makanan pribadi (bukan untuk dijual)
    - Foto liburan/wisata
    
    INSTRUKSI:
    1. Jika gambar RELEVAN dengan bisnis:
       - Berikan analisis singkat dan bermanfaat
       - Berikan saran praktis untuk bisnis
       - Gunakan bahasa Indonesia yang ramah
       
    2. Jika gambar TIDAK RELEVAN:
       - Tolak dengan sopan
       - Jelaskan jenis gambar apa yang bisa dibantu
       - Jangan analisis gambar yang tidak relevan
    
    Caption dari user: "${caption || 'tidak ada'}"
    
    Berikan respons dalam bahasa Indonesia yang ramah dan profesional.
    `;
    
    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    console.log(`✅ Image analyzed for ${senderPhone}`);
    return text;
    
  } catch (error) {
    console.error('Image analysis error:', error.message);
    return "Maaf Bu, terjadi kesalahan saat menganalisis gambar. Silakan coba lagi atau kirim pesan teks.";
  }
}

async function downloadWhatsAppImage(imageId) {
  try {
    // Step 1: Get image URL from WhatsApp API
    const mediaUrl = `https://graph.facebook.com/v18.0/${imageId}`;
    const urlResponse = await axios.get(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`
      }
    });
    
    const imageUrl = urlResponse.data.url;
    
    // Step 2: Download the actual image
    const imageResponse = await axios.get(imageUrl, {
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`
      },
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(imageResponse.data);
    
  } catch (error) {
    console.error('Error downloading WhatsApp image:', error.message);
    return null;
  }
}

module.exports = { analyzeImage };
