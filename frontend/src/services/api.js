// API service layer - Single Responsibility Principle
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

// User API
export const userApi = {
  getAll: () => fetch('/api/users').then(r => r.json()),
  verify: (phone, status) => apiCall('/api/users/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, status })
  }),
  delete: (phone) => apiCall(`/api/users/${phone}`, { method: 'DELETE' })
};

// Majelis API
export const majelisApi = {
  getAll: () => fetch('/api/majelis').then(r => r.json()),
  create: (data) => apiCall('/api/majelis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/api/majelis/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/api/majelis/${id}`, { method: 'DELETE' }),
  addMember: (id, phone) => apiCall(`/api/majelis/${id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  }),
  removeMember: (id, phone) => apiCall(`/api/majelis/${id}/members/${phone}`, { method: 'DELETE' })
};

// Superadmin API
export const superadminApi = {
  populateMockUsers: () => apiCall('/api/superadmin/populate-mock', { method: 'POST' }),
  deleteAllMockUsers: () => apiCall('/api/superadmin/delete-all-mock', { method: 'DELETE' }),
  populateMockMajelis: () => apiCall('/api/superadmin/populate-mock-majelis', { method: 'POST' }),
  deleteAllMockMajelis: () => apiCall('/api/superadmin/delete-all-mock-majelis', { method: 'DELETE' })
};
