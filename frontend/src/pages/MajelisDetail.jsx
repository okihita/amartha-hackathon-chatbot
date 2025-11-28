import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Calendar, MapPin, Clock, Users, UserCheck, UserX, ChevronLeft, Plus, Save, FileText } from 'lucide-preact';

const API_BASE = '/api';

export default function MajelisDetail({ id }) {
  const [majelis, setMajelis] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [newWeek, setNewWeek] = useState({ date: '', attendees: [], notes: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch majelis
      const majelisRes = await fetch(`${API_BASE}/majelis/${id}`);
      const majelisData = await majelisRes.json();
      setMajelis(majelisData);

      // Fetch member details
      if (majelisData.members?.length > 0) {
        const usersRes = await fetch(`${API_BASE}/users`);
        const allUsers = await usersRes.json();
        const memberDetails = majelisData.members.map(phone => 
          allUsers.find(u => u.phone === phone) || { phone, name: phone }
        );
        setMembers(memberDetails);
      }

      // Fetch attendance (mock for now - would be from Firestore subcollection)
      setAttendance(majelisData.attendance || generateMockAttendance(majelisData.members || []));
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

  return (
    <div style="padding: 20px;">
      {/* Back button */}
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
          {majelis.is_mock && <span style="padding: 4px 8px; background: #9e9e9e; color: white; border-radius: 4px; font-size: 12px;">MOCK</span>}
        </div>
        
        <div style="display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <Calendar size={18} /> {majelis.schedule_day || '-'}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <Clock size={18} /> {majelis.schedule_time || '-'}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <MapPin size={18} /> {majelis.location || '-'}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <Users size={18} /> {members.length} anggota
          </div>
        </div>
      </div>

      {/* Members */}
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0;">👥 Daftar Anggota</h2>
        {members.length === 0 ? (
          <p style="color: #666;">Belum ada anggota</p>
        ) : (
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
            {members.map(m => (
              <div key={m.phone} style="padding: 12px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                <div style="width: 36px; height: 36px; background: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #2196f3;">
                  {m.name?.[0] || '?'}
                </div>
                <div>
                  <div style="font-weight: 500;">{m.name || 'Unknown'}</div>
                  <div style="font-size: 12px; color: #666;">{m.phone}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;"><Calendar size={20} /> Riwayat Kehadiran</h2>
          <button 
            onClick={() => setShowAddWeek(true)}
            style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
          >
            <Plus size={16} /> Tambah Minggu
          </button>
        </div>

        {attendance.length === 0 ? (
          <p style="color: #666;">Belum ada data kehadiran</p>
        ) : (
          <div style="display: flex; flex-direction: column; gap: 12px;">
            {[...attendance].reverse().map(week => {
              const attendanceRate = week.total > 0 ? Math.round((week.attendees.length / week.total) * 100) : 0;
              const rateColor = attendanceRate >= 80 ? '#4caf50' : attendanceRate >= 50 ? '#ff9800' : '#f44336';
              
              return (
                <div key={week.id} style={{padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: `4px solid ${rateColor}`}}>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-weight: 500;">
                      {new Date(week.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style={`padding: 4px 8px; background: ${rateColor}; color: white; border-radius: 4px; font-size: 12px; font-weight: bold;`}>
                        {attendanceRate}%
                      </span>
                      <span style="color: #666; font-size: 14px;">
                        {week.attendees.length}/{week.total} hadir
                      </span>
                    </div>
                  </div>
                  
                  {/* Attendee list */}
                  <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
                    {members.map(m => {
                      const attended = week.attendees.includes(m.phone);
                      return (
                        <span 
                          key={m.phone}
                          style={{
                            padding: '4px 8px',
                            background: attended ? '#e8f5e9' : '#ffebee',
                            color: attended ? '#2e7d32' : '#c62828',
                            borderRadius: '4px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {attended ? <UserCheck size={12} /> : <UserX size={12} />}
                          {m.name?.split(' ')[0] || m.phone.slice(-4)}
                        </span>
                      );
                    })}
                  </div>
                  
                  {week.notes && (
                    <div style="font-size: 13px; color: #666; font-style: italic; display: flex; align-items: center; gap: 4px;">
                      <FileText size={12} /> {week.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Week Modal */}
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
