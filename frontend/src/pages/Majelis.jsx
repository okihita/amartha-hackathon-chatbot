import { useState, useEffect } from 'preact/hooks';
import { Plus, Edit2, Trash2, X, UserPlus, Calendar, MapPin, Users as UsersIcon, Dice5, Trash } from 'lucide-preact';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useFeedback } from '../hooks/useFeedback';
import { userApi, majelisApi, superadminApi } from '../services/api';

export default function Majelis() {
  const [majelis, setMajelis] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_day: '',
    schedule_time: '10:00',
    location: ''
  });
  const [addMemberModal, setAddMemberModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [processing, setProcessing] = useState(null);
  const { toast, confirmDialog, showToast, showConfirm, clearToast } = useFeedback();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || !addMemberModal) {
      setFilteredUsers([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const currentMajelis = majelis.find(m => m.id === addMemberModal);
    const currentMembers = currentMajelis?.members || [];
    
    const available = users.filter(u => 
      u.status === 'active' && 
      !currentMembers.includes(u.phone) &&
      !u.majelis_id
    );
    
    const matches = available.filter(u => 
      u.name?.toLowerCase().includes(query) || 
      u.phone?.includes(query)
    ).slice(0, 5);
    
    setFilteredUsers(matches);
  }, [searchQuery, users, addMemberModal, majelis]);

  const fetchData = async () => {
    try {
      const [majelisData, usersData] = await Promise.all([
        majelisApi.getAll(),
        userApi.getAll()
      ]);
      setMajelis(majelisData);
      setUsers(usersData);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await majelisApi.update(editingId, formData);
      } else {
        await majelisApi.create(formData);
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', schedule_day: '', schedule_time: '10:00', location: '' });
      fetchData();
      showToast(`Majelis ${editingId ? 'updated' : 'created'} successfully`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirm({
      title: 'Delete Majelis',
      message: `Are you sure you want to delete "${name}"?`
    });
    if (!confirmed) return;
    
    try {
      await majelisApi.delete(id);
      fetchData();
      showToast('Majelis deleted successfully');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleAddMember = async (majelisId, phone) => {
    try {
      await majelisApi.addMember(majelisId, phone);
      setAddMemberModal(null);
      setSearchQuery('');
      fetchData();
      showToast('Member added successfully');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleRemoveMember = async (majelisId, phone) => {
    const user = users.find(u => u.phone === phone);
    const confirmed = await showConfirm({
      title: 'Remove Member',
      message: `Remove ${user?.name || phone} from this majelis?`,
      confirmText: 'Remove'
    });
    
    if (!confirmed) return;
    
    try {
      await majelisApi.removeMember(majelisId, phone);
      fetchData();
      showToast('Member removed successfully');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handlePopulateMock = async () => {
    const confirmed = await showConfirm({
      title: 'Populate Mock Majelis',
      message: 'This will create 3 mock majelis groups. Continue?',
      confirmText: 'Populate',
      type: 'primary'
    });
    
    if (!confirmed) return;
    
    setProcessing('mock');
    try {
      await superadminApi.populateMockMajelis();
      fetchData();
      showToast('Mock majelis populated!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteAllMock = async () => {
    setProcessing('delete-all');
    try {
      await superadminApi.deleteAllMockMajelis();
      fetchData();
      showToast('All mock majelis deleted!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <div class="card">
        {/* Stats Summary */}
        {majelis.length > 0 && (
          <div class="stats-grid" style="margin-bottom: 20px;">
            <div class="stat-card">
              <div class="stat-value">{majelis.length}</div>
              <div class="stat-label">Total Groups</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #63297A;">{majelis.reduce((sum, m) => sum + (m.members?.length || 0), 0)}</div>
              <div class="stat-label">Total Members</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #10B981;">{(majelis.reduce((sum, m) => sum + (m.members?.length || 0), 0) / Math.max(majelis.length, 1)).toFixed(1)}</div>
              <div class="stat-label">Avg per Group</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #2563EB;">{majelis.filter(m => (m.members?.length || 0) >= 5).length}</div>
              <div class="stat-label">Active (5+ members)</div>
            </div>
          </div>
        )}

        <div class="card-header-actions">
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <UsersIcon size={24} /> Majelis Groups
          </h2>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Majelis
            </button>
            <button 
              class="btn btn-secondary" 
              onClick={handlePopulateMock}
              disabled={processing === 'mock'}
            >
              <Dice5 size={16} /> Populate Mock
            </button>
            <button 
              class="btn btn-danger" 
              onClick={handleDeleteAllMock}
              disabled={processing === 'delete-all'}
            >
              <Trash size={16} /> Delete All Mock
            </button>
          </div>
        </div>
        
        <div class="majelis-grid">
          {majelis.length === 0 ? (
            <div class="empty-state"><p>No majelis yet. Create one!</p></div>
          ) : (
            majelis.map(m => {
              const memberCount = m.members?.length || 0;
              return (
                <div key={m.id} class="majelis-card">
                  <a href={`/majelis/${m.id}`} style="text-decoration: none; color: inherit;">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                      {m.name}
                      {m.is_mock && <span style="padding: 2px 6px; background: #9e9e9e; color: white; border-radius: 4px; font-size: 10px;">MOCK</span>}
                    </h3>
                    <div class="info-row">
                      <span><Calendar size={14} /> {m.schedule_day} {m.schedule_time}</span>
                      <span><MapPin size={14} /> {m.location || 'No location'}</span>
                    </div>
                    {m.description && <p class="majelis-description">{m.description}</p>}
                  </a>
                  
                  <div class="member-section">
                    <div class="member-header">
                      <span class="member-count"><UsersIcon size={14} /> {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                      <button class="btn btn-primary btn-icon" onClick={() => setAddMemberModal(m.id)} title="Add member">
                        <UserPlus size={14} />
                      </button>
                    </div>
                    
                    {memberCount === 0 ? (
                      <div class="no-members">No members yet. Click + to add.</div>
                    ) : (
                      <div class="member-list">
                        {m.members.map(phone => {
                          const user = users.find(u => u.phone === phone);
                          return (
                            <div key={phone} class="member-item">
                              <div class="member-info">
                                <div class="member-name">{user?.name || phone}</div>
                                {user && <div class="member-business">{user.business_type}</div>}
                              </div>
                              <button 
                                class="btn-remove" 
                                onClick={() => handleRemoveMember(m.id, phone)}
                                title="Remove member"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div class="actions">
                    <button class="btn btn-secondary" onClick={() => {
                      setEditingId(m.id);
                      setFormData(m);
                      setShowModal(true);
                    }}>
                      <Edit2 size={14} /> <span class="btn-text">Edit</span>
                    </button>
                    <button class="btn btn-danger" onClick={() => handleDelete(m.id, m.name)}>
                      <Trash2 size={14} /> <span class="btn-text">Delete</span>
                    </button>
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

      {addMemberModal && (
        <div class="modal active" onClick={(e) => {
          if (e.target.className === 'modal active') {
            setAddMemberModal(null);
            setSearchQuery('');
          }
        }}>
          <div class="modal-content modal-sm">
            <h2>Add Member</h2>
            <div class="form-group">
              <label>Search by name or phone</label>
              <input 
                type="text" 
                value={searchQuery}
                onInput={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                autoFocus
              />
              {filteredUsers.length > 0 && (
                <div class="autocomplete-results">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.phone} 
                      class="autocomplete-item"
                      onClick={() => handleAddMember(addMemberModal, user.phone)}
                    >
                      <div class="autocomplete-name">{user.name}</div>
                      <div class="autocomplete-details">{user.phone} • {user.business?.category || user.business_type || '-'}</div>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery && filteredUsers.length === 0 && (
                <div class="autocomplete-empty">No verified users found</div>
              )}
            </div>
            
            {/* Show eligible members when not searching */}
            {!searchQuery && (() => {
              const currentMajelis = majelis.find(m => m.id === addMemberModal);
              const currentMembers = currentMajelis?.members || [];
              const eligible = users.filter(u => 
                u.status === 'active' && 
                !currentMembers.includes(u.phone) &&
                !u.majelis_id
              ).slice(0, 10);
              
              return eligible.length > 0 ? (
                <div style="margin-top: 16px;">
                  <label style="font-size: 12px; color: #666; margin-bottom: 8px; display: block;">
                    Eligible members ({eligible.length}{users.filter(u => u.status === 'active' && !currentMembers.includes(u.phone) && !u.majelis_id).length > 10 ? '+' : ''})
                  </label>
                  <div class="autocomplete-results" style="position: static; max-height: 250px;">
                    {eligible.map(user => (
                      <div 
                        key={user.phone} 
                        class="autocomplete-item"
                        onClick={() => handleAddMember(addMemberModal, user.phone)}
                      >
                        <div class="autocomplete-name">
                          {user.name}
                          {user.is_demo && <span style="margin-left: 4px; padding: 1px 4px; background: #ff9800; color: white; border-radius: 3px; font-size: 9px;">DEMO</span>}
                        </div>
                        <div class="autocomplete-details">{user.phone} • {user.business?.category || user.business_type || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style="margin-top: 16px; color: #666; font-size: 13px; text-align: center;">
                  No eligible members available.<br/>
                  <span style="font-size: 11px;">(Must be verified & not in another majelis)</span>
                </div>
              );
            })()}
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onClick={() => {
                setAddMemberModal(null);
                setSearchQuery('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </>
  );
}
