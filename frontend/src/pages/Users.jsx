import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

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

  if (loading) {
    return <div class="loading">Loading...</div>;
  }

  return (
    <>
      <div class="card">
        <h2>Quick Actions</h2>
        <div class="quick-actions-grid">
          <a href="/business-types" class="quick-action-card business">
            <div class="quick-action-icon">🏪</div>
            <div class="quick-action-title">Business Types</div>
            <div class="quick-action-desc">View RAG Classifications</div>
          </a>
          <a href="/majelis" class="quick-action-card majelis">
            <div class="quick-action-icon">📅</div>
            <div class="quick-action-title">Majelis Groups</div>
            <div class="quick-action-desc">Manage Groups</div>
          </a>
          <a href="/financial-literacy" class="quick-action-card literacy">
            <div class="quick-action-icon">📚</div>
            <div class="quick-action-title">Financial Literacy</div>
            <div class="quick-action-desc">15-Week Course</div>
          </a>
        </div>
      </div>

      <div class="card">
        <h2>User Verifications</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Business</th>
              <th>Location</th>
              <th>Majelis</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
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
                      <button class="btn btn-primary" onClick={() => route(`/user-profile/${user.phone}`)}>
                        👁️ View
                      </button>
                      <button
                        class="btn btn-success"
                        onClick={() => handleVerify(user.phone, true)}
                        disabled={processing === user.phone || user.is_verified}
                      >
                        ✓ Approve
                      </button>
                      <button
                        class="btn btn-danger"
                        onClick={() => handleVerify(user.phone, false)}
                        disabled={processing === user.phone || user.is_verified}
                      >
                        ✗ Reject
                      </button>
                      <button
                        class="btn btn-secondary"
                        onClick={() => handleDelete(user.phone, user.name)}
                        disabled={processing === user.phone}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
