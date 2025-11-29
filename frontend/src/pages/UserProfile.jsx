import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { User, Building2, CreditCard, BookOpen, Users as UsersIcon, ArrowLeft, Target, Calendar, Phone, TrendingUp, Shield, CheckCircle, Activity, MessageCircle, Zap, Award, ChevronRight, ArrowUpRight, Sparkles, MapPin, FileText } from 'lucide-preact';

// Base coordinates for Jakarta area
const JAKARTA_BASE = { lat: -6.2350, lng: 106.8000 };

// Zone descriptions
const ZONE_CONFIG = {
  A: { label: 'Auto-Approve', color: '#10B981', bg: '#D1FAE5', desc: 'Excellent creditworthiness' },
  B: { label: 'Approve (Conditions)', color: '#3B82F6', bg: '#DBEAFE', desc: 'Good with minor conditions' },
  C: { label: 'Approve (Coaching)', color: '#F59E0B', bg: '#FEF3C7', desc: 'Needs coaching support' },
  D: { label: 'Not Ready', color: '#EF4444', bg: '#FEE2E2', desc: 'Build creditworthiness first' },
};

// Format helpers
const formatCurrency = (num) => num ? `Rp ${num.toLocaleString('id-ID')}` : '-';
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// Calculate improvement suggestions
const getImprovementSuggestions = (data) => {
  const suggestions = [];
  const a = data.a_score?.components || {};
  
  if (!data.capacity) {
    suggestions.push({ action: 'Hitung Kapasitas', impact: '+20 pts', desc: 'Ketik "kapasitas" di WhatsApp', priority: 1 });
  }
  if ((a.literacy || 0) < 70) {
    suggestions.push({ action: 'Selesaikan Quiz', impact: '+15 pts', desc: 'Ketik "quiz" untuk belajar keuangan', priority: 2 });
  }
  if (!data.majelis_id) {
    suggestions.push({ action: 'Gabung Majelis', impact: '+10 pts', desc: 'Hubungi petugas lapangan', priority: 3 });
  }
  if ((data.engagement?.total_interactions || 0) < 20) {
    suggestions.push({ action: 'Aktif di WhatsApp', impact: '+5 pts', desc: 'Tanya tips bisnis setiap hari', priority: 4 });
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
};

export default function UserProfile({ phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [biFilter, setBiFilter] = useState('all');

  useEffect(() => {
    fetch(`/api/users/${phone}/complete`)
      .then(res => res.ok ? res.json() : Promise.reject('User not found'))
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [phone]);

  // Initialize map when data is loaded
  useEffect(() => {
    if (loading || !data || typeof L === 'undefined') return;
    
    const mapEl = document.getElementById('user-location-map');
    if (!mapEl) return;

    // Get coordinates from profile/business or generate mock based on phone
    const hash = (phone || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const homeLat = data.profile?.home_lat || data.home_lat || JAKARTA_BASE.lat + ((hash % 100) - 50) * 0.015 / 50;
    const homeLng = data.profile?.home_lng || data.home_lng || JAKARTA_BASE.lng + ((hash * 7 % 100) - 50) * 0.015 / 50;
    const bizLat = data.business?.business_lat || data.business_lat || homeLat + ((hash % 30) - 15) * 0.002;
    const bizLng = data.business?.business_lng || data.business_lng || homeLng + ((hash * 3 % 30) - 15) * 0.002;

    let map = mapInstance;
    if (!map) {
      map = L.map('user-location-map').setView([homeLat, homeLng], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© CartoDB © OSM' }).addTo(map);
      setMapInstance(map);
    }

    map.eachLayer(layer => { if (!layer._url) map.removeLayer(layer); });

    // Home marker
    const homeIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 32px; height: 32px; background: #1D4ED8; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: 3px solid white; font-size: 14px;">🏠</div>`,
      iconSize: [32, 32], iconAnchor: [16, 16]
    });
    L.marker([homeLat, homeLng], { icon: homeIcon }).addTo(map).bindPopup(`<b>${data.name}</b><br/>🏠 Rumah`);

    // Business marker
    const bizIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 32px; height: 32px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: 3px solid white; font-size: 14px;">🏪</div>`,
      iconSize: [32, 32], iconAnchor: [16, 16]
    });
    L.marker([bizLat, bizLng], { icon: bizIcon }).addTo(map).bindPopup(`<b>${data.business?.name || 'Usaha'}</b><br/>🏪 Lokasi Usaha`);

    map.fitBounds([[homeLat, homeLng], [bizLat, bizLng]], { padding: [50, 50] });
  }, [loading, data]);

  if (loading) return <div class="card" style="text-align: center; padding: 60px;">Loading...</div>;
  if (error) return <div class="card" style="text-align: center; padding: 60px; color: #EF4444;">{error}</div>;
  if (!data) return null;

  const a = data.a_score || { score: 0, zone: 'D', components: {} };
  const zone = ZONE_CONFIG[a.zone] || ZONE_CONFIG.D;
  const rpc = data.rpc || {};
  const eng = data.engagement || {};
  const suggestions = getImprovementSuggestions(data);
  
  // Literacy progress - find highest completed week
  const litData = data.literacy || {};
  let litCompleted = 0;
  for (let i = 1; i <= 15; i++) {
    const weekKey = `week_${String(i).padStart(2, '0')}`;
    if (litData[weekKey]?.score >= 100) litCompleted = i;
    else break; // Stop at first incomplete week
  }
  const litPercent = Math.round((litCompleted / 15) * 100);

  return (
    <div>
      {/* Back Button */}
      <button onClick={() => window.history.back()} class="btn btn-secondary" style="margin-bottom: 20px;">
        <ArrowLeft size={18} /> Kembali
      </button>

      {/* Hero: Creditworthiness Journey */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden; background: linear-gradient(135deg, #1F2937 0%, #374151 100%);">
        <div style="padding: 32px;">
          {/* Header */}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div style="display: flex; gap: 16px; align-items: center;">
              <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700;">
                {data.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style="color: white;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7;">Perjalanan Kelayakan Kredit</div>
                <h1 style="margin: 4px 0; font-size: 24px; font-weight: 700;">{data.name}</h1>
                <div style="font-size: 13px; opacity: 0.8;">{data.business?.name} • {data.business?.location}</div>
              </div>
            </div>
            <div style={`padding: 8px 16px; border-radius: 8px; background: ${zone.bg}; color: ${zone.color}; font-weight: 700; font-size: 12px;`}>
              {data.status === 'active' ? 'TERVERIFIKASI' : 'MENUNGGU'}
            </div>
          </div>

          {/* A-Score Hero */}
          <div style="display: grid; grid-template-columns: 200px 1fr; gap: 32px; align-items: center;">
            {/* Score Circle */}
            <div style="text-align: center;">
              <div style="position: relative; width: 160px; height: 160px; margin: 0 auto;">
                <svg viewBox="0 0 160 160" style="transform: rotate(-90deg);">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke={zone.color} stroke-width="12" 
                    stroke-dasharray={`${(a.score || 0) * 4.4} 440`} stroke-linecap="round" />
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
                  <div style="font-size: 48px; font-weight: 800; line-height: 1;">{a.score || '--'}</div>
                  <div style="font-size: 12px; opacity: 0.7;">A-Score</div>
                </div>
              </div>
              <div style={`margin-top: 12px; padding: 8px 20px; border-radius: 8px; display: inline-block; background: ${zone.color}; color: white; font-weight: 700; font-size: 13px;`}>
                Zone {a.zone}: {zone.label}
              </div>
            </div>

            {/* Score Components */}
            <div>
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.6); margin-bottom: 16px;">
                Komponen Skor (dari interaksi WhatsApp)
              </div>
              <div style="display: grid; gap: 12px;">
                {[
                  { key: 'character', label: 'Karakter (CRBI)', icon: Shield, weight: '25%' },
                  { key: 'capacity', label: 'Kapasitas Bayar', icon: CreditCard, weight: '30%' },
                  { key: 'literacy', label: 'Literasi Keuangan', icon: BookOpen, weight: '25%' },
                  { key: 'engagement', label: 'Engagement WhatsApp', icon: MessageCircle, weight: '20%' },
                ].map(({ key, label, icon: Icon, weight }) => {
                  const val = a.components?.[key] || 0;
                  const color = val >= 70 ? '#10B981' : val >= 40 ? '#F59E0B' : '#EF4444';
                  return (
                    <div key={key} style="display: flex; align-items: center; gap: 12px;">
                      <Icon size={18} style="color: rgba(255,255,255,0.6);" />
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                          <span style="font-size: 13px; color: white;">{label}</span>
                          <span style="font-size: 13px; font-weight: 700; color: white;">{val}/100</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                          <div style={`height: 100%; width: ${val}%; background: ${color}; border-radius: 3px; transition: width 0.5s;`} />
                        </div>
                      </div>
                      <span style="font-size: 11px; color: rgba(255,255,255,0.5); width: 35px;">{weight}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div style="padding: 16px 32px; background: rgba(255,255,255,0.05); border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 12px; color: white;">
            <Sparkles size={20} style="color: #F9CF79;" />
            <span style="font-size: 14px;">
              {a.zone === 'A' ? 'Kelayakan kredit sangat baik! Siap untuk pinjaman.' :
               a.zone === 'B' ? 'Kelayakan baik. Tingkatkan literasi untuk limit lebih tinggi.' :
               a.zone === 'C' ? 'Perlu pendampingan. Selesaikan saran di bawah untuk naik level.' :
               'Mulai perjalanan dengan menghitung kapasitas bayar via WhatsApp.'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Cards: What to Improve */}
      {suggestions.length > 0 && (
        <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden; border: 2px solid #F9CF79;">
          <div style="padding: 16px 24px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); display: flex; align-items: center; gap: 12px;">
            <Target size={24} style="color: #92400E;" />
            <div>
              <div style="font-size: 16px; font-weight: 700; color: #92400E;">Langkah Selanjutnya untuk Naik Level</div>
              <div style="font-size: 12px; color: #A16207;">Selesaikan untuk meningkatkan A-Score</div>
            </div>
          </div>
          <div style="padding: 20px 24px; display: grid; gap: 12px;">
            {suggestions.map((s, i) => (
              <div key={i} style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #F9FAFB; border-radius: 12px; border: 1px solid #E5E7EB;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #63297A; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">{i + 1}</div>
                <div style="flex: 1;">
                  <div style="font-size: 15px; font-weight: 600; color: #1F2937;">{s.action}</div>
                  <div style="font-size: 13px; color: #6B7280;">{s.desc}</div>
                </div>
                <div style="padding: 6px 12px; background: #D1FAE5; color: #065F46; border-radius: 6px; font-size: 13px; font-weight: 700;">{s.impact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column: RPC + Engagement */}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        {/* RPC Card */}
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 10px;">
            <CreditCard size={20} style="color: #63297A;" />
            <span style="font-size: 15px; font-weight: 600;">Kapasitas Bayar (RPC)</span>
          </div>
          {data.capacity ? (
            <div style="padding: 20px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Kemampuan Cicilan Maksimal</div>
                <div style="font-size: 32px; font-weight: 800; color: #10B981;">{formatCurrency(rpc.max_installment)}</div>
                <div style="font-size: 13px; color: #6B7280;">per bulan</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                <div style="padding: 12px; background: #F0FDF4; border-radius: 8px;">
                  <div style="color: #6B7280;">Pendapatan</div>
                  <div style="font-weight: 700; color: #065F46;">{formatCurrency(rpc.monthly_income)}/bln</div>
                </div>
                <div style="padding: 12px; background: #FEF2F2; border-radius: 8px;">
                  <div style="color: #6B7280;">Pengeluaran</div>
                  <div style="font-weight: 700; color: #991B1B;">{formatCurrency(rpc.monthly_expenses)}/bln</div>
                </div>
              </div>
              <div style="margin-top: 12px; padding: 12px; background: #F3F4F6; border-radius: 8px; text-align: center;">
                <div style="font-size: 12px; color: #6B7280;">Sisa Bersih Bulanan</div>
                <div style="font-size: 18px; font-weight: 700; color: #1F2937;">{formatCurrency(rpc.sustainable_disposable_cash)}</div>
              </div>
            </div>
          ) : (
            <div style="padding: 40px; text-align: center; color: #6B7280;">
              <CreditCard size={32} style="color: #D1D5DB; margin-bottom: 8px;" />
              <div>Belum ada data kapasitas</div>
              <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">Ketik "kapasitas" di WhatsApp</div>
            </div>
          )}
        </div>

        {/* Engagement Card */}
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 10px;">
            <MessageCircle size={20} style="color: #2563EB;" />
            <span style="font-size: 15px; font-weight: 600;">Engagement WhatsApp</span>
          </div>
          {eng.total_interactions ? (
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: center; margin-bottom: 16px;">
                <div>
                  <div style="font-size: 32px; font-weight: 800; color: #2563EB;">{eng.total_interactions}</div>
                  <div style="font-size: 11px; color: #6B7280;">Total Interaksi</div>
                </div>
                <div>
                  <div style="font-size: 32px; font-weight: 800; color: #F59E0B;">🔥 {eng.streak_days || 0}</div>
                  <div style="font-size: 11px; color: #6B7280;">Hari Berturut</div>
                </div>
              </div>
              {/* Daily History */}
              {eng.daily_history?.length > 0 && (
                <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #6B7280; margin-bottom: 10px;">Riwayat 5 Hari Terakhir</div>
                  <div style="display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto;">
                    {eng.daily_history.map((day, i) => (
                      <div key={i} style="padding: 10px; background: #F9FAFB; border-radius: 8px; border-left: 3px solid #2563EB;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                          <span style="font-size: 12px; font-weight: 600; color: #374151;">
                            {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span style="font-size: 10px; color: #6B7280; background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">
                            {day.total_actions} aksi
                          </span>
                        </div>
                        <div style="font-size: 11px; color: #4B5563; margin-bottom: 6px; font-style: italic;">
                          💡 {day.ai_summary}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                          {Object.entries(day.activities || {}).map(([type, count]) => (
                            <span key={type} style="padding: 2px 6px; background: #DBEAFE; color: #1E40AF; border-radius: 4px; font-size: 9px;">
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style="padding: 40px; text-align: center; color: #6B7280;">
              <MessageCircle size={32} style="color: #D1D5DB; margin-bottom: 8px;" />
              <div>Belum ada interaksi</div>
              <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">Mulai chat di WhatsApp</div>
            </div>
          )}
        </div>
      </div>

      {/* Literacy Progress */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <BookOpen size={20} style="color: #10B981;" />
            <span style="font-size: 15px; font-weight: 600;">Literasi Keuangan</span>
          </div>
          <span style={`font-size: 14px; font-weight: 700; color: ${litPercent >= 70 ? '#10B981' : litPercent >= 40 ? '#F59E0B' : '#EF4444'};`}>
            {litCompleted}/15 minggu ({litPercent}%)
          </span>
        </div>
        <div style="padding: 20px;">
          <div style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 6px; margin-bottom: 16px;">
            {Array.from({ length: 15 }, (_, i) => {
              const weekNum = i + 1;
              const weekKey = `week_${String(weekNum).padStart(2, '0')}`;
              const score = litData[weekKey]?.score || 0;
              // Completed = green, Current (next after completed) = yellow, Future = gray
              const isCompleted = weekNum <= litCompleted;
              const isCurrent = weekNum === litCompleted + 1 && score > 0;
              const bg = isCompleted ? '#10B981' : isCurrent ? '#F59E0B' : '#E5E7EB';
              const textColor = isCompleted || isCurrent ? 'white' : '#9CA3AF';
              return (
                <div key={i} style={`aspect-ratio: 1; border-radius: 6px; background: ${bg}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: ${textColor};`}>
                  {weekNum}
                </div>
              );
            })}
          </div>
          <div style="display: flex; gap: 16px; font-size: 11px; color: #6B7280;">
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; border-radius: 3px; background: #10B981;" /> Lulus</span>
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; border-radius: 3px; background: #F59E0B;" /> Proses</span>
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; border-radius: 3px; background: #E5E7EB;" /> Belum</span>
          </div>
        </div>
      </div>

      {/* Loan & Business Info (Collapsed) */}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        {/* Loan Summary */}
        <div class="card" style="padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <CreditCard size={18} style="color: #63297A;" />
            <span style="font-size: 14px; font-weight: 600;">Pinjaman</span>
          </div>
          {data.loan?.limit > 0 ? (
            <div>
              <div style="display: grid; gap: 8px; font-size: 13px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Limit</span><span style="font-weight: 600;">{formatCurrency(data.loan.limit)}</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Terpakai</span><span style="font-weight: 600; color: #EF4444;">{formatCurrency(data.loan.used)}</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Sisa</span><span style="font-weight: 600; color: #10B981;">{formatCurrency(data.loan.remaining)}</span></div>
              </div>
              {data.loan.history?.length > 0 && (
                <div style="border-top: 1px solid #E5E7EB; padding-top: 12px;">
                  <div style="font-size: 11px; color: #6B7280; margin-bottom: 8px;">Riwayat Transaksi</div>
                  <div style="max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                    {data.loan.history.slice(-5).reverse().map((h, i) => (
                      <div key={i} style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #F9FAFB; border-radius: 4px; font-size: 11px;">
                        <div>
                          <span style={`color: ${h.type === 'disbursement' ? '#2563EB' : '#10B981'};`}>
                            {h.type === 'disbursement' ? '📥 Pencairan' : '💰 Bayar'}
                          </span>
                          <span style="color: #9CA3AF; margin-left: 6px;">{formatDate(h.date)}</span>
                        </div>
                        <span style={`font-weight: 600; color: ${h.type === 'disbursement' ? '#2563EB' : '#10B981'};`}>
                          {h.type === 'disbursement' ? '+' : '-'}{formatCurrency(Math.abs(h.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style="color: #9CA3AF; font-size: 13px;">Belum ada pinjaman aktif</div>
          )}
        </div>

        {/* Business Info */}
        <div class="card" style="padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <Building2 size={18} style="color: #2563EB;" />
            <span style="font-size: 14px; font-weight: 600;">Usaha</span>
          </div>
          <div style="display: grid; gap: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Nama</span><span style="font-weight: 600;">{data.business?.name || '-'}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Kategori</span><span style="font-weight: 600;">{data.business?.category || '-'}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Level</span><span style="font-weight: 600;">{data.business?.maturity_level || 1}/5</span></div>
          </div>
        </div>
      </div>

      {/* Business Intelligence */}
      {data.business_intelligence?.length > 0 && (
        <div class="card" style="margin-top: 24px; padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 10px;">
            <FileText size={20} style="color: #F59E0B;" />
            <span style="font-size: 15px; font-weight: 600;">Business Intelligence</span>
            <span style="font-size: 11px; color: #6B7280; background: #F3F4F6; padding: 2px 8px; border-radius: 4px;">{data.business_intelligence.length} data</span>
          </div>
          
          {/* Filter Tabs */}
          <div style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; display: flex; gap: 8px; flex-wrap: wrap;">
            {['all', 'ledger', 'building', 'inventory', 'transaction'].map(filter => {
              const labels = { all: '📋 Semua', ledger: '📒 Buku Kas', building: '🏪 Bangunan', inventory: '📦 Inventaris', transaction: '🧾 Transaksi' };
              const count = filter === 'all' ? data.business_intelligence.length : data.business_intelligence.filter(b => b.type === filter).length;
              if (filter !== 'all' && count === 0) return null;
              return (
                <button
                  key={filter}
                  onClick={() => setBiFilter(filter)}
                  style={`padding: 6px 12px; border-radius: 6px; font-size: 12px; border: none; cursor: pointer; transition: all 0.2s; ${biFilter === filter ? 'background: #63297A; color: white;' : 'background: #F3F4F6; color: #374151;'}`}
                >
                  {labels[filter]} ({count})
                </button>
              );
            })}
          </div>
          
          <div style="padding: 16px; display: grid; gap: 16px; max-height: 600px; overflow-y: auto;">
            {data.business_intelligence
              .filter(bi => biFilter === 'all' || bi.type === biFilter)
              .map((bi, i) => {
              const typeConfig = {
                ledger: { icon: '📒', label: 'Buku Kas', color: '#2563EB', bg: '#EFF6FF' },
                inventory: { icon: '📦', label: 'Inventaris', color: '#10B981', bg: '#ECFDF5' },
                building: { icon: '🏪', label: 'Bangunan', color: '#F59E0B', bg: '#FFFBEB' },
                transaction: { icon: '🧾', label: 'Transaksi', color: '#8B5CF6', bg: '#F5F3FF' },
              };
              const cfg = typeConfig[bi.type] || { icon: '📄', label: bi.type, color: '#6B7280', bg: '#F3F4F6' };
              const d = bi.data || {};
              
              return (
                <div key={i} style={`background: ${cfg.bg}; border-radius: 10px; border: 1px solid ${cfg.color}20; overflow: hidden;`}>
                  {/* Header */}
                  <div style={`padding: 10px 14px; background: ${cfg.color}15; display: flex; justify-content: space-between; align-items: center;`}>
                    <span style="font-weight: 600; font-size: 13px;">{cfg.icon} {cfg.label}</span>
                    <span style="font-size: 10px; color: #6B7280;">{formatDate(bi.analyzed_at)}</span>
                  </div>
                  
                  {/* Content: Image left, Analysis right */}
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
                    {/* Left: Image + Caption */}
                    <div style="padding: 12px; border-right: 1px solid #E5E7EB;">
                      {bi.source?.image_url ? (
                        <div>
                          <img 
                            src={bi.source.image_url} 
                            alt={cfg.label} 
                            style="width: 100%; height: auto; border-radius: 6px; display: block;" 
                          />
                          {bi.source?.caption && (
                            <div style="margin-top: 8px; font-size: 11px; color: #6B7280; font-style: italic;">
                              "{bi.source.caption}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style="height: 120px; display: flex; align-items: center; justify-content: center; background: #F9FAFB; border-radius: 6px; color: #9CA3AF; font-size: 12px;">
                          No image
                        </div>
                      )}
                    </div>
                    
                    {/* Right: Analysis */}
                    <div style="padding: 12px; font-size: 12px;">
                      {bi.type === 'ledger' && (
                        <div style="display: grid; gap: 6px;">
                          <div>📈 Pendapatan: <strong style="color: #10B981;">{formatCurrency(d.daily_income_estimate)}/hari</strong></div>
                          <div>📉 Pengeluaran: <strong style="color: #EF4444;">{formatCurrency(d.daily_expense_estimate)}/hari</strong></div>
                          <div>💰 Profit: <strong>{formatCurrency(d.daily_profit_estimate)}/hari</strong></div>
                          <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #D1D5DB; font-size: 11px; color: #6B7280;">
                            Kualitas: {d.record_quality}<br/>Literasi: {d.literacy_indicator}/10
                          </div>
                        </div>
                      )}
                      
                      {bi.type === 'inventory' && (
                        <div style="display: grid; gap: 6px;">
                          <div>📦 Total: <strong>{d.total_items_count}</strong> ({d.stock_level})</div>
                          <div>💵 Nilai: <strong>{formatCurrency(d.inventory_value_estimate)}</strong></div>
                          <div style="font-size: 11px; color: #6B7280;">Variasi: {d.variety_score}/10 • Perputaran: {d.turnover_indicator}</div>
                          {d.items?.length > 0 && (
                            <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #D1D5DB;">
                              <div style="font-size: 10px; color: #6B7280; margin-bottom: 4px;">Items:</div>
                              {d.items.slice(0, 5).map((item, j) => (
                                <div key={j} style="font-size: 11px;">• {item.name}: {item.quantity_estimate} {item.unit}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {bi.type === 'building' && (
                        <div style="display: grid; gap: 6px;">
                          <div>🏠 Tipe: <strong>{d.building_type}</strong></div>
                          <div>📐 Ukuran: <strong>{d.size_estimate}</strong></div>
                          <div>📍 Lokasi: <strong>{d.location_type}</strong></div>
                          <div>💰 Nilai: <strong>{formatCurrency(d.estimated_value)}</strong></div>
                          <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #D1D5DB; font-size: 11px; color: #6B7280;">
                            Kondisi: {d.condition}<br/>Visibilitas: {d.visibility}<br/>Skor Strategis: {d.strategic_score}/10
                          </div>
                        </div>
                      )}
                      
                      {bi.type === 'transaction' && (
                        <div style="display: grid; gap: 6px;">
                          <div>🧾 Jumlah: <strong>{d.transaction_count} transaksi</strong></div>
                          <div>💵 Total: <strong>{formatCurrency(d.total_amount)}</strong></div>
                          {d.transactions?.length > 0 && (
                            <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #D1D5DB; font-size: 11px;">
                              {d.transactions.slice(0, 3).map((t, j) => (
                                <div key={j} style="color: #6B7280;">{t.items?.join(', ')} - {formatCurrency(t.total)}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Location Map */}
      <div class="card" style="margin-top: 24px; padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <MapPin size={20} style="color: #63297A;" />
            <span style="font-size: 15px; font-weight: 600;">Lokasi</span>
          </div>
          <div style="display: flex; gap: 12px; font-size: 11px;">
            <span style="display: flex; align-items: center; gap: 4px;">🏠 <span style="color: #2563EB;">Rumah</span></span>
            <span style="display: flex; align-items: center; gap: 4px;">🏪 <span style="color: #10B981;">Usaha</span></span>
          </div>
        </div>
        <div id="user-location-map" style="height: 280px;" />
      </div>
    </div>
  );
}
