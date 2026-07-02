const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';


// Thin fetch wrapper: attaches JWT automatically, throws on non-2xx so
// components can just try/catch instead of checking res.ok everywhere.
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || data.errors?.[0]?.msg || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  getMe: () => request('/auth/me'),

  getTasks: (page = 1, limit = 10) => request(`/tasks?page=${page}&limit=${limit}`),
  createTask: (payload) => request('/tasks', { method: 'POST', body: payload }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: 'PUT', body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Admin APIs
  getAdminUsers: () => request('/admin/users'),
  updateAdminUser: (id, payload) => request(`/admin/users/${id}`, { method: 'PUT', body: payload }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminStats: () => request('/admin/stats'),
};

