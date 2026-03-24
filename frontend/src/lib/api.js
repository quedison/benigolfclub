import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beni-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('beni-token');
      localStorage.removeItem('beni-user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

// Users
export const getUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Menu Items
export const getMenuItems = (categoryId) => api.get('/menu-items', { params: { category_id: categoryId } });
export const createMenuItem = (data) => api.post('/menu-items', data);
export const updateMenuItem = (id, data) => api.put(`/menu-items/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu-items/${id}`);

// Gallery
export const getGallery = () => api.get('/gallery');
export const getAllGallery = () => api.get('/gallery/all');
export const createGalleryImage = (data) => api.post('/gallery', data);
export const updateGalleryImage = (id, data) => api.put(`/gallery/${id}`, data);
export const deleteGalleryImage = (id) => api.delete(`/gallery/${id}`);

// Site Texts
export const getSiteTexts = (page) => api.get('/site-texts', { params: { page } });
export const createSiteText = (data) => api.post('/site-texts', data);
export const updateSiteText = (id, data) => api.put(`/site-texts/${id}`, data);
export const deleteSiteText = (id) => api.delete(`/site-texts/${id}`);

// Site Images
export const getSiteImages = (page) => api.get('/site-images', { params: { page } });
export const createSiteImage = (data) => api.post('/site-images', data);
export const updateSiteImage = (id, data) => api.put(`/site-images/${id}`, data);
export const deleteSiteImage = (id) => api.delete(`/site-images/${id}`);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// Reservations
export const getReservations = () => api.get('/reservations');
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, status) => api.put(`/reservations/${id}/status?status=${status}`);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);

// Upload
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Seed
export const seedDatabase = () => api.post('/seed');

export default api;
