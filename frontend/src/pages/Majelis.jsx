import { useState, useEffect } from 'preact/hooks';

export default function Majelis() {
  const [majelis, setMajelis] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_day: '',
    schedule_time: '10:00',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [majelisRes, usersRes] = await Promise.all([
        fetch('/api/majelis'),
        fetch('/api/users')
      ]);
      setMajelis(await majelisRes.json());
      setUsers(await usersRes.json());
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/majelis/${editingId}` : '/api/majelis';
      const method = editingId ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', schedule_day: '', schedule_time: '10:00', location: '' });
      fetchData();
    } catch (error) {
      alert('Failed to save majelis');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await fetch(`/api/majelis/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Failed to delete majelis');
    }
  };

  if (loading) return <div class="loading">Loading...</div>;

  return (
    <>
      <div class="card">
        <div class="card-header-actions">
          <h2>Majelis Groups</h2>
          <button class="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Majelis</button>
        </div>
        
        <div class="majelis-grid">
          {majelis.length === 0 ? (
            <div class="empty-state"><p>No majelis yet. Create one!</p></div>
          ) : (
            majelis.map(m => {
              const memberCount = m.members?.length || 0;
              return (
                <div key={m.id} class="majelis-card">
                  <h3>{m.name}</h3>
                  <div class="info-row">
                    <span>📅 {m.schedule_day} {m.schedule_time}</span>
                    <span>📍 {m.location || 'No location'}</span>
                  </div>
                  {m.description && <p class="majelis-description">{m.description}</p>}
                  <div class="member-count">👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</div>
                  <div class="member-list">
                    {memberCount === 0 ? (
                      <div class="no-members">📭 No members yet</div>
                    ) : (
                      m.members.map(phone => {
                        const user = users.find(u => u.phone === phone);
                        return (
                          <div key={phone} class="member-item-inline">
                            <span class="member-name">{user?.name || phone}</span>
                            {user && <span class="member-details"> • {user.business_type}</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div class="actions">
                    <button class="btn btn-secondary" onClick={() => {
                      setEditingId(m.id);
                      setFormData(m);
                      setShowModal(true);
                    }}>Edit</button>
                    <button class="btn btn-danger" onClick={() => handleDelete(m.id, m.name)}>Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <div class="modal active">
          <div class="modal-content">
            <h2>{editingId ? 'Edit' : 'Create'} Majelis</h2>
            <form onSubmit={handleSubmit}>
              <div class="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onInput={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description}
                  onInput={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div class="form-group">
                <label>Schedule Day *</label>
                <select 
                  value={formData.schedule_day}
                  onChange={(e) => setFormData({...formData, schedule_day: e.target.value})}
                  required
                >
                  <option value="">Select day</option>
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>
              <div class="form-group">
                <label>Schedule Time</label>
                <input 
                  type="time" 
                  value={formData.schedule_time}
                  onInput={(e) => setFormData({...formData, schedule_time: e.target.value})}
                />
              </div>
              <div class="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onInput={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '', schedule_day: '', schedule_time: '10:00', location: '' });
                }}>Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
