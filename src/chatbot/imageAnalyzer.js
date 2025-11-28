const { GoogleGenerativeAI } = require("@google/generative-ai");
const UserService = require('../services/UserService');
const axios = require('axios');
const { GRAPH_API_VERSION } = require('./whatsapp');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WA_ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Model with vision capabilities for structured data extraction
const visionModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: { 
    maxOutputTokens: 3000, 
    temperature: 0.2,
    responseMimeType: "application/json"
  }
});

async function analyzeImage(imageId, caption, senderPhone) {
  try {
    const userProfile = await UserService.getUser(senderPhone);
    
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
    
    // Step 1: Extract structured business intelligence data
    const structuredData = await extractBusinessIntelligence(imagePart, userProfile, caption);
    
    // Step 2: Save to database if relevant
    if (structuredData.is_relevant && structuredData.category !== 'irrelevant') {
      // Determine type from category
      const typeMap = {
        'building': 'building',
        'inventory': 'inventory',
        'financial_record': 'ledger'
      };
      
      const biData = {
        type: typeMap[structuredData.category] || 'general',
        category: structuredData.category,
        extracted: structuredData.extracted_data,
        credit_metrics: structuredData.credit_metrics,
        insights: structuredData.insights,
        recommendations: structuredData.recommendations,
        confidence: structuredData.confidence
      };
      
      // Store image URL for building/inventory, null for financial records
      const shouldStoreImage = ['building', 'inventory'].includes(structuredData.category);
      const imageUrl = shouldStoreImage ? `https://graph.facebook.com/${GRAPH_API_VERSION}/${imageId}` : null;
      
      await UserService.createBusinessIntelligence(senderPhone, biData, imageUrl, caption);
    }
    
    // Step 3: Generate user-friendly response
    const userResponse = await generateUserResponse(structuredData, userProfile);
    
    return userResponse;
    
  } catch (error) {
    console.error('Image analysis error:', error.message);
    return "Maaf Bu, terjadi kesalahan saat menganalisis gambar. Silakan coba lagi atau kirim pesan teks.";
  }
}

async function extractBusinessIntelligence(imagePart, userProfile, caption) {
  const prompt = `
  PERAN: AI Analyst untuk Credit Scoring UMKM Amartha
  USER: ${userProfile.name}, Usaha: ${userProfile.business?.name || 'Belum diisi'}, Lokasi: ${userProfile.business?.location || 'Belum diisi'}
  Caption: "${caption || 'tidak ada'}"
  
  TUGAS: Ekstrak data terstruktur dari gambar untuk analisis kredit dan prediksi cashflow.
  
  KATEGORI & DATA YANG HARUS DIEKSTRAK:
  
  1. BUILDING (Kondisi Bangunan/Toko):
     - building_type: "warung" | "toko" | "kios" | "rumah_produksi" | "lainnya"
     - condition: "sangat_baik" | "baik" | "cukup" | "perlu_perbaikan"
     - size_estimate: "kecil" | "sedang" | "besar" (dalam m2 jika terlihat)
     - location_type: "pinggir_jalan" | "dalam_gang" | "pasar" | "perumahan"
     - visibility: "sangat_terlihat" | "cukup_terlihat" | "kurang_terlihat"
     - estimated_value: number (estimasi nilai aset dalam Rupiah)
     - strategic_score: 1-10 (skor lokasi strategis)
  
  2. INVENTORY (Stok Barang):
     - items: [{name, quantity_estimate, unit, condition, estimated_price}]
     - total_items_count: number
     - inventory_value_estimate: number (total nilai stok dalam Rupiah)
     - stock_level: "penuh" | "cukup" | "menipis" | "kosong"
     - variety_score: 1-10 (keragaman produk)
     - turnover_indicator: "cepat" | "sedang" | "lambat"
  
  3. FINANCIAL_RECORD (Buku Kas/Nota):
     - record_type: "buku_kas" | "nota_pembelian" | "nota_penjualan" | "struk"
     - date: string (tanggal transaksi jika terlihat)
     - transactions: [{date, description, amount, type: "income"|"expense"}]
     - daily_income_estimate: number
     - daily_expense_estimate: number
     - daily_profit_estimate: number
     - monthly_cashflow_estimate: number
     - record_quality: "rapi" | "cukup_rapi" | "kurang_rapi"
     - literacy_indicator: 1-10 (kemampuan pembukuan)
  
  4. IRRELEVANT (Tidak Relevan):
     - reason: string (alasan tidak relevan)
  
  CREDIT SCORING METRICS (untuk semua kategori relevan):
  - business_health_score: 1-100 (kesehatan bisnis)
  - asset_score: 1-100 (nilai aset)
  - cashflow_score: 1-100 (prediksi cashflow)
  - management_score: 1-100 (kemampuan manajemen)
  - growth_potential: 1-100 (potensi pertumbuhan)
  - risk_level: "rendah" | "sedang" | "tinggi"
  - recommended_loan_amount: number (rekomendasi pinjaman dalam Rupiah)
  
  OUTPUT FORMAT (JSON):
  {
    "is_relevant": boolean,
    "category": "building" | "inventory" | "financial_record" | "irrelevant",
    "confidence": 0-1,
    "extracted_data": {
      // Data sesuai kategori di atas
    },
    "credit_metrics": {
      "business_health_score": number,
      "asset_score": number,
      "cashflow_score": number,
      "management_score": number,
      "growth_potential": number,
      "risk_level": string,
      "recommended_loan_amount": number
    },
    "insights": [
      "Insight 1 dalam bahasa Indonesia",
      "Insight 2 dalam bahasa Indonesia"
    ],
    "recommendations": [
      "Rekomendasi 1 untuk meningkatkan bisnis",
      "Rekomendasi 2 untuk meningkatkan bisnis"
    ]
  }
  
  INSTRUKSI:
  - Jika gambar TIDAK RELEVAN (selfie, foto pribadi, meme), set is_relevant: false
  - Berikan estimasi konservatif untuk nilai finansial
  - Gunakan konteks bisnis user (${userProfile.business?.name || 'UMKM'}) untuk analisis
  - Berikan credit metrics yang realistis berdasarkan visual evidence
  - Insights dan recommendations dalam bahasa Indonesia yang praktis
  `;
  
  try {
    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response;
    const jsonText = response.text();
    
    // Parse JSON response
    const data = JSON.parse(jsonText);
    
    // Add metadata
    data.analyzed_at = new Date().toISOString();
    data.user_business_name = userProfile.business?.name || null;
    data.user_business_location = userProfile.business?.location || null;
    
    return data;
  } catch (error) {
    console.error('Error extracting business intelligence:', error.message);
    // Return default structure if parsing fails
    return {
      is_relevant: false,
      category: 'irrelevant',
      confidence: 0,
      extracted_data: {},
      credit_metrics: {},
      insights: [],
      recommendations: [],
      error: error.message
    };
  }
}

async function generateUserResponse(structuredData, userProfile) {
  // If not relevant, return polite rejection
  if (!structuredData.is_relevant || structuredData.category === 'irrelevant') {
    return `❌ *Gambar Tidak Disimpan*

Maaf Bu ${userProfile.name}, gambar ini sepertinya bukan foto bisnis. �

Saya bisa membantu menganalisis:
� Fotoo toko/warung Ibu
📦 Foto stok barang/inventori
📒 Foto buku kas atau nota

Silakan kirim foto bisnis Ibu untuk analisis yang lebih bermanfaat!`;
  }
  
  // Generate friendly response based on category
  const categoryLabels = {
    building: '🏪 Kondisi Toko/Warung',
    inventory: '📦 Stok Barang',
    financial_record: '📒 Catatan Keuangan'
  };
  
  const categoryLabel = categoryLabels[structuredData.category] || '📊 Analisis Bisnis';
  
  // Determine if image was stored
  const isImageStored = ['building', 'inventory'].includes(structuredData.category);
  const storageStatus = isImageStored 
    ? '✅ *Foto disimpan di profil bisnis Ibu*' 
    : '📊 *Data keuangan dianalisis (foto tidak disimpan)*';
  
  let response = `✅ *${categoryLabel} - Teranalisis!*\n`;
  response += `${storageStatus}\n\n`;
  response += `👤 ${userProfile.name} (${userProfile.business?.name || 'UMKM'})\n\n`;
  
  // Add insights
  if (structuredData.insights && structuredData.insights.length > 0) {
    response += `💡 *Hasil Analisis:*\n`;
    structuredData.insights.forEach((insight, i) => {
      response += `${i + 1}. ${insight}\n`;
    });
    response += `\n`;
  }
  
  // Add credit score summary (simplified for user)
  if (structuredData.credit_metrics) {
    const metrics = structuredData.credit_metrics;
    if (metrics.business_health_score) {
      response += `📊 *Skor Kesehatan Bisnis:* ${metrics.business_health_score}/100\n`;
    }
    if (metrics.recommended_loan_amount && metrics.recommended_loan_amount > 0) {
      const formattedAmount = new Intl.NumberFormat('id-ID').format(metrics.recommended_loan_amount);
      response += `💰 *Estimasi Kelayakan Pinjaman:* Rp ${formattedAmount}\n`;
    }
    response += `\n`;
  }
  
  // Add recommendations
  if (structuredData.recommendations && structuredData.recommendations.length > 0) {
    response += `✨ *Saran untuk Ibu:*\n`;
    structuredData.recommendations.forEach((rec, i) => {
      response += `${i + 1}. ${rec}\n`;
    });
    response += `\n`;
  }
  
  // Add storage info
  if (isImageStored) {
    response += `📸 *Foto Ibu sudah tersimpan!*\n`;
    response += `Petugas lapangan bisa melihat foto ini di dashboard.\n\n`;
  } else {
    response += `📊 *Data keuangan Ibu sudah dianalisis!*\n`;
    response += `Informasi ini membantu perhitungan kredit Ibu.\n\n`;
  }
  
  response += `📸 Kirim foto bisnis lainnya untuk analisis lebih lengkap!`;
  
  return response;
}

async function downloadWhatsAppImage(imageId) {
  try {
    // Step 1: Get image URL from WhatsApp API
    const mediaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${imageId}`;
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
