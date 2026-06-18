import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sw_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const register           = (data)       => api.post('/auth/register', data);
export const login              = (data)       => api.post('/auth/login', data);
export const getMe              = ()           => api.get('/auth/me');
export const getTransactions    = (params)     => api.get('/transactions', { params });
export const getSummary         = (params)     => api.get('/transactions/summary', { params });
export const createTransaction  = (data)       => api.post('/transactions', data);
export const updateTransaction  = (id, data)   => api.put(`/transactions/${id}`, data);
export const deleteTransaction  = (id)         => api.delete(`/transactions/${id}`);
export const getBudgets         = (params)     => api.get('/budgets', { params });
export const saveBudget         = (data)       => api.post('/budgets', data);
export const deleteBudget       = (id)         => api.delete(`/budgets/${id}`);

export default api;