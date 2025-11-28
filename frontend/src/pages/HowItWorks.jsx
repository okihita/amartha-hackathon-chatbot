import { h } from 'preact';
import { Bot, User, Menu, BookOpen, BarChart3, UserCircle, Calendar, Camera, Check, X, Cog, Smartphone, Monitor, FileText, Package, Store, Receipt } from 'lucide-preact';

// Styled flow components
const FlowBox = ({ children, type = 'default', style = {} }) => {
  const colors = {
    default: { bg: '#f8f9fa', border: '#dee2e6' },
    start: { bg: '#e3f2fd', border: '#2196f3' },
    action: { bg: '#fff3e0', border: '#ff9800' },
    decision: { bg: '#fce4ec', border: '#e91e63' },
    success: { bg: '#e8f5e9', border: '#4caf50' },
    end: { bg: '#f3e5f5', border: '#9c27b0' },
    user: { bg: '#e0f7fa', border: '#00bcd4' },
    bot: { bg: '#fff8e1', border: '#ffc107' }
  };
  const c = colors[type] || colors.default;
  return (
    <div style={{
      padding: '12px 16px',
      background: c.bg,
      border: `2px solid ${c.border}`,
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '13px',
      lineHeight: '1.4',
      ...style
    }}>{children}</div>
  );
};

const Arrow = ({ direction = 'down' }) => (
  <div style={{ textAlign: 'center', padding: '4px 0', color: '#666', fontSize: '20px' }}>
    {direction === 'down' ? '↓' : direction === 'right' ? '→' : '↓'}
  </div>
);

const FlowContainer = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '16px 0' }}>
    {children}
  </div>
);

const SplitFlow = ({ left, right }) => (
  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>{left}</div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>{right}</div>
  </div>
);

export default function HowItWorks() {
  const cardStyle = (bg, border) => ({
    padding: '12px',
    background: bg,
    borderRadius: '8px',
    borderLeft: `4px solid ${border}`
  });

  return (
    <div style="padding: 20px;">
      <div class="card" style="margin-bottom: 20px;">
        <h1 style="margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;"><Bot size={28} /> Cara Kerja Chatbot Amartha</h1>
        <p style="color: #666; margin: 0;">Panduan lengkap alur percakapan untuk Petugas Lapangan (BP)</p>
      </div>

      {/* Command Triggers */}
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="display: flex; align-items: center; gap: 8px;"><Menu size={18} /> Kata Kunci Perintah</h2>
        <p style="color: #666; margin-bottom: 16px;">Kata-kata yang bisa diketik anggota (case-insensitive)</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <div style={cardStyle('#e3f2fd', '#2196f3')}>
            <strong style="display: flex; align-items: center; gap: 4px;"><Menu size={14} /> MENU</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">menu, bantuan, help, tolong, halo, hi, hai</p>
          </div>
          <div style={cardStyle('#e8f5e9', '#4caf50')}>
            <strong style="display: flex; align-items: center; gap: 4px;"><BookOpen size={14} /> KUIS</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">kuis, quiz, belajar, tes, ujian, soal</p>
          </div>
          <div style={cardStyle('#fff3e0', '#ff9800')}>
            <strong style="display: flex; align-items: center; gap: 4px;"><BarChart3 size={14} /> NILAI</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">nilai, hasil, skor, progress</p>
          </div>
          <div style={cardStyle('#f3e5f5', '#9c27b0')}>
            <strong style="display: flex; align-items: center; gap: 4px;"><UserCircle size={14} /> PROFIL</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">cek data, data saya, profil, info saya</p>
          </div>
          <div style={cardStyle('#e0f7fa', '#00bcd4')}>
            <strong style="display: flex; align-items: center; gap: 4px;"><Calendar size={14} /> JADWAL</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">jadwal, majelis, pertemuan, kumpul</p>
          </div>
          <div style={cardStyle('#fce4ec', '#e91e63')}>
            <strong style="display: flex; align-items: center; gap: 4px;"><Camera size={14} /> FOTO</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">Kirim gambar langsung</p>
          </div>
        </div>
      </div>

      {/* Registration Flow */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>1. Pendaftaran Anggota Baru</h2>
        <p style="color: #666; margin-bottom: 8px;">Ketika nomor baru menghubungi chatbot</p>
        <FlowContainer>
          <FlowBox type="user" style={{minWidth: '200px'}}>
            <strong>Ibu kirim pesan</strong><br/>
            (nomor belum terdaftar)
          </FlowBox>
          <Arrow />
          <FlowBox type="bot" style={{minWidth: '240px'}}>
            <strong>Bot tanya:</strong><br/>
            "Siapa nama Ibu, usaha apa, dimana?"
          </FlowBox>
          <Arrow />
          <FlowBox type="user" style={{minWidth: '240px'}}>
            <strong>Ibu jawab:</strong><br/>
            "Saya Bu Siti, warung sembako di Bogor"
          </FlowBox>
          <Arrow />
          <FlowBox type="action" style={{minWidth: '200px'}}>
            <strong>Proses: AI ekstrak data:</strong><br/>
            name, business, location
          </FlowBox>
          <Arrow />
          <FlowBox type="success" style={{minWidth: '200px'}}>
            <strong>✓ Terdaftar</strong><br/>
            Status: <span style="color: #ff9800; fontWeight: 'bold'">PENDING</span>
          </FlowBox>
          <Arrow />
          <FlowBox type="end" style={{minWidth: '220px'}}>
            <strong>👨‍💼 BP verifikasi di Dashboard</strong><br/>
            Status → <span style="color: #4caf50; fontWeight: 'bold'">ACTIVE</span>
          </FlowBox>
        </FlowContainer>
      </div>

      {/* Quiz Flow */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>2. Kuis Literasi Keuangan</h2>
        <p style="color: #666; margin-bottom: 8px;">15 minggu pembelajaran • Lulus: <strong>100% (4/4 benar)</strong></p>
        <FlowContainer>
          <FlowBox type="user" style={{minWidth: '180px'}}>
            <strong>Ibu ketik:</strong><br/>
            "kuis" / "belajar"
          </FlowBox>
          <Arrow />
          <FlowBox type="action" style={{minWidth: '220px'}}>
            <strong>Proses: Sistem cek:</strong><br/>
            Minggu mana yang belum lulus?
          </FlowBox>
          <Arrow />
          <FlowBox type="bot" style={{minWidth: '240px'}}>
            <strong>Bot: Kirim intro:</strong><br/>
            "Quiz Minggu X dimulai! Topik: ..."
          </FlowBox>
          <Arrow />
          <FlowBox type="bot" style={{minWidth: '260px'}}>
            <strong>Bot: Kirim soal 1/4</strong><br/>
            (WhatsApp List Message)<br/>
            <span style="font-size: 11px">A. ... | B. ... | C. ... | D. ...</span>
          </FlowBox>
          <Arrow />
          <FlowBox type="decision" style={{minWidth: '180px'}}>
            <strong>Jawaban benar?</strong>
          </FlowBox>
          <SplitFlow
            left={<>
              <div style={{color: '#666', fontSize: '12px'}}>✓ Ya</div>
              <FlowBox type="success" style={{minWidth: '100px'}}>+25%</FlowBox>
            </>}
            right={<>
              <div style={{color: '#666', fontSize: '12px'}}>✗ Tidak</div>
              <FlowBox type="default" style={{minWidth: '120px'}}>+0%<br/><span style="fontSize: '11px'">+ penjelasan</span></FlowBox>
            </>}
          />
          <Arrow />
          <FlowBox type="action" style={{minWidth: '180px'}}>
            <strong>Ulangi 4x</strong><br/>
            (4 soal acak)
          </FlowBox>
          <Arrow />
          <FlowBox type="decision" style={{minWidth: '180px'}}>
            <strong>Nilai = 100%?</strong>
          </FlowBox>
          <SplitFlow
            left={<>
              <div style={{color: '#666', fontSize: '12px'}}>✓ Ya</div>
              <FlowBox type="success" style={{minWidth: '100px'}}><strong>LULUS</strong><br/>Minggu ini</FlowBox>
            </>}
            right={<>
              <div style={{color: '#666', fontSize: '12px'}}>✗ Tidak</div>
              <FlowBox type="default" style={{minWidth: '100px'}}><strong>ULANG</strong><br/>Minggu ini</FlowBox>
            </>}
          />
        </FlowContainer>
      </div>

      {/* Image Analysis Flow */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>3. Analisis Foto Bisnis</h2>
        <p style="color: #666; margin-bottom: 8px;">AI menganalisis foto • Dashboard update real-time</p>
        <FlowContainer>
          <FlowBox type="user" style={{minWidth: '180px'}}>
            <strong>Ibu kirim foto</strong><br/>
            
          </FlowBox>
          <Arrow />
          <FlowBox type="decision" style={{minWidth: '180px'}}>
            <strong>Ada caption?</strong>
          </FlowBox>
          <SplitFlow
            left={<>
              <div style={{color: '#666', fontSize: '12px'}}>✓ Ya</div>
              <FlowBox type="success" style={{minWidth: '100px'}}>Lanjut ↓</FlowBox>
            </>}
            right={<>
              <div style={{color: '#666', fontSize: '12px'}}>✗ Tidak</div>
              <FlowBox type="bot" style={{minWidth: '140px'}}>"Jelaskan foto ini"</FlowBox>
              <Arrow />
              <FlowBox type="user" style={{minWidth: '140px'}}>Ibu balas<br/>(5 menit)</FlowBox>
            </>}
          />
          <Arrow />
          <FlowBox type="action" style={{minWidth: '220px'}}>
            <strong>Proses: Gemini Vision analisis</strong><br/>
            Klasifikasi + ekstrak data
          </FlowBox>
          <Arrow />
          <div style={{display: 'flex', gap: '16px'}}>
            <FlowBox type="success" style={{minWidth: '140px'}}>
              <strong>Mobile: Kirim hasil</strong><br/>ke Ibu
            </FlowBox>
            <FlowBox type="end" style={{minWidth: '140px'}}>
              <strong>Web: Dashboard</strong><br/>update + blink 
            </FlowBox>
          </div>
        </FlowContainer>
        <div style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
          <div style={{padding: '8px', background: '#e3f2fd', borderRadius: '6px', textAlign: 'center'}}>
            <strong>Ledger: Ledger</strong><br/><span style="fontSize: '11px'">Buku kas, nota</span>
          </div>
          <div style={{padding: '8px', background: '#e8f5e9', borderRadius: '6px', textAlign: 'center'}}>
            <strong>Inventory: Inventory</strong><br/><span style="fontSize: '11px'">Stok barang</span>
          </div>
          <div style={{padding: '8px', background: '#fff3e0', borderRadius: '6px', textAlign: 'center'}}>
            <strong>Building: Building</strong><br/><span style="fontSize: '11px'">Tempat usaha</span>
          </div>
          <div style={{padding: '8px', background: '#f3e5f5', borderRadius: '6px', textAlign: 'center'}}>
            <strong>Transaction: Transaction</strong><br/><span style="fontSize: '11px'">Bukti transaksi</span>
          </div>
        </div>
      </div>

      {/* Other Commands */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>4. Perintah Lainnya</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px;">
          
          {/* Menu */}
          <div style={{padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
            <strong>Menu Utama</strong>
            <p style="color: #666; fontSize: '12px'; margin: '4px 0'">Ketik: halo, menu, bantuan</p>
            <div style={{background: '#fff', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '8px', border: '1px solid #e0e0e0'}}>
              <strong>Menu Utama</strong><br/><br/>
              1. KUIS - Mulai kuis<br/>
              2. NILAI - Hasil belajar<br/>
              3. DATA SAYA - Profil<br/>
              4. FOTO - Kirim foto<br/>
              5. JADWAL - Majelis
            </div>
          </div>

          {/* Cek Data */}
          <div style={{padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
            <strong>Cek Data Profil</strong>
            <p style="color: #666; fontSize: '12px'; margin: '4px 0'">Ketik: cek data, profil, data saya</p>
            <div style={{background: '#fff', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '8px', border: '1px solid #e0e0e0'}}>
              ✓ <strong>PROFIL ANDA</strong><br/><br/>
              Nama: Bu Siti<br/>
              Building: Usaha: Warung<br/>
              Lokasi: Bogor<br/>
              Limit: Rp 5.000.000<br/>
              Progress: 5/15
            </div>
          </div>

          {/* Jadwal */}
          <div style={{padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
            <strong>Jadwal Majelis</strong>
            <p style="color: #666; fontSize: '12px'; margin: '4px 0'">Ketik: jadwal, majelis, pertemuan</p>
            <div style={{background: '#fff', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '8px', border: '1px solid #e0e0e0'}}>
              <strong>Jadwal Majelis</strong><br/><br/>
              Majelis: Sejahtera<br/>
              📆 Hari: Senin<br/>
              Jam: 09:00<br/>
              Lokasi: Balai Desa
            </div>
          </div>

          {/* Progress */}
          <div style={{padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
            <strong>📊 Lihat Progress</strong>
            <p style="color: #666; fontSize: '12px'; margin: '4px 0'">Ketik: nilai, progress, hasil</p>
            <div style={{background: '#fff', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '8px', border: '1px solid #e0e0e0'}}>
              📊 <strong>Progress Literasi</strong><br/><br/>
              ✓ Selesai: 5/15 (33%)<br/><br/>
              🎯 Minggu 1: 100%<br/>
              🎯 Minggu 2: 100%<br/>
              🎯 Minggu 3: 100%
            </div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div class="card" style="margin-bottom: 20px;">
        <h2>Status User</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 16px;">
          <div style={{padding: '12px', background: '#fff3cd', borderRadius: '8px', textAlign: 'center'}}>
            <strong style="fontSize: '18px'">🟡</strong><br/>
            <strong>PENDING</strong>
            <p style="margin: 4px 0 0 0; fontSize: '12px'">Menunggu verifikasi BP</p>
          </div>
          <div style={{padding: '12px', background: '#d4edda', borderRadius: '8px', textAlign: 'center'}}>
            <strong style="fontSize: '18px'">🟢</strong><br/>
            <strong>ACTIVE</strong>
            <p style="margin: 4px 0 0 0; fontSize: '12px'">Akses penuh</p>
          </div>
          <div style={{padding: '12px', background: '#f8d7da', borderRadius: '8px', textAlign: 'center'}}>
            <strong style="fontSize: '18px'">🔴</strong><br/>
            <strong>SUSPENDED</strong>
            <p style="margin: 4px 0 0 0; fontSize: '12px'">Dinonaktifkan</p>
          </div>
          <div style={{padding: '12px', background: '#e2e3e5', borderRadius: '8px', textAlign: 'center'}}>
            <strong style="fontSize: '18px'">⚫</strong><br/>
            <strong>INACTIVE</strong>
            <p style="margin: 4px 0 0 0; fontSize: '12px'">Keluar program</p>
          </div>
        </div>
      </div>

      {/* Tech Info */}
      <div class="card">
        <h2>🔧 Tech Stack</h2>
        <div style="display: flex; flexWrap: 'wrap'; gap: '8px'; marginTop: '12px'">
          {['Gemini 2.5 Flash', 'Gemini Vision', 'Firestore', 'Cloud Run', 'WhatsApp API', 'Preact', 'SSE'].map(tech => (
            <span style={{padding: '6px 12px', background: '#e3f2fd', borderRadius: '16px', fontSize: '12px'}}>{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
