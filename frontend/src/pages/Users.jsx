import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { Check, Trash2, Dice5, Trash, Users as UsersIcon } from 'lucide-preact';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useFeedback } from '../hooks/useFeedback';
import { userApi, majelisApi, superadminApi } from '../services/api';
import { API_BASE_URL } from '../config';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [majelis, setMajelis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const { toast, confirmDialog, showToast, showConfirm, clearToast } = useFeedback();

  useEffect(() => {
    fetchData();

    // SSE for real-time updates
    const eventSource = new EventSource(`${API_BASE_URL}/api/events/users`);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'user_created' && data.data) {
        // Prepend new user without full refresh to avoid layout shift
        setUsers(prev => [data.data, ...prev.filter(u => u.phone !== data.data.phone)]);
        showToast(`User registered: ${data.data?.name || 'New user'}`, 'success');
      } else if (data.type === 'user_updated' && data.data) {
        // Update in place
        setUsers(prev => prev.map(u => u.phone === data.data.phone ? data.data : u));
        showToast(`User updated: ${data.data?.name || 'User'}`, 'success');
      }
    };
    return () => eventSource.close();
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
      message: `Are you sure you want to delete ${name}?`
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

  const handleDeleteAllMock = async () => {
    setProcessing('delete-all');
    try {
      await superadminApi.deleteAllMockUsers();
      await fetchData();
      showToast('All mock users deleted successfully!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <>
      {/* Page Description */}
      <div style="margin-bottom: 24px; padding: 16px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
        <h1 style="margin: 0 0 8px 0; font-size: 20px; color: #1F2937;">User Management</h1>
        <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.6;">
          View and manage all registered borrowers. Verify pending registrations, assign users to majelis groups,
          and access individual profiles for detailed credit assessment. Click on a user's name to view their complete profile.
        </p>
      </div>

      {/* Stats Summary - always show, with loading state */}
      <div class="stats-grid" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-value">{loading ? '-' : users.length}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #10B981;">{loading ? '-' : users.filter(u => u.status === 'active').length}</div>
          <div class="stat-label">Verified</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #F59E0B;">{loading ? '-' : users.filter(u => u.status !== 'active').length}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #63297A;">{loading ? '-' : users.filter(u => u.majelis_id).length}</div>
          <div class="stat-label">In Majelis</div>
        </div>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <UsersIcon size={24} /> User Management ({loading ? '-' : users.length})
          </h2>
          <div style="display: flex; gap: 0.5rem;">
            {(() => {
              const mockCount = loading ? 0 : users.filter(u => u.is_mock).length;
              return (
                <>
                  <button
                    class="btn btn-primary"
                    onClick={handlePopulateMockData}
                    disabled={loading || processing === 'mock' || mockCount > 0}
                    title={mockCount > 0 ? 'Mock users already exist' : ''}
                  >
                    <Dice5 size={16} /> Populate Mock
                  </button>
                  <button
                    class="btn btn-danger"
                    onClick={handleDeleteAllMock}
                    disabled={loading || processing === 'delete-all' || mockCount === 0}
                  >
                    <Trash size={16} /> Delete Mock {mockCount > 0 && `(${mockCount})`}
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        <table style="table-layout: fixed; width: 100%;">
          <thead>
            <tr>
              <th style="cursor: pointer; width: 18%;" onClick={() => handleSort('name')}>
                Name {getSortIcon('name')}
              </th>
              <th style="cursor: pointer; width: 14%;" onClick={() => handleSort('phone')}>
                Phone {getSortIcon('phone')}
              </th>
              <th style="cursor: pointer; width: 14%;" onClick={() => handleSort('business_type')}>
                Business {getSortIcon('business_type')}
              </th>
              <th style="cursor: pointer; width: 14%;" onClick={() => handleSort('location')}>
                Location {getSortIcon('location')}
              </th>
              <th style="cursor: pointer; width: 14%;" onClick={() => handleSort('majelis_name')}>
                Majelis {getSortIcon('majelis_name')}
              </th>
              <th style="cursor: pointer; width: 10%;" onClick={() => handleSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th style="width: 16%;">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><div style="background: #e5e7eb; height: 16px; width: 120px; border-radius: 4px;"></div></td>
                  <td><div style="background: #e5e7eb; height: 16px; width: 100px; border-radius: 4px;"></div></td>
                  <td><div style="background: #e5e7eb; height: 16px; width: 80px; border-radius: 4px;"></div></td>
                  <td><div style="background: #e5e7eb; height: 16px; width: 80px; border-radius: 4px;"></div></td>
                  <td><div style="background: #e5e7eb; height: 16px; width: 90px; border-radius: 4px;"></div></td>
                  <td><div style="background: #e5e7eb; height: 20px; width: 60px; border-radius: 4px;"></div></td>
                  <td><div style="background: #e5e7eb; height: 28px; width: 70px; border-radius: 4px;"></div></td>
                </tr>
              ))
            ) : (
              sortedUsers.map(user => {
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
              })
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </>
  );
}
