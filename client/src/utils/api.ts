const BASE_URL = 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

interface Response<T = any> {
  data: T
  message?: string
  code?: number
}

const request = <T = any>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res: any) => {
        if (res.data.code === 200 || res.statusCode === 200) {
          resolve(res.data.data || res.data)
        } else {
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export const api = {
  // Auth
  login: (data: { phone: string; password: string }) => 
    request({ url: '/auth/customer/login', method: 'POST', data }),
  
  register: (data: { phone: string; password: string; name?: string }) => 
    request({ url: '/auth/customer/register', method: 'POST', data }),
  
  // Stores
  getStores: () => request({ url: '/stores' }),
  getStore: (id: number) => request({ url: `/stores/${id}` }),
  
  // Services
  getServices: (storeId?: number) => 
    request({ url: '/services', data: storeId ? { storeId } : {} }),
  getCategories: () => request({ url: '/services/categories' }),
  getServicesByCategory: (categoryId: number, storeId?: number) => 
    request({ url: `/services/category/${categoryId}`, data: { storeId } }),
  
  // Employees
  getEmployees: (storeId: number) => 
    request({ url: `/employees/store/${storeId}` }),
  
  // Appointments
  getAppointments: (params?: any) => 
    request({ url: '/appointments', data: params }),
  createAppointment: (data: any) => 
    request({ url: '/appointments', method: 'POST', data }),
  cancelAppointment: (id: number, reason?: string) => 
    request({ url: `/appointments/${id}/cancel`, method: 'PUT', data: { reason } }),
  getAvailableTimes: (employeeId: number, date: string, duration?: number) =>
    request({ url: '/appointments/available-times', data: { employeeId, date, duration } }),
  
  // Orders
  getOrders: (params?: any) => 
    request({ url: '/orders', data: params }),
  getOrder: (id: number) => request({ url: `/orders/${id}` }),
  payOrder: (id: number, payType: string) => 
    request({ url: `/orders/${id}/pay`, method: 'POST', data: { payType } }),
  
  // Customer
  getCustomerInfo: () => request({ url: '/customers/info' }),
  updateCustomer: (data: any) => request({ url: '/customers/update', method: 'PUT', data }),
  
  // Care Plans
  getCarePlans: () => request({ url: '/care-plans' }),
  getCarePlan: (id: number) => request({ url: `/care-plans/${id}` }),
  createCarePlan: (data: any) => request({ url: '/care-plans', method: 'POST', data }),
  updateCarePlanItem: (itemId: number, data: any) => request({ url: `/care-plans/items/${itemId}`, method: 'PUT', data })
}

export default api
