// 📚 AMARTHA KNOWLEDGE BASE (RAG)
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

// Helper to retrieve relevant knowledge based on keywords
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

module.exports = { retrieveKnowledge };