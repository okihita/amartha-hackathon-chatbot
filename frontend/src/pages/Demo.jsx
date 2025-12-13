import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Copy, Trash2, RefreshCw, Gamepad2, Smartphone, Users, Clapperboard, Shuffle, RotateCcw, List, Route, Bot } from 'lucide-preact';
import { API_BASE_URL } from '../config';

const WA_NUMBER = '6281991262988';
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

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
  { key: 'sukses', name: 'Sukses', icon: '🌟', desc: 'Rp 10jt, 80% quiz' },
  { key: 'baru', name: 'Baru', icon: '🆕', desc: 'No loan, 0% quiz' },
  { key: 'krisis', name: 'Krisis', icon: '📉', desc: 'Missed payments' },
  { key: 'lulus', name: 'Lulus', icon: '🎓', desc: '100% quiz, paid' },
  { key: 'fraud', name: 'Fraud', icon: '⚠️', desc: 'Suspicious flags' },
];

const JOURNEYS = [
  {
    title: 'New User Registration', steps: [
      'Send /demo:reset to clear data',
      'Send "Halo" → Bot asks for info',
      'Reply: "Saya Dewi, jualan kue di Bandung"',
      'Dashboard → User appears "Pending"',
      'Click Verify → Status "Active"'
    ]
  },
  {
    title: 'Quiz Flow (Full)', steps: [
      'Send /demo:warung (40% progress)',
      'Send "kuis" → Get next incomplete week',
      'Answer 4 questions via list',
      'Score 100% to pass week',
      'Send "nilai" → See progress'
    ]
  },
  {
    title: 'Quiz Flow (Single Week)', steps: [
      'Send /demo:baru (0% progress)',
      'Send "kuis" → Start Week 1',
      'Answer all 4 correctly → Pass',
      'Send "kuis" again → Week 2 starts',
      'Repeat until Week 15 = Graduate'
    ]
  },
  {
    title: 'Image Analysis (BI)', steps: [
      'Send /demo:makanan',
      'Send photo with caption',
      'Bot extracts data (type, value)',
      'Dashboard → User Profile → BI',
      'New card with "NEW" badge'
    ]
  },
  {
    title: 'Profile & Loan Info', steps: [
      'Send /demo:sukses',
      'Send "cek data" → Full profile',
      'See loan limit, balance, payments',
      'Send "jadwal" → Majelis schedule',
      'Dashboard shows same data'
    ]
  },
  {
    title: 'Majelis & Attendance', steps: [
      'Send /demo:sukses (has majelis)',
      'Dashboard → Majelis page',
      'Click majelis card → Detail',
      'See member list + attendance',
      'Add attendance record'
    ]
  },
];

export default function Demo() {
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [newUserIds, setNewUserIds] = useState(new Set());

  const fetchDemoUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      const users = await res.json();
      setDemoUsers(users.filter(u => u.is_demo === true));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDemoUsers();

    // SSE for real-time updates
    const eventSource = new EventSource(`${API_BASE_URL}/api/events/demo`);
    eventSource.onmessage = (e) => {
      const update = JSON.parse(e.data);
      if (update.type === 'user_created' && update.data?.is_demo) {
        setNewUserIds(prev => new Set([...prev, update.data.phone]));
        fetchDemoUsers();
        setTimeout(() => {
          setNewUserIds(prev => { const n = new Set(prev); n.delete(update.data.phone); return n; });
        }, 5000);
      }
    };
    return () => eventSource.close();
  }, []);

  const copyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteUser = async (phone) => {
    if (!confirm(`Delete demo user ${phone}?`)) return;
    await fetch(`${API_BASE_URL}/api/users/${phone}`, { method: 'DELETE' });
    fetchDemoUsers();
  };

  const CommandCard = ({ item, prefix }) => {
    const cmd = `${prefix}${item.key}`;
    const isActive = copied === cmd;
    return (
      <div
        onClick={() => copyCommand(cmd)}
        style={{
          padding: '14px',
          background: isActive ? '#e3f2fd' : '#fff',
          border: `1px solid ${isActive ? '#2196f3' : '#e0e0e0'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '28px' }}>{item.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>{item.desc}</div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#2196f3', fontFamily: 'monospace', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
          {cmd} {isActive && '✓'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '2px solid #e0e0e0', paddingBottom: '16px' }}>
        <h1 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px' }}>
          <Gamepad2 size={28} /> Demo Mode
        </h1>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}
        >
          <Bot size={18} /> Chatbot: +62 819-9126-2988
        </a>
        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Copy commands below and send to the chatbot via WhatsApp.</p>
      </div>

      {/* Quick Start */}
      <div style={{ background: '#fff3e0', padding: '16px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffcc80' }}>
        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
          <Smartphone size={18} /> Quick Start
        </h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: '#5d4037' }}>
          <span>1. Copy command below</span>
          <span>2. Send to WhatsApp bot</span>
          <span>3. Try features: "menu", "kuis", "cek data"</span>
          <span>4. Reset: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>/demo:reset</code></span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Personas */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#333' }}>
            <Users size={18} /> Personas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {PERSONAS.map(p => <CommandCard key={p.key} item={p} prefix="/demo:" />)}
          </div>
        </div>

        {/* Scenarios */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#333' }}>
            <Clapperboard size={18} /> Scenarios
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {SCENARIOS.map(s => <CommandCard key={s.key} item={s} prefix="/demo:" />)}
          </div>

          {/* Combinations */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shuffle size={14} /> Kombinasi (persona+scenario)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['/demo:warung+krisis', '/demo:random+lulus', '/demo:makanan+fraud'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => copyCommand(cmd)}
                  style={{
                    padding: '6px 12px',
                    background: copied === cmd ? '#4caf50' : '#f5f5f5',
                    color: copied === cmd ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                >
                  {cmd} {copied === cmd && '✓'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Journeys */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #a5d6a7' }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#2e7d32' }}>
          <Route size={18} /> Test Journeys
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {JOURNEYS.map((j, idx) => (
            <div key={idx} style={{ background: '#fff', padding: '14px', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#2e7d32', marginBottom: '10px' }}>{idx + 1}. {j.title}</div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.7' }}>
                {j.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#81c784', fontWeight: 600, minWidth: '16px' }}>{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset + Demo Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
        {/* Reset */}
        <div style={{ background: '#ffebee', padding: '16px', borderRadius: '8px', border: '1px solid #ef9a9a', textAlign: 'center' }}>
          <RotateCcw size={24} style={{ color: '#c62828', marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Clear demo data</div>
          <button
            onClick={() => copyCommand('/demo:reset')}
            style={{
              padding: '10px 16px',
              background: copied === '/demo:reset' ? '#4caf50' : '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
              width: '100%',
            }}
          >
            /demo:reset {copied === '/demo:reset' && '✓'}
          </button>
        </div>

        {/* Demo Users List */}
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <List size={16} /> Demo Users ({demoUsers.length})
            </h3>
            <button onClick={fetchDemoUsers} style={{ padding: '4px 10px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ color: '#666', fontSize: '13px' }}>Loading...</div>
          ) : demoUsers.length === 0 ? (
            <div style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>No demo users yet. Send a command via WhatsApp.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {demoUsers.map(u => {
                const isNew = newUserIds.has(u.phone);
                const formattedPhone = u.phone.replace(/^62/, '+62 ').replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
                return (
                  <div
                    key={u.phone}
                    style={{
                      padding: '8px 12px',
                      background: isNew ? '#e8f5e9' : '#f5f5f5',
                      borderRadius: '6px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: isNew ? '2px solid #4caf50' : '1px solid #e0e0e0',
                      animation: isNew ? 'blink 0.5s ease-in-out 3' : 'none',
                    }}
                  >
                    {isNew && <span style={{ background: '#4caf50', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 600 }}>NEW</span>}
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                    <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '11px' }}>{formattedPhone}</span>
                    <Trash2
                      size={14}
                      style={{ color: '#999', cursor: 'pointer', marginLeft: '4px' }}
                      onClick={() => deleteUser(u.phone)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
