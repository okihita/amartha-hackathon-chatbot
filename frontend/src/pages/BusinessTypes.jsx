import { useState, useEffect } from 'preact/hooks';
import { Briefcase } from 'lucide-preact';

const BUSINESS_ICONS = {
  'warung sembako': '🏪', 'kelontong': '🏪', 'warung makan': '🍽️',
  'coffee': '☕', 'jajanan': '🍪', 'camilan': '🍪', 'minuman': '🧋',
  'fashion': '👗', 'hijab': '👗', 'elektronik': '📱', 'gadget': '📱',
  'pet shop': '🐾', 'bahan bangunan': '🧱', 'mainan': '🎮', 'hobi': '🎮',
  'laundry': '👕', 'bengkel motor': '🏍️', 'kecantikan': '💇', 'salon': '💇',
  'penjahit': '✂️', 'permak': '✂️', 'kos-kosan': '🏠', 'penginapan': '🏠',
  'logistik': '📦', 'ekspedisi': '📦', 'sewa kendaraan': '🚗',
  'cuci steam': '🚿', 'detailing': '🚿', 'apotek': '💊', 'obat': '💊',
  'event': '🎉', 'wedding': '🎉', 'bengkel las': '🔧', 'bubut': '🔧',
  'kontraktor': '🏗️', 'renovasi': '🏗️', 'kriya': '🎨', 'kerajinan': '🎨',
  'petani': '🌱', 'holtikultura': '🌱', 'nelayan': '🐟', 'ikan': '🐟'
};

function getBusinessIcon(businessType) {
  const type = businessType.toLowerCase();
  for (const [key, icon] of Object.entries(BUSINESS_ICONS)) {
    if (type.includes(key)) return icon;
  }
  return '🏢';
}

export default function BusinessTypes() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  const fetchBusinessTypes = async () => {
    const CACHE_KEY = 'businessTypes';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setBusinessTypes(data);
          setLoading(false);
          return;
        }
      }
      
      const res = await fetch('/api/knowledge/business-classifications');
      const data = await res.json();
      const sorted = data.sort((a, b) => (a.category_number || 999) - (b.category_number || 999));
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: Date.now() }));
      setBusinessTypes(sorted);
    } catch (error) {
      console.error('Failed to fetch business types', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div class="loading">Loading business types...</div>;

  if (businessTypes.length === 0) {
    return (
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>No Business Types Found</h3>
          <p>Business classifications haven't been imported yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div class="card">
        <h2 style="display: flex; align-items: center; gap: 8px;">
          <Briefcase size={20} /> Business Classifications & Maturity Levels
        </h2>
        <div class="business-grid">
          {businessTypes.map(bt => {
            const categoryNum = bt.category_number ? `Kategori ${bt.category_number}` : 'Mikro';
            const icon = getBusinessIcon(bt.business_type);
            const goals = (bt.maturity_levels || [])
              .filter(level => level.goal)
              .map(level => `Level ${level.level}: ${level.goal}`);

            return (
              <div 
                key={bt.id} 
                class="business-card" 
                onClick={() => setSelectedBusiness(bt)}
                style={{ cursor: 'pointer' }}
              >
                <div class="card-header">
                  <div class="card-icon">{icon}</div>
                  <div class="card-title-section">
                    <div class="category">{categoryNum}</div>
                    <h3>{bt.business_type}</h3>
                  </div>
                </div>
                {goals.length > 0 && (
                  <div class="goals">
                    <strong class="business-type-header">
                      Level Up Goals:
                    </strong>
                    {goals.map((goal, i) => (
                      <div key={i} class="goal-item">{goal}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedBusiness && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedBusiness(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: '24px 24px 16px', borderBottom: '1px solid #eee' }}>
              <button 
                onClick={() => setSelectedBusiness(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#999',
                  lineHeight: 1
                }}
              >&times;</button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '40px', width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getBusinessIcon(selectedBusiness.business_type)}
                </div>
                <div>
                  <div style={{ display: 'inline-block', padding: '4px 12px', background: '#e3f2fd', color: '#1976d2', borderRadius: '12px', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {selectedBusiness.category_number ? `Kategori ${selectedBusiness.category_number}` : 'Mikro'}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedBusiness.business_type}</h2>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {selectedBusiness.description && (
                <div style={{ marginBottom: '24px', color: '#555', lineHeight: 1.6 }}>
                  {selectedBusiness.description}
                </div>
              )}

              <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
                📈 Maturity Levels & Roadmap
              </h3>

              {(selectedBusiness.maturity_levels || []).sort((a, b) => a.level - b.level).map((level, idx) => (
                <div key={idx} style={{ marginBottom: '24px', padding: '20px', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
                    <div style={{ fontWeight: 800, color: '#007bff', fontSize: '16px' }}>LEVEL {level.level}</div>
                    <div style={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>{level.name || level.goal}</div>
                  </div>

                  {level.character?.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🔍 Karakteristik</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                        {level.character.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  {(level.swot?.strengths?.length > 0 || level.swot?.weaknesses?.length > 0 || level.swot?.opportunities?.length > 0 || level.swot?.threats?.length > 0) && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>📊 SWOT Analysis</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {level.swot?.strengths?.length > 0 && (
                          <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                            <strong style={{ color: '#1976d2', display: 'block', marginBottom: '6px', fontSize: '13px' }}>💪 Strengths</strong>
                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px' }}>
                              {level.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {level.swot?.weaknesses?.length > 0 && (
                          <div style={{ background: '#ffebee', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f44336' }}>
                            <strong style={{ color: '#c62828', display: 'block', marginBottom: '6px', fontSize: '13px' }}>⚠️ Weaknesses</strong>
                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px' }}>
                              {level.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {level.swot?.opportunities?.length > 0 && (
                          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                            <strong style={{ color: '#2e7d32', display: 'block', marginBottom: '6px', fontSize: '13px' }}>🎯 Opportunities</strong>
                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px' }}>
                              {level.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {level.swot?.threats?.length > 0 && (
                          <div style={{ background: '#fff8e1', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                            <strong style={{ color: '#e65100', display: 'block', marginBottom: '6px', fontSize: '13px' }}>⚡ Threats</strong>
                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px' }}>
                              {level.swot.threats.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(level.roadmap?.description || level.roadmap?.kpis?.length > 0) && (
                    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                      <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>🚀 How to Level Up</h4>
                      {level.roadmap?.description && <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px', fontStyle: 'italic' }}>{level.roadmap.description}</p>}
                      {level.roadmap?.kpis?.length > 0 && (
                        <div>
                          <strong style={{ fontSize: '13px', color: '#666' }}>Target KPIs:</strong>
                          <ul style={{ margin: '5px 0 0', paddingLeft: '20px', fontSize: '12px' }}>
                            {level.roadmap.kpis.map((kpi, i) => <li key={i}>{kpi}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
