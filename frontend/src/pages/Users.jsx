import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { Check, X, Trash2, Dice5, Trash } from 'lucide-preact';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
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
    
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleVerify = async (phone, status) => {
    setProcessing(phone);
    try {
      await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, status })
      });
      await fetchUsers();
    } catch (error) {
      console.error('Verification failed', error);
      alert('Verification failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (phone, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setProcessing(phone);
    try {
      const res = await fetch(`/api/users/${phone}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
      } else {
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Delete failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handlePopulateMockData = async () => {
    if (!confirm('Populate database with mock users?')) return;
    
    setProcessing('mock');
    try {
      const res = await fetch('/api/superadmin/populate-mock', { method: 'POST' });
      if (res.ok) {
        alert('Mock data populated successfully!');
        await fetchUsers();
      } else {
        alert('Failed to populate mock data.');
      }
    } catch (error) {
      console.error('Mock population failed', error);
      alert('Failed to populate mock data.');
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
      const res = await fetch('/api/superadmin/delete-all-mock', { method: 'DELETE' });
      if (res.ok) {
        alert('All mock users deleted successfully!');
        await fetchUsers();
      } else {
        alert('Failed to delete mock users.');
      }
    } catch (error) {
      console.error('Delete all failed', error);
      alert('Failed to delete mock users.');
    } finally {
      setProcessing(null);
      setDeleteConfirmText('');
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <div class="loading">Loading...</div>;
  }

  return (
    <>
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0;">User Management ({users.length})</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button 
              class="btn btn-primary" 
              onClick={handlePopulateMockData}
              disabled={processing === 'mock'}
            >
              <Dice5 size={16} /> Populate Mock Data
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
              <th onClick={() => handleSort('is_verified')} style="cursor: pointer;">
                Status {getSortIcon('is_verified')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => {
              const isAssigned = user.majelis_name !== null;
              return (
                <tr key={user.phone}>
                  <td><strong><a href={`/user-profile/${user.phone}`} class="user-link">{user.name}</a></strong></td>
                  <td>{user.phone}</td>
                  <td>{user.business_type}</td>
                  <td>{user.location}</td>
                  <td>
                    <span class={`status ${isAssigned ? 'verified' : 'unassigned'}`}>
                      {isAssigned ? `📅 ${user.majelis_name}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span class={`status ${user.is_verified ? 'verified' : 'pending'}`}>
                      {user.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        class="btn btn-icon btn-success"
                        onClick={() => handleVerify(user.phone, true)}
                        disabled={processing === user.phone || user.is_verified === true}
                        title="Verify user"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        class="btn btn-icon btn-danger"
                        onClick={() => handleVerify(user.phone, false)}
                        disabled={processing === user.phone || user.is_verified === true}
                        title="Reject user"
                      >
                        <X size={16} />
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
            <h3>⚠️ Delete All Mock Users</h3>
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
    </>
  );
}
