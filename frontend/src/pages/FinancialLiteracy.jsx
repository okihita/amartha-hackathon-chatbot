import { useState, useEffect } from 'preact/hooks';
import { BookOpen, FileText, Lightbulb, CheckCircle, RefreshCw, ExternalLink } from 'lucide-preact';

export default function FinancialLiteracy() {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reimporting, setReimporting] = useState(false);

  useEffect(() => { fetchCourse(); }, []);

  const fetchCourse = async (skipCache = false) => {
    const CACHE_KEY = 'financialLiteracy';
    const CACHE_TTL = 24 * 60 * 60 * 1000;
    
    try {
      if (!skipCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setWeeks(data);
            if (data.length > 0) setSelectedWeek(data[0]);
            setLoading(false);
            return;
          }
        }
      }
      
      const res = await fetch('/api/knowledge/financial-literacy');
      const data = await res.json();
      const filtered = data
        .filter(w => w.week_number && w.bank_soal && w.bank_soal.length > 0)
        .sort((a, b) => a.week_number - b.week_number);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: filtered, timestamp: Date.now() }));
      setWeeks(filtered);
      if (filtered.length > 0) setSelectedWeek(filtered[0]);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReimport = async () => {
    if (!confirm('This will reimport all quiz content from Google Drive.\n\nWeek identifiers will be preserved to protect user progress.\n\nContinue?')) return;
    setReimporting(true);
    try {
      const res = await fetch('/api/knowledge/financial-literacy/reimport', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        localStorage.removeItem('financialLiteracy');
        alert(`Reimport complete!\n\nImported: ${result.imported} weeks`);
        await fetchCourse(true);
      } else {
        alert('Reimport failed: ' + (result.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Reimport failed: ' + e.message);
    } finally {
      setReimporting(false);
    }
  };

  const replacePlaceholder = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\[Sapaan\]/gi, 'Anda');
  };

  const getModuleName = (moduleNum) => {
    const names = { 1: 'Fondasi Keuangan', 2: 'Arus Kas', 3: 'Perencanaan', 4: 'Digital & Keamanan' };
    return names[moduleNum] || `Module ${moduleNum}`;
  };

  if (loading) return <div class="loading">Loading...</div>;

  const groupedByModule = weeks.reduce((acc, week) => {
    const m = week.module_number || 0;
    if (!acc[m]) acc[m] = [];
    acc[m].push(week);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' }}>
      {/* Left: Week List */}
      <div style={{ width: '280px', flexShrink: 0, background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #dee2e6' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #dee2e6', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} /> 15 Weeks
          </h2>
          <button
            onClick={handleReimport}
            disabled={reimporting}
            title="Reimport from Google Drive"
            style={{ padding: '6px 10px', background: reimporting ? '#6c757d' : '#fff', border: '1px solid #dee2e6', borderRadius: '4px', cursor: reimporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
          >
            <RefreshCw size={14} class={reimporting ? 'spin' : ''} /> {reimporting ? 'Importing...' : 'Reimport'}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.keys(groupedByModule).sort((a,b) => a-b).map(moduleNum => (
            <div key={moduleNum}>
              <div style={{ padding: '8px 16px', background: '#e9ecef', fontSize: '11px', fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Modul {moduleNum}: {getModuleName(parseInt(moduleNum))}
              </div>
              {groupedByModule[moduleNum].map(week => {
                const isActive = selectedWeek?.week_number === week.week_number;
                const title = (week.module_name || `Week ${week.week_number}`)
                  .replace(/^Modul\s+\d+\s*-\s*/i, '')
                  .replace(/^Minggu\s+\d+:\s*/i, '');
                return (
                  <div
                    key={week.week_number}
                    onClick={() => setSelectedWeek(week)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderLeft: isActive ? '3px solid #0d6efd' : '3px solid transparent',
                      background: isActive ? '#e7f1ff' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#6c757d', marginBottom: '2px' }}>Week {week.week_number}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: isActive ? '#0d6efd' : '#212529' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>{week.bank_soal?.length || 0} questions</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Questions */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #dee2e6' }}>
        {selectedWeek ? (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #dee2e6', background: '#f8f9fa' }}>
              <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '4px' }}>Week {selectedWeek.week_number} • Module {selectedWeek.module_number}</div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>
                {(selectedWeek.module_name || '').replace(/^Modul\s+\d+\s*-\s*/i, '').replace(/^Minggu\s+\d+:\s*/i, '')}
              </h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {/* Bank Soal */}
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#212529' }}>
                <FileText size={16} /> Bank Soal ({selectedWeek.bank_soal?.length || 0})
              </h3>
              <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', overflow: 'hidden' }}>
                {(selectedWeek.bank_soal || []).map((quiz, idx) => (
                  <div key={idx} style={{ borderBottom: idx < selectedWeek.bank_soal.length - 1 ? '1px solid #e9ecef' : 'none', background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#212529', marginBottom: '8px' }}>
                        <span style={{ color: '#6c757d', marginRight: '8px' }}>{idx + 1}.</span>
                        {replacePlaceholder(quiz.question)}
                      </div>
                      <div style={{ paddingLeft: '20px' }}>
                        {(quiz.options || []).map((option, optIdx) => {
                          const isCorrect = optIdx === quiz.correct;
                          return (
                            <div key={optIdx} style={{
                              padding: '6px 10px', marginBottom: '4px',
                              background: isCorrect ? '#d1e7dd' : '#fff',
                              border: `1px solid ${isCorrect ? '#198754' : '#dee2e6'}`,
                              borderRadius: '4px', fontSize: '12px',
                              color: isCorrect ? '#0f5132' : '#495057',
                              display: 'flex', alignItems: 'center'
                            }}>
                              <strong style={{ minWidth: '20px' }}>{String.fromCharCode(97 + optIdx)}.</strong>
                              <span style={{ flex: 1 }}>{replacePlaceholder(option)}</span>
                              {isCorrect && <span style={{ color: '#198754' }}>✓</span>}
                            </div>
                          );
                        })}
                        {quiz.explanation && (
                          <div style={{ marginTop: '8px', padding: '8px 10px', background: '#fff3cd', borderLeft: '3px solid #ffc107', fontSize: '12px', color: '#664d03', display: 'flex', gap: '6px' }}>
                            <Lightbulb size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span>{replacePlaceholder(quiz.explanation)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indikator Kelulusan */}
              {selectedWeek.indikator_kelulusan?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#212529' }}>
                    <CheckCircle size={16} /> Indikator Kelulusan
                  </h3>
                  <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '12px 14px', background: '#f8f9fa' }}>
                    {selectedWeek.indikator_kelulusan.map((item, i) => (
                      <div key={i} style={{ padding: '4px 0', fontSize: '13px', color: '#495057', display: 'flex' }}>
                        <span style={{ minWidth: '20px', color: '#198754', fontWeight: 600 }}>{i + 1}.</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Link */}
              {selectedWeek.source_doc_id && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                  <a
                    href={`https://docs.google.com/document/d/${selectedWeek.source_doc_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d6efd', fontSize: '13px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> View source document in Google Drive
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>
            Select a week to view questions
          </div>
        )}
      </div>
    </div>
  );
}
