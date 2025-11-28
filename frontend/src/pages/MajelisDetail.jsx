import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Calendar, MapPin, Clock, Users, UserCheck, UserX, ChevronLeft, Plus, Save, FileText, Shield, AlertTriangle, TrendingUp, Award, Home, Building2 } from 'lucide-preact';

const API_BASE = '/api';

// Mock coordinates around Jakarta area for demo
const generateMockCoords = (seed, isHome = true) => {
  const base = { lat: -6.2088, lng: 106.8456 }; // Jakarta
  const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const offset = isHome ? 0.01 : 0.02;
  return {
    lat: base.lat + ((hash % 100) - 50) * offset / 50,
    lng: base.lng + ((hash * 7 % 100) - 50) * offset / 50
  };
};

// Generate mock group risk profile
const generateGroupRiskProfile = (members, attendance, majelis) => {
  const seed = majelis?.id || 'default';
  const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  
  const avgAttendance = attendance.length > 0 
    ? attendance.reduce((sum, w) => sum + (w.attendees.length / w.total), 0) / attendance.length * 100 
    : 75;
  
  const memberScores = members.map(m => {
    const mHash = (m.phone || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 600 + (mHash % 200);
  });
  const avgCreditScore = memberScores.length > 0 ? Math.round(memberScores.reduce((a, b) => a + b, 0) / memberScores.length) : 680;
  
  return {
    groupScore: Math.round(avgCreditScore * 0.4 + avgAttendance * 3 + (hash % 50)),
    avgMemberScore: avgCreditScore,
    attendanceRate: Math.round(avgAttendance),
    paymentRate: 85 + (hash % 12),
    fieldAgentScore: 70 + (hash % 25),
    riskLevel: avgCreditScore >= 700 && avgAttendance >= 80 ? 'Low' : avgCreditScore >= 600 ? 'Medium' : 'High',
    factors: [
      { name: 'Payment Compliance', score: 85 + (hash % 12), weight: 30 },
      { name: 'Attendance Rate', score: Math.round(avgAttendance), weight: 25 },
      { name: 'Member Credit Avg', score: Math.round((avgCreditScore - 300) / 5.5), weight: 20 },
      { name: 'Field Agent Rating', score: 70 + (hash % 25), weight: 15 },
      { name: 'Group Tenure', score: 60 + (hash % 35), weight: 10 },
    ],
    fieldAgent: {
      name: 'Budi Santoso',
      rating: (3.5 + (hash % 15) / 10).toFixed(1),
      groupsManaged: 5 + (hash % 8),
      avgCollection: 92 + (hash % 6),
    }
  };
};

export default function MajelisDetail({ id }) {
  const [majelis, setMajelis] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [newWeek, setNewWeek] = useState({ date: '', attendees: [], notes: '' });
  const [riskProfile, setRiskProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const majelisRes = await fetch(`${API_BASE}/majelis/${id}`);
      const majelisData = await majelisRes.json();
      setMajelis(majelisData);

      let memberDetails = [];
      if (majelisData.members?.length > 0) {
        const usersRes = await fetch(`${API_BASE}/users`);
        const allUsers = await usersRes.json();
        memberDetails = majelisData.members.map(phone => {
          const user = allUsers.find(u => u.phone === phone) || { phone, name: phone };
          const homeCoords = user.profile?.home_lat ? { lat: user.profile.home_lat, lng: user.profile.home_lng } : generateMockCoords(phone, true);
          const bizCoords = user.business?.business_lat ? { lat: user.business.business_lat, lng: user.business.business_lng } : generateMockCoords(phone, false);
          return { ...user, homeCoords, bizCoords };
        });
        setMembers(memberDetails);
      }

      const attendanceData = majelisData.attendance || generateMockAttendance(majelisData.members || []);
      setAttendance(attendanceData);
      setRiskProfile(generateGroupRiskProfile(memberDetails, attendanceData, majelisData));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generateMockAttendance = (memberPhones) => {
    const weeks = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      const attendees = memberPhones.filter(() => Math.random() > 0.2); // 80% attendance
      weeks.push({
        id: `week_${i}`,
        date: date.toISOString().split('T')[0],
        attendees,
        total: memberPhones.length,
        notes: i === 0 ? 'Pertemuan terakhir berjalan lancar' : ''
      });
    }
    return weeks;
  };

  const toggleAttendee = (phone) => {
    setNewWeek(prev => ({
      ...prev,
      attendees: prev.attendees.includes(phone)
        ? prev.attendees.filter(p => p !== phone)
        : [...prev.attendees, phone]
    }));
  };

  const saveNewWeek = async () => {
    if (!newWeek.date) return alert('Pilih tanggal');
    
    const weekData = {
      id: `week_${Date.now()}`,
      date: newWeek.date,
      attendees: newWeek.attendees,
      total: members.length,
      notes: newWeek.notes
    };
    
    // In production, save to Firestore
    setAttendance(prev => [...prev, weekData]);
    setShowAddWeek(false);
    setNewWeek({ date: '', attendees: [], notes: '' });
  };

  if (loading) return <div style="padding: 20px;">Loading...</div>;
  if (!majelis) return <div style="padding: 20px;">Majelis not found</div>;

  const getRiskColor = (level) => level === 'Low' ? '#10B981' : level === 'Medium' ? '#F59E0B' : '#EF4444';

  // Calculate member attendance stats
  const getMemberAttendance = (phone) => {
    const attended = attendance.filter(w => w.attendees.includes(phone)).length;
    return { attended, total: attendance.length, rate: attendance.length > 0 ? Math.round(attended / attendance.length * 100) : 0 };
  };

  return (
    <div style="padding: 20px; max-width: 1400px; margin: 0 auto;">
      <a href="/majelis" style="display: inline-flex; align-items: center; gap: 4px; color: #666; text-decoration: none; margin-bottom: 16px;">
        <ChevronLeft size={20} /> Kembali ke Daftar Majelis
      </a>

      {/* Header */}
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
              <Users size={28} /> {majelis.name}
            </h1>
            <p style="color: #666; margin: 0;">{majelis.description || 'Tidak ada deskripsi'}</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            {riskProfile && (
              <span style={`padding: 6px 12px; background: ${getRiskColor(riskProfile.riskLevel)}15; color: ${getRiskColor(riskProfile.riskLevel)}; border-radius: 6px; font-size: 13px; font-weight: 600;`}>
                {riskProfile.riskLevel} Risk
              </span>
            )}
            {majelis.is_mock && <span style="padding: 4px 8px; background: #9e9e9e; color: white; border-radius: 4px; font-size: 12px;">MOCK</span>}
          </div>
        </div>
        <div style="display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; color: #666;"><Calendar size={18} /> {majelis.schedule_day || '-'}</div>
          <div style="display: flex; align-items: center; gap: 8px; color: #666;"><Clock size={18} /> {majelis.schedule_time || '-'}</div>
          <div style="display: flex; align-items: center; gap: 8px; color: #666;"><MapPin size={18} /> {majelis.location || '-'}</div>
          <div style="display: flex; align-items: center; gap: 8px; color: #666;"><Users size={18} /> {members.length} anggota</div>
        </div>
      </div>

      {/* Group Risk Profile Dashboard */}
      {riskProfile && (
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 4px; height: 32px; background: linear-gradient(180deg, #63297A 0%, #F9CF79 100%); border-radius: 2px;" />
            <h2 style="margin: 0; font-size: 20px; color: #1F2937;">Group Risk Assessment</h2>
            <span style="background: #FEF3C7; color: #92400E; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">MOCK DATA</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
            <div class="card" style="text-align: center; padding: 20px;">
              <div style={`font-size: 36px; font-weight: 800; color: ${getRiskColor(riskProfile.riskLevel)};`}>{riskProfile.groupScore}</div>
              <div style="font-size: 12px; color: #6B7280;">Group Score</div>
            </div>
            <div class="card" style="text-align: center; padding: 20px;">
              <div style="font-size: 36px; font-weight: 800; color: #63297A;">{riskProfile.avgMemberScore}</div>
              <div style="font-size: 12px; color: #6B7280;">Avg Credit Score</div>
            </div>
            <div class="card" style="text-align: center; padding: 20px;">
              <div style="font-size: 36px; font-weight: 800; color: #2563EB;">{riskProfile.attendanceRate}%</div>
              <div style="font-size: 12px; color: #6B7280;">Attendance Rate</div>
            </div>
            <div class="card" style="text-align: center; padding: 20px;">
              <div style="font-size: 36px; font-weight: 800; color: #10B981;">{riskProfile.paymentRate}%</div>
              <div style="font-size: 12px; color: #6B7280;">Payment Rate</div>
            </div>
          </div>

          {/* Group Risk Insight */}
          <div class="so-what-box" style="margin-bottom: 20px;">
            <div class="so-what-title">💡 Group Assessment</div>
            <div class="so-what-text">
              {riskProfile.riskLevel === 'Low' ? (
                <>This majelis demonstrates <strong>strong group cohesion</strong> with high attendance and payment compliance. The peer accountability model is working effectively — members support each other's financial success.</>
              ) : riskProfile.riskLevel === 'Medium' ? (
                <>Moderate group performance with <strong>room for improvement</strong>. Focus on increasing attendance rates and addressing any members with payment delays. Consider additional field agent engagement.</>
              ) : (
                <><strong>Attention required.</strong> This group shows elevated risk indicators. Recommend closer monitoring, individual member assessments, and potential restructuring of meeting schedules.</>
              )}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="card" style="padding: 20px;">
              <h3 style="margin: 0 0 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;"><Shield size={18} /> Risk Factors</h3>
              <div style="display: grid; gap: 12px;">
                {riskProfile.factors.map((f, i) => {
                  const color = f.score >= 80 ? '#10B981' : f.score >= 60 ? '#F59E0B' : '#EF4444';
                  return (
                    <div key={i}>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 13px; color: #374151;">{f.name}</span>
                        <span style="font-size: 13px; font-weight: 600;">{f.score}%</span>
                      </div>
                      <div style="height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden;">
                        <div style={`height: 100%; width: ${f.score}%; background: ${color}; border-radius: 3px;`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div class="card" style="padding: 20px;">
              <h3 style="margin: 0 0 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;"><Award size={18} /> Field Agent</h3>
              <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #63297A 0%, #7E3D99 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: 700;">
                  {riskProfile.fieldAgent.name.charAt(0)}
                </div>
                <div>
                  <div style="font-size: 15px; font-weight: 600; color: #1F2937;">{riskProfile.fieldAgent.name}</div>
                  <div style="font-size: 12px; color: #6B7280;">Field Agent</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <div style="text-align: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
                  <div style="font-size: 18px; font-weight: 700; color: #F59E0B;">⭐ {riskProfile.fieldAgent.rating}</div>
                  <div style="font-size: 10px; color: #6B7280;">Rating</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
                  <div style="font-size: 18px; font-weight: 700; color: #63297A;">{riskProfile.fieldAgent.groupsManaged}</div>
                  <div style="font-size: 10px; color: #6B7280;">Groups</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
                  <div style="font-size: 18px; font-weight: 700; color: #10B981;">{riskProfile.fieldAgent.avgCollection}%</div>
                  <div style="font-size: 10px; color: #6B7280;">Collection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      <div class="card" style="margin-bottom: 24px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 15px; display: flex; align-items: center; gap: 8px;"><MapPin size={18} /> Member Locations</h3>
          <div style="display: flex; gap: 12px; font-size: 11px;">
            <span style="display: flex; align-items: center; gap: 4px;"><Home size={12} style="color: #2563EB;" /> Home</span>
            <span style="display: flex; align-items: center; gap: 4px;"><Building2 size={12} style="color: #10B981;" /> Business</span>
            <span style="display: flex; align-items: center; gap: 4px;"><Users size={12} style="color: #63297A;" /> Meeting</span>
          </div>
        </div>
        <div style="position: relative; background: linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 50%, #D1FAE5 100%); border-radius: 12px; height: 280px; overflow: hidden;">
          <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px); background-size: 40px 40px;" />
          {members.map((m, i) => {
            const homeX = 15 + ((m.homeCoords.lng + 107) * 300) % 65 + i * 6;
            const homeY = 15 + ((m.homeCoords.lat + 7) * 300) % 55 + i * 5;
            const bizX = homeX + 8 + (i % 3) * 5;
            const bizY = homeY + 8 + (i % 2) * 8;
            return (
              <div key={m.phone}>
                <div style={`position: absolute; left: ${homeX}%; top: ${homeY}%; transform: translate(-50%, -50%);`} title={`${m.name} - Home`}>
                  <div style="width: 24px; height: 24px; background: #2563EB; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 6px rgba(37,99,235,0.4); border: 2px solid white;">
                    <Home size={10} />
                  </div>
                </div>
                <div style={`position: absolute; left: ${bizX}%; top: ${bizY}%; transform: translate(-50%, -50%);`} title={`${m.name} - Business`}>
                  <div style="width: 20px; height: 20px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 6px rgba(16,185,129,0.4); border: 2px solid white;">
                    <Building2 size={8} />
                  </div>
                </div>
              </div>
            );
          })}
          <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
            <div style="width: 36px; height: 36px; background: #63297A; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(99,41,122,0.4); border: 3px solid white;">
              <Users size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Members & Attendance - Merged Compact View */}
      <div class="card" style="margin-bottom: 20px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 15px; display: flex; align-items: center; gap: 8px;"><Users size={18} /> Members & Attendance</h3>
          <button onClick={() => setShowAddWeek(true)} style="padding: 6px 12px; background: #63297A; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 12px;">
            <Plus size={14} /> Add Week
          </button>
        </div>

        {members.length === 0 ? (
          <p style="color: #666;">Belum ada anggota</p>
        ) : (
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 2px solid #E5E7EB;">
                  <th style="text-align: left; padding: 8px 12px; font-weight: 600; color: #374151;">Member</th>
                  <th style="text-align: center; padding: 8px 6px; font-weight: 600; color: #374151; width: 70px;">Rate</th>
                  {attendance.slice(-5).map((w, i) => (
                    <th key={i} style="text-align: center; padding: 8px 4px; font-weight: 500; color: #6B7280; font-size: 11px; width: 50px;">
                      {new Date(w.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const stats = getMemberAttendance(m.phone);
                  const rateColor = stats.rate >= 80 ? '#10B981' : stats.rate >= 60 ? '#F59E0B' : '#EF4444';
                  return (
                    <tr key={m.phone} style="border-bottom: 1px solid #F3F4F6;">
                      <td style="padding: 10px 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <div style="width: 32px; height: 32px; background: #63297A; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px; flex-shrink: 0;">
                            {m.name?.[0] || '?'}
                          </div>
                          <div style="min-width: 0;">
                            <div style="font-weight: 500; color: #1F2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{m.name || 'Unknown'}</div>
                            <div style="font-size: 11px; color: #9CA3AF;">{m.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style="text-align: center; padding: 8px 6px;">
                        <span style={`padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${rateColor}15; color: ${rateColor};`}>
                          {stats.rate}%
                        </span>
                      </td>
                      {attendance.slice(-5).map((w, i) => {
                        const attended = w.attendees.includes(m.phone);
                        return (
                          <td key={i} style="text-align: center; padding: 8px 4px;">
                            {attended ? (
                              <UserCheck size={16} style="color: #10B981;" />
                            ) : (
                              <UserX size={16} style="color: #EF4444;" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style="background: #F9FAFB;">
                  <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Weekly Total</td>
                  <td style="text-align: center; padding: 8px 6px; font-weight: 600; color: #63297A;">{riskProfile?.attendanceRate || 0}%</td>
                  {attendance.slice(-5).map((w, i) => {
                    const rate = w.total > 0 ? Math.round(w.attendees.length / w.total * 100) : 0;
                    const color = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';
                    return (
                      <td key={i} style="text-align: center; padding: 8px 4px;">
                        <span style={`font-size: 11px; font-weight: 600; color: ${color};`}>{rate}%</span>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      {showAddWeek && (
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
          <div style="background: white; padding: 24px; border-radius: 8px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin: 0 0 16px 0;">Tambah Kehadiran Minggu Ini</h3>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Tanggal</label>
              <input 
                type="date" 
                value={newWeek.date}
                onChange={(e) => setNewWeek(prev => ({ ...prev, date: e.target.value }))}
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                Kehadiran ({newWeek.attendees.length}/{members.length})
              </label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                {members.map(m => (
                  <label 
                    key={m.phone}
                    style="display: flex; align-items: center; gap: 8px; padding: 8px; background: newWeek.attendees.includes(m.phone) ? '#e8f5e9' : '#f5f5f5'; border-radius: 4px; cursor: pointer;"
                  >
                    <input 
                      type="checkbox"
                      checked={newWeek.attendees.includes(m.phone)}
                      onChange={() => toggleAttendee(m.phone)}
                    />
                    <span>{m.name || m.phone}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Catatan</label>
              <textarea 
                value={newWeek.notes}
                onChange={(e) => setNewWeek(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan pertemuan minggu ini..."
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 80px;"
              />
            </div>

            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button 
                onClick={() => setShowAddWeek(false)}
                style="padding: 8px 16px; background: #f5f5f5; border: none; border-radius: 4px; cursor: pointer;"
              >
                Batal
              </button>
              <button 
                onClick={saveNewWeek}
                style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
              >
                <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
