import { useState, useEffect } from 'preact/hooks';
import { BookOpen, FileText, Lightbulb, CheckCircle } from 'lucide-preact';

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
  const type = (businessType || '').toLowerCase();
  for (const [key, icon] of Object.entries(BUSINESS_ICONS)) {
    if (type.includes(key)) return icon;
  }
  return '📚';
}

export default function FinancialLiteracy() {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    const CACHE_KEY = 'financialLiteracy';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setWeeks(data);
          setLoading(false);
          return;
        }
      }
      
      const res = await fetch('/api/knowledge/financial-literacy');
      const data = await res.json();
      const filtered = data
        .filter(w => w.week_number && w.bank_soal && w.bank_soal.length > 0)
        .sort((a, b) => a.week_number - b.week_number);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: filtered, timestamp: Date.now() }));
      setWeeks(filtered);
      setWeeks(filtered);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const replacePlaceholder = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\[Sapaan\]/gi, 'Anda');
  };

  const getModuleName = (moduleNum) => {
    const moduleNames = {
      1: 'Fondasi Keuangan dan Pencatatan',
      2: 'Pengelolaan Arus Kas',
      3: 'Perencanaan Usaha',
      4: 'Literasi Digital dan Keamanan'
    };
    return moduleNames[moduleNum] || `Module ${moduleNum}`;
  };

  if (loading) return <div class="loading">Loading...</div>;

  const groupedByModule = weeks.reduce((acc, week) => {
    const moduleNum = week.module_number || 0;
    if (!acc[moduleNum]) acc[moduleNum] = [];
    acc[moduleNum].push(week);
    return acc;
  }, {});

  const modules = Object.keys(groupedByModule).sort((a, b) => a - b);

  return (
    <>
      <div class="card">
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} /> Financial Literacy Course - 15 Weeks
        </h2>
      </div>

      {modules.map(moduleNum => {
        const moduleWeeks = groupedByModule[moduleNum];
        const moduleName = getModuleName(parseInt(moduleNum));

        return (
          <div key={moduleNum} class="card">
            <h3 style={{ marginBottom: '12px', color: '#212529', fontSize: '16px', fontWeight: 600 }}>
              Modul {moduleNum}: {moduleName}
            </h3>
            <div class="weeks-grid">
              {moduleWeeks.map(week => {
                const quizCount = week.bank_soal?.length || 0;
                let title = week.module_name || `Week ${week.week_number}`;
                title = title.replace(/^Modul\s+\d+\s*-\s*/i, '');
                title = title.replace(/^Minggu\s+\d+:\s*/i, '');

                return (
                  <div 
                    key={week.week_number} 
                    class="week-card" 
                    onClick={() => setSelectedWeek(week)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div class="week-header">
                      <div class="week-number">Week {week.week_number}</div>
                    </div>
                    <div class="week-title">{title}</div>
                    <div class="week-quiz-count">{quizCount} questions</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Compact Enterprise Modal */}
      {selectedWeek && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '16px'
          }}
          onClick={() => setSelectedWeek(null)}
        >
          <div 
            style={{
              background: 'white', borderRadius: '8px',
              maxWidth: '1200px', width: '100%', maxHeight: '92vh',
              overflow: 'auto', position: 'relative',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1, padding: '14px 18px', borderBottom: '2px solid #dee2e6' }}>
              <button 
                onClick={() => setSelectedWeek(null)}
                style={{
                  position: 'absolute', top: '10px', right: '14px',
                  background: 'none', border: 'none', fontSize: '24px',
                  cursor: 'pointer', color: '#6c757d', lineHeight: 1, padding: '4px 8px'
                }}
              >&times;</button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '28px', width: '44px', height: '44px', background: '#e9ecef', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getBusinessIcon(selectedWeek.module_name)}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    Week {selectedWeek.week_number} • Module {selectedWeek.module_number}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#212529' }}>
                    {selectedWeek.module_name?.replace(/^Modul\s+\d+\s*-\s*/i, '').replace(/^Minggu\s+\d+:\s*/i, '')}
                  </h2>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              {/* Bank Soal - Compact Table */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px', color: '#212529', borderBottom: '2px solid #0d6efd', paddingBottom: '5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Bank Soal ({selectedWeek.bank_soal?.length || 0})
                </h3>

                <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', overflow: 'hidden' }}>
                  {(selectedWeek.bank_soal || []).map((quiz, idx) => (
                    <div key={idx} style={{ borderBottom: idx < selectedWeek.bank_soal.length - 1 ? '1px solid #e9ecef' : 'none', background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#212529', marginBottom: '6px' }}>
                          <span style={{ display: 'inline-block', width: '24px', color: '#6c757d' }}>{idx + 1}.</span>
                          {replacePlaceholder(quiz.question)}
                        </div>
                        <div style={{ paddingLeft: '24px' }}>
                          {(quiz.options || []).map((option, optIdx) => {
                            const isCorrect = optIdx === quiz.correct;
                            const optionLabel = String.fromCharCode(97 + optIdx);
                            return (
                              <div key={optIdx} style={{
                                padding: '5px 8px', marginBottom: '3px',
                                background: isCorrect ? '#d1e7dd' : 'white',
                                border: `1px solid ${isCorrect ? '#198754' : '#dee2e6'}`,
                                borderRadius: '4px', fontSize: '12px',
                                color: isCorrect ? '#0f5132' : '#495057',
                                display: 'flex', alignItems: 'center'
                              }}>
                                <strong style={{ minWidth: '18px', marginRight: '6px' }}>{optionLabel}.</strong>
                                <span style={{ flex: 1 }}>{replacePlaceholder(option)}</span>
                                {isCorrect && <span style={{ marginLeft: '6px', fontSize: '13px' }}>✓</span>}
                              </div>
                            );
                          })}
                          {quiz.explanation && (
                            <div style={{ marginTop: '6px', padding: '6px 8px', background: '#fff3cd', borderLeft: '3px solid #ffc107', fontSize: '11px', color: '#664d03', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                              <Lightbulb size={12} style={{flexShrink: 0, marginTop: '1px'}} /> {replacePlaceholder(quiz.explanation)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indikator Kelulusan */}
              {selectedWeek.indikator_kelulusan && selectedWeek.indikator_kelulusan.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px', color: '#212529', borderBottom: '2px solid #198754', paddingBottom: '5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Indikator Kelulusan
                  </h3>
                  <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '10px 14px', background: '#f8f9fa' }}>
                    {selectedWeek.indikator_kelulusan.map((item, i) => (
                      <div key={i} style={{ padding: '4px 0', fontSize: '12px', color: '#495057', display: 'flex' }}>
                        <span style={{ minWidth: '18px', color: '#198754', fontWeight: 600 }}>{i + 1}.</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                {selectedWeek.description && (
                  <div style={{ gridColumn: '1 / -1', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                    <strong style={{ color: '#495057', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</strong>
                    <div style={{ marginTop: '4px', color: '#6c757d', fontSize: '12px' }}>{selectedWeek.description}</div>
                  </div>
                )}

                {selectedWeek.source_doc_id && (
                  <div style={{ padding: '8px 10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                    <strong style={{ color: '#495057', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Source</strong>
                    <a 
                      href={`https://docs.google.com/document/d/${selectedWeek.source_doc_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#0d6efd', fontSize: '11px', textDecoration: 'none' }}
                    >
                      View Google Doc →
                    </a>
                  </div>
                )}

                {selectedWeek.imported_at && (
                  <div style={{ padding: '8px 10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                    <strong style={{ color: '#495057', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Imported</strong>
                    <div style={{ color: '#6c757d', fontSize: '11px' }}>{new Date(selectedWeek.imported_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
