import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth APIs
export const authApi = {
  login: (data: { username: string; password: string }) => 
    api.post('/auth/admin/login', data),
  verify: () => api.get('/auth/verify')
}

// Store APIs
export const storesApi = {
  list: () => api.get('/stores'),
  get: (id: number) => api.get(`/stores/${id}`),
  create: (data: any) => api.post('/stores', data),
  update: (id: number, data: any) => api.put(`/stores/${id}`, data),
  delete: (id: number) => api.delete(`/stores/${id}`)
}

// Employee APIs
export const employeesApi = {
  list: (storeId?: number) => api.get('/employees', { params: { storeId } }),
  get: (id: number) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: number, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`)
}

// Customer APIs
export const customersApi = {
  list: () => api.get('/customers'),
  get: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`)
}

// Service APIs
export const servicesApi = {
  list: (storeId?: number) => api.get('/services', { params: { storeId } }),
  categories: () => api.get('/services/categories'),
  get: (id: number) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`)
}

// Appointment APIs
export const appointmentsApi = {
  list: (params?: any) => api.get('/appointments', { params }),
  today: (storeId?: number) => api.get('/appointments/today', { params: { storeId } }),
  get: (id: number) => api.get(`/appointments/${id}`),
  confirm: (id: number) => api.put(`/appointments/${id}/confirm`),
  reject: (id: number, reason: string) => api.put(`/appointments/${id}/reject`, { reason }),
  cancel: (id: number, reason?: string) => api.put(`/appointments/${id}/cancel`, { reason })
}

// Order APIs
export const ordersApi = {
  list: (params?: any) => api.get('/orders', { params }),
  get: (id: number) => api.get(`/orders/${id}`),
  pay: (id: number, payType: string) => api.post(`/orders/${id}/pay`, { payType }),
  complete: (id: number) => api.put(`/orders/${id}/complete`),
  cancel: (id: number) => api.put(`/orders/${id}/cancel`)
}
