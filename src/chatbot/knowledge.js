// 📚 UMKM KNOWLEDGE BASE (RAG)
const { Firestore } = require('@google-cloud/firestore');
const { COLLECTIONS } = require('../config/constants');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

const umkmKnowledge = [
  {
    id: "majelis",
    keywords: ["majelis", "kumpulan", "pertemuan", "kelompok", "hari apa"],
    content: "MAJELIS: Pertemuan mingguan wajib bagi seluruh mitra (biasanya 15-20 orang). Di sini dilakukan transaksi pembayaran angsuran, menabung, dan materi edukasi. Kehadiran wajib untuk menjaga skor kredit dan tanggung renteng."
  },
  {
    id: "tanggung_renteng",
    keywords: ["tanggung renteng", "bayarin", "talang", "gantiin", "tanggung jawab"],
    content: "TANGGUNG RENTENG: Sistem gotong royong dimana anggota kelompok saling menanggung beban jika ada satu anggota yang gagal bayar. Ini adalah kunci kedisiplinan dan kekompakan kelompok."
  },
  {
    id: "tabungan",
    keywords: ["tabungan", "nabung", "simpan", "investasi", "celengan"],
    content: "TABUNGAN USAHA: Fitur untuk menabung dengan imbal hasil kompetitif. Bisa mulai dari nominal kecil. Cocok untuk dana darurat atau tujuan khusus (misal: biaya sekolah, modal tambahan)."
  },
  {
    id: "modal",
    keywords: ["modal", "pinjam", "utang", "plafond", "topup", "pengajuan"],
    content: "MODAL KERJA: Pinjaman produktif untuk usaha mikro. Pencairan cepat setelah akad kredit. Plafond fleksibel sesuai kemampuan bayar dan skor kredit."
  },
  {
    id: "layanan_digital",
    keywords: ["jualan pulsa", "token listrik", "tambah penghasilan", "agen", "ppob"],
    content: "LAYANAN DIGITAL: Layanan tambahan untuk menambah penghasilan UMKM seperti jual pulsa, paket data, token listrik, dan pembayaran tagihan."
  },
  {
    id: "skor_kredit",
    keywords: ["skor kredit", "a-score", "plafon naik", "pinjaman lebih besar", "naik kelas"],
    content: "SKOR KREDIT UMKM: Ini adalah 'Nilai Rapor' kredit Anda. Rajin ikut pertemuan, bayar tepat waktu, dan aktif menggunakan layanan akan meningkatkan skor. Skor tinggi berarti Anda bisa dapat pinjaman modal yang lebih besar."
  },
  {
    id: "dompet_digital",
    keywords: ["dompet", "saldo", "wallet", "tarik tunai"],
    content: "DOMPET DIGITAL: Dompet digital aman untuk menerima pencairan modal dan melakukan transaksi. Bisa dipakai langsung untuk belanja stok atau bayar tagihan."
  },
  {
    id: "petugas_lapangan",
    keywords: ["bp", "petugas", "pendamping", "field agent"],
    content: "PETUGAS LAPANGAN: Pendamping yang memfasilitasi pertemuan, mencatat transaksi, dan memberikan edukasi keuangan kepada mitra."
  }
];

// Helper to retrieve relevant knowledge based on keywords
async function retrieveKnowledge(userText) {
  const lowerText = userText.toLowerCase();
  let foundKnowledge = [];

  // Check static knowledge base
  umkmKnowledge.forEach(item => {
    const match = item.keywords.some(keyword => lowerText.includes(keyword));
    if (match) {
      foundKnowledge.push(item.content);
    }
  });

  // Check Firestore financial literacy modules
  try {
    const snapshot = await db.collection(COLLECTIONS.FINANCIAL_LITERACY).get();

    snapshot.forEach(doc => {
      const module = doc.data();

      // Check if keywords match
      const keywordMatch = module.keywords?.some(keyword =>
        lowerText.includes(keyword.toLowerCase())
      );

      // Check if module name or description matches
      const titleMatch = module.module_name?.toLowerCase().includes(lowerText) ||
        module.description?.toLowerCase().includes(lowerText);

      if (keywordMatch || titleMatch) {
        // Build knowledge snippet from module
        let snippet = `📚 ${module.module_name}:\n${module.description || ''}`;

        // Add key points from lessons
        if (module.lessons?.length > 0) {
          const keyPoints = module.lessons
            .flatMap(lesson => lesson.key_points || [])
            .slice(0, 3); // Limit to 3 key points

          if (keyPoints.length > 0) {
            snippet += '\n\nPoin Penting:\n' + keyPoints.map(p => `• ${p}`).join('\n');
          }
        }

        foundKnowledge.push(snippet);
      }
    });
  } catch (error) {
    console.error('Error retrieving financial literacy knowledge:', error);
  }

  if (foundKnowledge.length === 0) return "";
  return foundKnowledge.join("\n\n");
}

// Get business KPIs for user's category and maturity level
async function getBusinessKPIs(categoryId, maturityLevel = 1) {
  if (!categoryId) return null;

  try {
    // Direct document lookup by category_id
    const doc = await db.collection('business_classifications').doc(categoryId).get();

    if (!doc.exists) return null;

    const data = doc.data();
    const currentLevel = data.maturity_levels?.find(l => l.level === maturityLevel);
    if (!currentLevel?.roadmap) return null;

    return {
      business_type: data.business_type,
      current_level: maturityLevel,
      next_level: maturityLevel + 1,
      goal: currentLevel.roadmap.description,
      kpis: currentLevel.roadmap.kpis || [],
      swot: currentLevel.swot,
      character: currentLevel.character
    };
  } catch (error) {
    console.error('Error fetching business KPIs:', error);
    return null;
  }
}

module.exports = { retrieveKnowledge, getBusinessKPIs };