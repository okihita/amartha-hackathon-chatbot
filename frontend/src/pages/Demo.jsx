import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Copy, Trash2, RefreshCw, User, Phone } from 'lucide-preact';

const API_BASE = '/api';

const PERSONAS = [
  { key: 'warung', name: 'Warung Sembako', icon: '🏪', desc: 'Maturity 3, 40% quiz' },
  { key: 'toko', name: 'Toko Kelontong', icon: '🛒', desc: 'Maturity 2, 20% quiz' },
  { key: 'makanan', name: 'Usaha Makanan', icon: '🍜', desc: 'Maturity 4, 60% quiz' },
  { key: 'jahit', name: 'Jasa Jahit', icon: '🧵', desc: 'Maturity 2, 13% quiz' },
  { key: 'pertanian', name: 'Pertanian', icon: '🌾', desc: 'Maturity 3, 53% quiz' },
  { key: 'salon', name: 'Salon Kecantikan', icon: '💇', desc: 'Maturity 3, 33% quiz' },
  { key: 'laundry', name: 'Jasa Laundry', icon: '🧺', desc: 'Maturity 2, 27% quiz' },
  { key: 'random', name: 'Random', icon: '🎲', desc: 'Random persona' },
];

const SCENARIOS = [
  { key: 'sukses', name: 'Sukses', icon: '🌟', desc: 'Rp 10jt, 80% quiz, good payments' },
  { key: 'baru', name: 'Baru', icon: '🆕', desc: 'No loan, 0% quiz, no majelis' },
  { key: 'krisis', name: 'Krisis', icon: '📉', desc: 'Missed payments, struggling' },
  { key: 'lulus', name: 'Lulus', icon: '🎓', desc: '100% quiz, fully paid, graduate' },
  { key: 'fraud', name: 'Fraud', icon: '⚠️', desc: 'Suspicious activity flags' },
];

export default function Demo() {
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const fetchDemoUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`);
      const users = await res.json();
      setDemoUsers(users.filter(u => u.is_demo === true));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDemoUsers(); }, []);

  const copyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteUser = async (phone) => {
    if (!confirm(`Delete demo user ${phone}?`)) return;
    await fetch(`${API_BASE}/users/${phone}`, { method: 'DELETE' });
    fetchDemoUsers();
  };

  const cardStyle = (selected) => ({
    padding: '12px',
    background: selected ? '#e3f2fd' : '#fff',
    border: `2px solid ${selected ? '#2196f3' : '#e0e0e0'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style="padding: 20px;">
      <div class="card" style="margin-bottom: 20px;">
        <h1 style="margin: 0 0 8px 0;">🎮 Demo Mode</h1>
        <p style="color: #666; margin: 0;">Commands untuk hackathon judges. Kirim via WhatsApp ke chatbot.</p>
      </div>

      {/* How to Use */}
      <div class="card" style="margin-bottom: 20px; background: #fff3e0;">
        <h2 style="margin: 0 0 12px 0;">📱 Cara Pakai</h2>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Buka WhatsApp, chat ke nomor bot</li>
          <li>Copy command di bawah, kirim ke chat</li>
          <li>Bot akan inject data persona ke nomor Anda</li>
          <li>Coba fitur: ketik "menu", "cek data", "kuis", dll</li>
          <li>Selesai? Kirim <code>/demo:reset</code> untuk hapus data</li>
        </ol>
      </div>

      {/* Persona Commands */}
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0;">👤 Persona</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          {PERSONAS.map(p => (
            <div 
              key={p.key} 
              style={cardStyle(copied === `/demo:${p.key}`)}
              onClick={() => copyCommand(`/demo:${p.key}`)}
            >
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 24px;">{p.icon}</span>
                <strong>{p.name}</strong>
              </div>
              <div style="font-size: 12px; color: #666;">{p.desc}</div>
              <div style="font-size: 11px; color: #2196f3; margin-top: 8px; font-family: monospace;">
                /demo:{p.key} {copied === `/demo:${p.key}` ? '✓ Copied!' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Commands */}
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0;">🎬 Skenario</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          {SCENARIOS.map(s => (
            <div 
              key={s.key} 
              style={cardStyle(copied === `/demo:${s.key}`)}
              onClick={() => copyCommand(`/demo:${s.key}`)}
            >
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 24px;">{s.icon}</span>
                <strong>{s.name}</strong>
              </div>
              <div style="font-size: 12px; color: #666;">{s.desc}</div>
              <div style="font-size: 11px; color: #2196f3; margin-top: 8px; font-family: monospace;">
                /demo:{s.key} {copied === `/demo:${s.key}` ? '✓ Copied!' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combination Examples */}
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0;">🔀 Kombinasi (Persona + Skenario)</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          {['/demo:warung+krisis', '/demo:random+lulus', '/demo:makanan+fraud', '/demo:toko+baru'].map(cmd => (
            <button 
              key={cmd}
              onClick={() => copyCommand(cmd)}
              style={{
                padding: '8px 16px',
                background: copied === cmd ? '#4caf50' : '#f5f5f5',
                color: copied === cmd ? '#fff' : '#333',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              {cmd} {copied === cmd ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Command */}
      <div class="card" style="margin-bottom: 20px; background: #ffebee;">
        <h2 style="margin: 0 0 12px 0;">🗑️ Reset</h2>
        <p style="margin: 0 0 12px 0; color: #666;">Hapus semua data demo dari nomor Anda:</p>
        <button 
          onClick={() => copyCommand('/demo:reset')}
          style={{
            padding: '10px 20px',
            background: copied === '/demo:reset' ? '#4caf50' : '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '14px',
          }}
        >
          /demo:reset {copied === '/demo:reset' ? '✓ Copied!' : ''}
        </button>
      </div>

      {/* Demo Users List */}
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin: 0;">📋 Demo Users Created</h2>
          <button onClick={fetchDemoUsers} style="padding: 8px 16px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: #fff;">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : demoUsers.length === 0 ? (
          <p style="color: #666; text-align: center; padding: 20px;">
            Belum ada demo users. Kirim command via WhatsApp untuk membuat.
          </p>
        ) : (
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">User</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Persona</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Scenario</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Created</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoUsers.map(user => (
                <tr key={user.phone} style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">
                    <div style="font-weight: 500;">{user.name}</div>
                    <div style="font-size: 12px; color: #666;">{user.phone}</div>
                  </td>
                  <td style="padding: 12px;">
                    <span style="padding: 4px 8px; background: #e3f2fd; border-radius: 4px; font-size: 12px;">
                      {user.demo_persona || '-'}
                    </span>
                  </td>
                  <td style="padding: 12px;">
                    <span style="padding: 4px 8px; background: #fff3e0; border-radius: 4px; font-size: 12px;">
                      {user.demo_scenario || '-'}
                    </span>
                  </td>
                  <td style="padding: 12px; font-size: 12px; color: #666;">
                    {new Date(user.created_at).toLocaleString('id-ID')}
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <a href={`/user-profile/${user.phone}`} style="color: #2196f3; margin-right: 12px;">View</a>
                    <button onClick={() => deleteUser(user.phone)} style="color: #f44336; background: none; border: none; cursor: pointer;">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
