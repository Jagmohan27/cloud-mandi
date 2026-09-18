import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE_URL = rawBaseUrl.endsWith('/api') || rawBaseUrl === '/api'
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mandi_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Prices
  getPrices: async (params = {}) => {
    const res = await apiClient.get('/prices', { params });
    return res.data;
  },

  getPriceById: async (id) => {
    const res = await apiClient.get(`/prices/${id}`);
    return res.data;
  },

  getLatestPrices: async (limit = 8) => {
    const res = await apiClient.get('/prices/latest', { params: { limit } });
    return res.data;
  },

  getPriceHistory: async (commodity, params = {}) => {
    const res = await apiClient.get('/prices/history', {
      params: { commodity, ...params },
    });
    return res.data;
  },

  // Metadata
  getCommodities: async () => {
    const res = await apiClient.get('/commodities');
    return res.data;
  },

  getStates: async () => {
    const res = await apiClient.get('/states');
    return res.data;
  },

  getDistricts: async (state) => {
    const res = await apiClient.get('/districts', { params: { state } });
    return res.data;
  },

  getMandis: async (state, district) => {
    const res = await apiClient.get('/mandis', { params: { state, district } });
    return res.data;
  },

  // Statistics
  getStatistics: async () => {
    const res = await apiClient.get('/statistics');
    return res.data;
  },

  // Admin & Sync
  adminLogin: async (username, password) => {
    const res = await apiClient.post('/admin/login', { username, password });
    if (res.data?.access_token) {
      localStorage.setItem('mandi_admin_token', res.data.access_token);
      localStorage.setItem('mandi_admin_user', res.data.username);
    }
    return res.data;
  },

  adminLogout: () => {
    localStorage.removeItem('mandi_admin_token');
    localStorage.removeItem('mandi_admin_user');
  },

  getAdminUser: () => {
    return localStorage.getItem('mandi_admin_user');
  },

  triggerSync: async () => {
    const res = await apiClient.post('/admin/sync');
    return res.data;
  },

  getSyncStatus: async (limit = 10) => {
    const res = await apiClient.get('/admin/sync-status', { params: { limit } });
    return res.data;
  },
};

export default api;
