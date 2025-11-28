import { useState, useEffect } from 'preact/hooks';
import { Briefcase, RefreshCw, TrendingUp, Target, AlertTriangle, Zap, ChevronRight } from 'lucide-preact';

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
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  const fetchBusinessTypes = async (forceRefresh = false) => {
    const CACHE_KEY = 'businessTypes';
    const CACHE_TTL = 24 * 60 * 60 * 1000;
    
    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setBusinessTypes(data);
            if (data.length > 0) setSelectedBusiness(data[0]);
            setLoading(false);
            return;
          }
        }
      }
      
      const res = await fetch('/api/knowledge/business-classifications');
      const data = await res.json();
      const sorted = data.sort((a, b) => (a.category_number || 999) - (b.category_number || 999));
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: Date.now() }));
      setBusinessTypes(sorted);
      if (sorted.length > 0) setSelectedBusiness(sorted[0]);
    } catch (error) {
      console.error('Failed to fetch business types', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBusinessTypes(true);
  };

  if (loading) return <div class="loading">Loading business types...</div>;

  return (
    <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 140px)', minHeight: '500px' }}>
      {/* Left: Business List */}
      <div style={{ width: '280px', background: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px solid #dee2e6', flexShrink: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={16} /> 25 Kategori UMKM
          </h3>
          <button onClick={handleRefresh} disabled={refreshing} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <RefreshCw size={14} class={refreshing ? 'spin' : ''} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {businessTypes.map(bt => {
            const isActive = selectedBusiness?.category_id === bt.category_id;
            return (
              <div
                key={bt.category_id}
                onClick={() => setSelectedBusiness(bt)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid #0d6efd' : '3px solid transparent',
                  background: isActive ? '#e7f1ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '20px' }}>{getBusinessIcon(bt.business_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: '#6c757d' }}>Kategori {bt.category_number}</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: isActive ? '#0d6efd' : '#212529', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bt.business_type}
                  </div>
                </div>
                {isActive && <ChevronRight size={14} color="#0d6efd" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: All Levels Stacked */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #dee2e6' }}>
        {selectedBusiness ? (
          <>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #dee2e6', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{getBusinessIcon(selectedBusiness.business_type)}</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>Kategori {selectedBusiness.category_number}</div>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>{selectedBusiness.business_type}</h2>
                  {selectedBusiness.business_character && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{selectedBusiness.business_character}</div>
                  )}
                </div>
              </div>
            </div>

            {/* All Levels */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {(selectedBusiness.maturity_levels || []).sort((a, b) => a.level - b.level).map((level, idx) => (
                <div key={level.level} style={{ marginBottom: '20px', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                  {/* Level Header */}
                  <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0d6efd', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                      {level.level}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#212529' }}>Level {level.level}</div>
                      {level.goal && <div style={{ fontSize: '11px', color: '#6c757d' }}>{level.goal}</div>}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px' }}>
                    {/* Karakteristik */}
                    {level.character?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#6c757d', marginBottom: '6px', textTransform: 'uppercase' }}>Karakteristik</div>
                        {level.character.map((c, i) => (
                          <div key={i} style={{ fontSize: '12px', color: '#495057', padding: '2px 0' }}>• {c}</div>
                        ))}
                      </div>
                    )}

                    {/* SWOT - Compact */}
                    {(level.swot?.strengths?.length > 0 || level.swot?.weaknesses?.length > 0) && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#6c757d', marginBottom: '6px', textTransform: 'uppercase' }}>SWOT</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {level.swot?.strengths?.length > 0 && (
                            <div style={{ background: '#d1e7dd', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                              <strong style={{ color: '#0f5132' }}>S:</strong> {level.swot.strengths[0]}
                            </div>
                          )}
                          {level.swot?.weaknesses?.length > 0 && (
                            <div style={{ background: '#f8d7da', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                              <strong style={{ color: '#842029' }}>W:</strong> {level.swot.weaknesses[0]}
                            </div>
                          )}
                          {level.swot?.opportunities?.length > 0 && (
                            <div style={{ background: '#cff4fc', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                              <strong style={{ color: '#055160' }}>O:</strong> {level.swot.opportunities[0]}
                            </div>
                          )}
                          {level.swot?.threats?.length > 0 && (
                            <div style={{ background: '#fff3cd', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                              <strong style={{ color: '#664d03' }}>T:</strong> {level.swot.threats[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KPIs to Level Up */}
                    {level.roadmap?.kpis?.length > 0 && level.level < 5 && (
                      <div style={{ background: '#e7f1ff', borderRadius: '6px', padding: '10px', border: '1px solid #b6d4fe' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#084298', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TrendingUp size={12} /> KPI Naik ke Level {level.level + 1}
                        </div>
                        {level.roadmap.description && (
                          <div style={{ fontSize: '11px', color: '#084298', marginBottom: '6px', fontStyle: 'italic' }}>
                            Tujuan: {level.roadmap.description}
                          </div>
                        )}
                        {level.roadmap.kpis.map((kpi, i) => (
                          <div key={i} style={{ fontSize: '11px', color: '#0a58ca', padding: '3px 0', display: 'flex' }}>
                            <span style={{ minWidth: '18px', fontWeight: 600 }}>{i + 1}.</span>
                            <span>{kpi}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {level.level === 5 && (
                      <div style={{ background: '#d1e7dd', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                        <span style={{ fontSize: '16px' }}>🏆</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f5132', marginLeft: '6px' }}>Level Maksimal - Korporasi</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6c757d' }}>
            Select a business category
          </div>
        )}
      </div>
    </div>
  );
}
