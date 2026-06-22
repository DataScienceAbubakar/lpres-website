import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lpres_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lpres_admin_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const newsAPI = {
  list: (skip = 0, limit = 12) => api.get(`/api/news/?skip=${skip}&limit=${limit}`),
  get: (slug) => api.get(`/api/news/${slug}`),
  adminList: (skip = 0) => api.get(`/api/news/admin/all?skip=${skip}`),
  create: (formData) => api.post('/api/news/admin/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/api/news/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  togglePublish: (id) => api.patch(`/api/news/admin/${id}/publish`),
  delete: (id) => api.delete(`/api/news/admin/${id}`),
};

export const adminAPI = {
  login: (username, password) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    return api.post('/api/admin/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  },
  me: () => api.get('/api/admin/me'),
};
