import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { Check, Trash2, Dice5, Trash, Users as UsersIcon } from 'lucide-preact';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useFeedback } from '../hooks/useFeedback';
import { userApi, majelisApi, superadminApi } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [majelis, setMajelis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { toast, confirmDialog, showToast, showConfirm, clearToast } = useFeedback();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, majelisData] = await Promise.all([
        userApi.getAll(),
        majelisApi.getAll()
      ]);
      setUsers(usersData);
      setMajelis(majelisData);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    }
    setLoading(false);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal, bVal;
    
    // Special handling for majelis_name - lookup from majelis array
    if (sortConfig.key === 'majelis_name') {
      const aMajelis = a.majelis_id ? majelis.find(m => m.id === a.majelis_id) : null;
      const bMajelis = b.majelis_id ? majelis.find(m => m.id === b.majelis_id) : null;
      aVal = aMajelis?.name || '';
      bVal = bMajelis?.name || '';
    } else {
      aVal = a[sortConfig.key] || '';
      bVal = b[sortConfig.key] || '';
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleVerify = async (phone, status) => {
    setProcessing(phone);
    try {
      await userApi.verify(phone, status);
      await fetchData();
      showToast('User verified successfully');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (phone, name) => {
    const confirmed = await showConfirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`
    });
    
    if (!confirmed) return;
    
    setProcessing(phone);
    try {
      await userApi.delete(phone);
      await fetchData();
      showToast('User deleted successfully');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handlePopulateMockData = async () => {
    const confirmed = await showConfirm({
      title: 'Populate Mock Data',
      message: 'This will create 8 mock users in the database. Continue?',
      confirmText: 'Populate',
      type: 'primary'
    });
    
    if (!confirmed) return;
    
    setProcessing('mock');
    try {
      await superadminApi.populateMockUsers();
      await fetchData();
      showToast('Mock data populated successfully!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteAllMock = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const confirmDeleteAll = async () => {
    if (deleteConfirmText !== 'delete') {
      alert('Please type "delete" to confirm');
      return;
    }

    setProcessing('delete-all');
    setShowDeleteModal(false);
    try {
      await superadminApi.deleteAllMockUsers();
      await fetchData();
      showToast('All mock users deleted successfully!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
      setDeleteConfirmText('');
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <>
      {/* Stats Summary */}
      {!loading && users.length > 0 && (
        <div class="stats-grid" style="margin-bottom: 20px;">
          <div class="stat-card">
            <div class="stat-value">{users.length}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #10B981;">{users.filter(u => u.status === 'active').length}</div>
            <div class="stat-label">Verified</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #F59E0B;">{users.filter(u => u.status !== 'active').length}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #63297A;">{users.filter(u => u.majelis_id).length}</div>
            <div class="stat-label">In Majelis</div>
          </div>
        </div>
      )}

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <UsersIcon size={24} /> User Management ({users.length})
          </h2>
          <div style="display: flex; gap: 0.5rem;">
            {(() => {
              const mockCount = users.filter(u => u.is_mock).length;
              return (
                <>
                  {!loading && (
                    <button 
                      class="btn btn-primary" 
                      onClick={handlePopulateMockData}
                      disabled={processing === 'mock' || mockCount > 0}
                      title={mockCount > 0 ? 'Mock users already exist' : ''}
                    >
                      <Dice5 size={16} /> Populate Mock Data
                    </button>
                  )}
                  <button 
                    class="btn btn-danger" 
                    onClick={handleDeleteAllMock}
                    disabled={processing === 'delete-all' || mockCount === 0}
                  >
                    <Trash size={16} /> Delete All Mock {mockCount > 0 && `(${mockCount})`}
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style="cursor: pointer;">
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('phone')} style="cursor: pointer;">
                Phone {getSortIcon('phone')}
              </th>
              <th onClick={() => handleSort('business_type')} style="cursor: pointer;">
                Business {getSortIcon('business_type')}
              </th>
              <th onClick={() => handleSort('location')} style="cursor: pointer;">
                Location {getSortIcon('location')}
              </th>
              <th onClick={() => handleSort('majelis_name')} style="cursor: pointer;">
                Majelis {getSortIcon('majelis_name')}
              </th>
              <th onClick={() => handleSort('status')} style="cursor: pointer;">
                Status {getSortIcon('status')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => {
              const userMajelis = user.majelis_id ? majelis.find(m => m.id === user.majelis_id) : null;
              return (
                <tr key={user.phone}>
                  <td>
                    <strong><a href={`/user-profile/${user.phone}`} class="user-link">{user.name}</a></strong>
                    {user.is_demo && <span style="margin-left: 6px; padding: 2px 6px; background: #ff9800; color: white; border-radius: 4px; font-size: 10px; font-weight: bold;">DEMO</span>}
                    {user.is_mock && !user.is_demo && <span style="margin-left: 6px; padding: 2px 6px; background: #9e9e9e; color: white; border-radius: 4px; font-size: 10px; font-weight: bold;">MOCK</span>}
                  </td>
                  <td>{user.phone}</td>
                  <td>{user.business?.category || user.business_type || '-'}</td>
                  <td>{user.business?.location || user.location || '-'}</td>
                  <td>
                    {userMajelis ? (
                      <a href={`/majelis/${userMajelis.id}`} style="color: #2196f3; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                        <UsersIcon size={14} />{userMajelis.name}
                      </a>
                    ) : (
                      <span style="color: #999;">—</span>
                    )}
                  </td>
                  <td>
                    <span class={`status ${user.status === 'active' ? 'verified' : 'pending'}`}>
                      {user.status === 'active' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        class="btn btn-icon btn-success"
                        onClick={() => handleVerify(user.phone, true)}
                        disabled={processing === user.phone || user.status === 'active'}
                        title="Verify user"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        class="btn btn-icon btn-secondary"
                        onClick={() => handleDelete(user.phone, user.name)}
                        disabled={processing === user.phone}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div class="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3><Trash2 size={18} style={{marginRight: '8px', color: '#dc3545'}} />Delete All Mock Users</h3>
            <p>This will permanently delete all mock users from the database.</p>
            <p><strong>Type "delete" to confirm:</strong></p>
            <input 
              type="text" 
              value={deleteConfirmText}
              onInput={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type delete here"
              style="width: 100%; padding: 0.5rem; margin: 1rem 0;"
            />
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button 
                class="btn btn-danger" 
                onClick={confirmDeleteAll}
                disabled={deleteConfirmText !== 'delete'}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </>
  );
}
