import axios from 'axios';

const sanitizeUrl = (url) => url ? url.trim().replace('lpress-website-backend', 'lpres-website-backend') : '';

const API_BASE = sanitizeUrl(import.meta.env.VITE_API_URL)
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://lpres-website-backend.onrender.com');

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
  create: (data) => api.post('/api/news/admin/create', data),
  update: (id, data) => api.put(`/api/news/admin/${id}`, data),
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

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const galleryAPI = {
  list: (params = {}) => api.get('/api/gallery/', { params }),
  categories: () => api.get('/api/gallery/categories'),
  adminList: (skip = 0) => api.get(`/api/gallery/admin/all?skip=${skip}`),
  upload: (fd) => api.post('/api/gallery/admin/upload', fd, multipart),
  update: (id, fd) => api.put(`/api/gallery/admin/${id}`, fd, multipart),
  togglePublish: (id) => api.patch(`/api/gallery/admin/${id}/publish`),
  delete: (id) => api.delete(`/api/gallery/admin/${id}`),
};

export const projectsAPI = {
  list: (params = {}) => api.get('/api/projects/', { params }),
  get: (id) => api.get(`/api/projects/${id}`),
  adminList: (skip = 0) => api.get(`/api/projects/admin/all?skip=${skip}`),
  create: (fd) => api.post('/api/projects/admin/', fd, multipart),
  update: (id, fd) => api.put(`/api/projects/admin/${id}`, fd, multipart),
  togglePublish: (id) => api.patch(`/api/projects/admin/${id}/publish`),
  delete: (id) => api.delete(`/api/projects/admin/${id}`),
};
