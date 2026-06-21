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

// ---- Auth ----
export const register          = (data)       => api.post('/auth/register', data);
export const login             = (data)       => api.post('/auth/login', data);
export const getMe             = ()           => api.get('/auth/me');

// ---- Transactions ----
export const getTransactions   = (params)     => api.get('/transactions', { params });
export const getSummary        = (params)     => api.get('/transactions/summary', { params });
export const createTransaction = (data)       => api.post('/transactions', data);
export const updateTransaction = (id, data)   => api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id)         => api.delete(`/transactions/${id}`);

// ---- Budgets ----
export const getBudgets        = (params)     => api.get('/budgets', { params });
export const saveBudget        = (data)       => api.post('/budgets', data);
export const deleteBudget      = (id)         => api.delete(`/budgets/${id}`);

// ---- Recurring Transactions ----
export const getRecurring      = ()           => api.get('/recurring');
export const createRecurring   = (data)       => api.post('/recurring', data);
export const updateRecurring   = (id, data)   => api.put(`/recurring/${id}`, data);
export const deleteRecurring   = (id)         => api.delete(`/recurring/${id}`);
export const processRecurring  = ()           => api.post('/recurring/process');
// ---- Accounts ----
export const getAccounts    = ()         => api.get('/accounts');
export const createAccount  = (data)     => api.post('/accounts', data);
export const updateAccount  = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount  = (id)       => api.delete(`/accounts/${id}`);
// ---- Goals ----
export const getGoals     = ()         => api.get('/goals');
export const createGoal   = (data)     => api.post('/goals', data);
export const updateGoal   = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal   = (id)       => api.delete(`/goals/${id}`);
export const depositGoal  = (id, data) => api.post(`/goals/${id}/deposit`, data);

export default api;