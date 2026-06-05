import { api } from './client.js'

const list = (resource) => (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString()
  return api.get(`/${resource}${qs ? `?${qs}` : ''}`)
}

export const Auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword }),
}

export const Staff = {
  list: list('staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.patch(`/staff/${id}`, data),
  remove: (id) => api.delete(`/staff/${id}`),
}

export const Customers = {
  list: list('customers'),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.patch(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
}

export const Products = {
  list: list('products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
}

export const Sales = {
  list: list('sales'),
  create: (data) => api.post('/sales', data),
  refund: (id) => api.post(`/sales/${id}/refund`),
}

export const Suppliers = {
  list: list('suppliers'),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.patch(`/suppliers/${id}`, data),
  remove: (id) => api.delete(`/suppliers/${id}`),
}

export const Activities = { list: list('activities') }

export const Stats = {
  overview: () => api.get('/stats/overview'),
  daily: (days = 14) => api.get(`/stats/daily?days=${days}`),
  topProducts: () => api.get('/stats/top-products'),
  byCategory: () => api.get('/stats/by-category'),
  byPayment: () => api.get('/stats/by-payment'),
  topCashiers: () => api.get('/stats/top-cashiers'),
  tiers: () => api.get('/stats/tiers'),
}
