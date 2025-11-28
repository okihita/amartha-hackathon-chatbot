import { useState, useEffect } from 'preact/hooks';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  const fetchBusinessTypes = async () => {
    try {
      const res = await fetch('/api/business-types');
      const data = await res.json();
      setBusinessTypes(data.sort((a, b) => (a.category_number || 999) - (b.category_number || 999)));
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

  const totalCount = businessTypes.length;
  const lastUpdated = businessTypes
    .map(bt => bt.imported_at || bt.modified_at)
    .filter(d => d)
    .sort()
    .reverse()[0];

  return (
    <>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">{totalCount}</div>
          <div class="stat-label">Total Business Types</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">{lastUpdated ? new Date(lastUpdated).toISOString().split('T')[0] : '—'}</div>
          <div class="stat-label">Last Updated</div>
        </div>
      </div>

      <div class="card">
        <h2>📚 Business Classifications & Maturity Levels</h2>
        <div class="business-grid">
          {businessTypes.map(bt => {
            const categoryNum = bt.category_number ? `Kategori ${bt.category_number}` : 'Mikro';
            const icon = getBusinessIcon(bt.business_type);
            const goals = (bt.maturity_levels || [])
              .filter(level => level.goal)
              .map(level => `Level ${level.level}: ${level.goal}`);

            return (
              <div key={bt.id} class="business-card">
                <div class="card-header">
                  <div class="card-icon">{icon}</div>
                  <div class="card-title-section">
                    <div class="category">{categoryNum}</div>
                    <h3>{bt.business_type}</h3>
                  </div>
                </div>
                {goals.length > 0 && (
                  <div class="goals">
                    <strong style="font-size: 11px; text-transform: uppercase; color: #007bff; display: block; margin-bottom: 8px;">
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
    </>
  );
}
