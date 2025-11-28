import { h } from 'preact';

export default function HowItWorks() {
  const diagramStyle = {
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    background: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    overflowX: 'auto',
    whiteSpace: 'pre'
  };

  const cardStyle = (bg, border) => ({
    padding: '12px',
    background: bg,
    borderRadius: '8px',
    borderLeft: `4px solid ${border}`
  });

  return (
    <div style="padding: 20px;">
      <div class="card" style="margin-bottom: 20px;">
        <h1 style="margin: 0 0 8px 0;">🤖 Cara Kerja Chatbot Amartha</h1>
        <p style="color: #666; margin: 0;">Panduan lengkap alur percakapan untuk Petugas Lapangan (BP)</p>
      </div>

      {/* Command Triggers - Move to top for quick reference */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>⌨️ Kata Kunci Perintah (Quick Reference)</h2>
        <p style="color: #666; margin-bottom: 16px;">Kata-kata yang bisa diketik anggota untuk memicu fitur. Case-insensitive.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div style={cardStyle('#e3f2fd', '#2196f3')}>
            <strong>📋 MENU / BANTUAN</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">
              menu, bantuan, help, tolong, bantu, apa saja, bisa apa, halo, hi, hai
            </p>
          </div>
          <div style={cardStyle('#e8f5e9', '#4caf50')}>
            <strong>📚 MULAI KUIS</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">
              kuis, quiz, belajar, tes, ujian, soal, mulai kuis
            </p>
          </div>
          <div style={cardStyle('#fff3e0', '#ff9800')}>
            <strong>📊 LIHAT NILAI</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">
              nilai, hasil, skor, progress, hasil kuis, nilai saya
            </p>
          </div>
          <div style={cardStyle('#f3e5f5', '#9c27b0')}>
            <strong>👤 CEK DATA PROFIL</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">
              cek data, data saya, profil, info saya, debug, data, cek profil, lihat data
            </p>
          </div>
          <div style={cardStyle('#e0f7fa', '#00bcd4')}>
            <strong>📅 JADWAL MAJELIS</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">
              jadwal, majelis, pertemuan, kapan ketemu, ketemu kapan, kumpul
            </p>
          </div>
          <div style={cardStyle('#fce4ec', '#e91e63')}>
            <strong>📸 KIRIM FOTO</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">
              Langsung kirim gambar (dengan/tanpa caption)
            </p>
          </div>
        </div>
      </div>

      {/* Registration Flow */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>1️⃣ Pendaftaran Anggota Baru</h2>
        <p style="color: #666; margin-bottom: 16px;">Ketika pengguna baru (nomor belum terdaftar) menghubungi chatbot</p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │   IBU MENGIRIM  │
    │   PESAN PERTAMA │
    │   (nomor baru)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  CHATBOT TANYA: │
    │  "Siapa nama    │
    │   Ibu, usaha    │
    │   apa, dimana?" │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  IBU JAWAB:     │
    │  "Saya Bu Siti, │
    │   warung sembako│
    │   di Bogor"     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  AI EKSTRAK:    │
    │  • name         │
    │  • business_name│
    │  • location     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  ✅ TERDAFTAR   │
    │  Status: PENDING│
    │                 │
    │  "Menunggu      │
    │   verifikasi BP"│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  BP VERIFIKASI  │
    │  DI DASHBOARD   │
    │  (klik Verify)  │
    │       ↓         │
    │  Status: ACTIVE │
    └─────────────────┘
`}</div>
        <div style="margin-top: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px;">
          <strong>📝 Data yang disimpan:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>phone (dari WhatsApp)</li>
            <li>name, business.name, business.location</li>
            <li>status: 'pending'</li>
            <li>is_mock: false</li>
            <li>created_at, updated_at</li>
          </ul>
        </div>
      </div>

      {/* Quiz Flow */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>2️⃣ Kuis Literasi Keuangan</h2>
        <p style="color: #666; margin-bottom: 16px;">15 minggu pembelajaran dengan kuis interaktif. Nilai lulus: <strong>100% (4/4 benar)</strong></p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │  IBU KETIK:     │
    │  "kuis" / "quiz"│
    │  "belajar"      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  SISTEM CEK:    │
    │  Minggu berapa  │
    │  yang belum     │
    │  lulus (< 100%)?│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  KIRIM INTRO:   │
    │  "Quiz Minggu X │
    │   dimulai!      │
    │   Topik: ..."   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  KIRIM SOAL 1/4 │
    │  (List Message) │
    │                 │
    │  ┌───────────┐  │
    │  │ A. xxx    │  │
    │  │ B. xxx    │  │
    │  │ C. xxx    │  │
    │  │ D. xxx    │  │
    │  └───────────┘  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  IBU PILIH      │
    │  JAWABAN        │
    │       │         │
    │   ┌───┴───┐     │
    │   ▼       ▼     │
    │  ✅      ❌     │
    │ Benar  Salah    │
    │ +25%  +0% +     │
    │       penjelasan│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  ULANGI 4x      │
    │  (4 soal acak)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  SETELAH 4 SOAL │
    │                 │
    │  Nilai = 100%?  │
    │  ┌───┴───┐      │
    │  ▼       ▼      │
    │ YA      TIDAK   │
    │ LULUS   ULANG   │
    │ minggu  minggu  │
    │ ini     ini     │
    └─────────────────┘
`}</div>
        <div style="margin-top: 16px; padding: 12px; background: #fff3e0; border-radius: 8px;">
          <strong>⚙️ Mekanisme Quiz:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>4 soal dipilih acak dari bank_soal minggu tersebut</li>
            <li>Setiap jawaban benar = 25%</li>
            <li>Lulus jika 100% (4/4 benar)</li>
            <li>Jawaban salah → tampilkan penjelasan</li>
            <li>Progress disimpan di users/{'{phone}'}/literacy/data</li>
          </ul>
        </div>
      </div>

      {/* Image Analysis Flow */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>3️⃣ Analisis Foto Bisnis (Business Intelligence)</h2>
        <p style="color: #666; margin-bottom: 16px;">AI menganalisis foto untuk penilaian kredit. Dashboard update real-time via SSE.</p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │  IBU KIRIM FOTO │
    │  📸             │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  ADA CAPTION?   │
    │   ┌───┴───┐     │
    │   ▼       ▼     │
    │  YA     TIDAK   │
    └───┬───────┬─────┘
        │       │
        │       ▼
        │  ┌─────────────┐
        │  │ CHATBOT:    │
        │  │ "Jelaskan   │
        │  │  foto ini   │
        │  │  ya Bu..."  │
        │  └──────┬──────┘
        │         │
        │         ▼
        │  ┌─────────────┐
        │  │ IBU BALAS:  │
        │  │ "Ini warung │
        │  │  saya"      │
        │  │ (5 menit)   │
        │  └──────┬──────┘
        │         │
        └────┬────┘
             │
             ▼
    ┌─────────────────┐
    │  DOWNLOAD FOTO  │
    │  dari WhatsApp  │
    │  (base64)       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  GEMINI VISION  │
    │  ANALISIS:      │
    │                 │
    │  Klasifikasi:   │
    │  • ledger       │
    │  • inventory    │
    │  • building     │
    │  • transaction  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  EKSTRAK DATA   │
    │  sesuai tipe    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  SIMPAN KE      │
    │  Firestore +    │
    │  EMIT SSE EVENT │
    └────────┬────────┘
             │
        ┌────┴────┐
        ▼         ▼
    ┌───────┐ ┌───────────┐
    │KIRIM  │ │ DASHBOARD │
    │HASIL  │ │ UPDATE    │
    │KE IBU │ │ REAL-TIME │
    │       │ │ ✨ BLINK  │
    └───────┘ └───────────┘
`}</div>
        <div style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <div style="padding: 12px; background: #e3f2fd; border-radius: 8px;">
            <strong>📒 Ledger</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px;">Buku kas, nota pembelian/penjualan. Ekstrak: income, expense, profit estimate</p>
          </div>
          <div style="padding: 12px; background: #e8f5e9; border-radius: 8px;">
            <strong>📦 Inventory</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px;">Stok barang. Ekstrak: items, quantity, value estimate</p>
          </div>
          <div style="padding: 12px; background: #fff3e0; border-radius: 8px;">
            <strong>🏪 Building</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px;">Tempat usaha. Ekstrak: type, condition, size, location</p>
          </div>
          <div style="padding: 12px; background: #f3e5f5; border-radius: 8px;">
            <strong>🧾 Transaction</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px;">Bukti transaksi. Ekstrak: amount, date, parties</p>
          </div>
        </div>
      </div>

      {/* Menu Command */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>4️⃣ Menu Utama</h2>
        <p style="color: #666; margin-bottom: 16px;">Ketik "menu", "halo", "bantuan" untuk melihat daftar fitur</p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │  IBU KETIK:     │
    │  "halo" / "menu"│
    │  "bantuan"      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  📋 *Menu Utama*        │
    │                         │
    │  Ketik angka atau kata: │
    │                         │
    │  1️⃣ *KUIS* - Mulai kuis │
    │  2️⃣ *NILAI* - Hasil     │
    │  3️⃣ *DATA SAYA* - Profil│
    │  4️⃣ *FOTO* - Kirim foto │
    │  5️⃣ *JADWAL* - Majelis  │
    │                         │
    │  Atau langsung tanya    │
    │  soal usaha! 😊         │
    └─────────────────────────┘
`}</div>
      </div>

      {/* Debug Command */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>5️⃣ Cek Data Profil</h2>
        <p style="color: #666; margin-bottom: 16px;">Anggota bisa cek semua data mereka sendiri</p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │  IBU KETIK:     │
    │  "cek data"     │
    │  "data saya"    │
    │  "profil"       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  ✅ *PROFIL ANDA*       │
    │                         │
    │  👤 Nama: Bu Siti       │
    │  📱 No. HP: 628xxx      │
    │  🏪 Usaha: Warung       │
    │  📍 Lokasi: Bogor       │
    │  ⭐ Tingkat: 1/5        │
    │  👥 Majelis: Sejahtera  │
    │  ✅ Status: Terverifikasi│
    │                         │
    │  💰 *INFORMASI PINJAMAN*│
    │  • Limit: Rp 5.000.000  │
    │  • Sisa: Rp 3.000.000   │
    │  • Hutang: Rp 2.000.000 │
    │  • Cicilan: 15 Des 2024 │
    │                         │
    │  📚 *LITERASI KEUANGAN* │
    │  • Progress: 5/15 (33%) │
    │  • Status: Sedang       │
    └─────────────────────────┘
`}</div>
      </div>

      {/* Jadwal Command */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>6️⃣ Jadwal Majelis</h2>
        <p style="color: #666; margin-bottom: 16px;">Cek jadwal pertemuan majelis</p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │  IBU KETIK:     │
    │  "jadwal"       │
    │  "majelis"      │
    │  "pertemuan"    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  📅 *Jadwal Majelis*    │
    │                         │
    │  👥 Majelis: Sejahtera  │
    │  📆 Hari: Senin         │
    │  🕐 Jam: 09:00          │
    │  📍 Lokasi: Balai Desa  │
    │                         │
    │  Jangan lupa hadir! 😊  │
    └─────────────────────────┘

    ⚠️ Jika belum terdaftar di Majelis:
    "Hubungi petugas lapangan untuk
     didaftarkan ke Majelis ya."
`}</div>
      </div>

      {/* Progress Command */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>7️⃣ Lihat Progress Kuis</h2>
        <p style="color: #666; margin-bottom: 16px;">Cek hasil belajar literasi keuangan</p>
        <div style={diagramStyle}>{`
    ┌─────────────────┐
    │  IBU KETIK:     │
    │  "nilai"        │
    │  "progress"     │
    │  "hasil"        │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  📊 Progress Literasi   │
    │                         │
    │  ✅ Selesai: 5/15 (33%) │
    │                         │
    │  🎯 Minggu yang Lulus:  │
    │  • Minggu 1: 100%       │
    │  • Minggu 2: 100%       │
    │  • Minggu 3: 100%       │
    │  • Minggu 4: 100%       │
    │  • Minggu 5: 100%       │
    │                         │
    │  💡 Ketik "quiz" untuk  │
    │     melanjutkan!        │
    └─────────────────────────┘
`}</div>
      </div>

      {/* Status Legend */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>📋 Keterangan Status User</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
          <div style="padding: 12px; background: #fff3cd; border-radius: 8px;">
            <strong>🟡 PENDING</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">Baru daftar, menunggu verifikasi BP di dashboard</p>
          </div>
          <div style="padding: 12px; background: #d4edda; border-radius: 8px;">
            <strong>🟢 ACTIVE</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">Sudah diverifikasi, bisa akses semua fitur chatbot</p>
          </div>
          <div style="padding: 12px; background: #f8d7da; border-radius: 8px;">
            <strong>🔴 SUSPENDED</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">Akun dinonaktifkan sementara oleh BP</p>
          </div>
          <div style="padding: 12px; background: #e2e3e5; border-radius: 8px;">
            <strong>⚫ INACTIVE</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">Akun tidak aktif / keluar dari program</p>
          </div>
        </div>
      </div>

      {/* Tech Info */}
      <div class="card">
        <h2>🔧 Informasi Teknis</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <strong>AI Engine</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px;">Gemini 2.5 Flash (text), Gemini 2.0 Flash (vision)</p>
          </div>
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <strong>Database</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px;">Google Cloud Firestore (NoSQL)</p>
          </div>
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <strong>Real-time Updates</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px;">Server-Sent Events (SSE) untuk dashboard</p>
          </div>
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <strong>Image Storage</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px;">Base64 data URL di Firestore</p>
          </div>
        </div>
      </div>
    </div>
  );
}
