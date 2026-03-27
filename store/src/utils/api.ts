const BASE_URL = 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
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
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const api = {
  // Auth
  login: (data: { phone: string; password: string }) => 
    request({ url: '/auth/employee/login', method: 'POST', data }),
  
  // Appointments
  getTodayAppointments: (storeId?: number) => 
    request({ url: '/appointments/today', data: storeId ? { storeId } : {} }),
  getAppointments: (params?: any) => 
    request({ url: '/appointments', data: params }),
  confirmAppointment: (id: number) => 
    request({ url: `/appointments/${id}/confirm`, method: 'PUT' }),
  rejectAppointment: (id: number, reason: string) => 
    request({ url: `/appointments/${id}/reject`, method: 'PUT', data: { reason } }),
  completeAppointment: (id: number) => 
    request({ url: `/appointments/${id}/complete`, method: 'PUT' }),
  cancelAppointment: (id: number, reason?: string) => 
    request({ url: `/appointments/${id}/cancel`, method: 'PUT', data: { reason } }),
  
  // Attendance
  checkIn: (employeeId: number, type?: string) => 
    request({ url: '/attendance/check-in', method: 'POST', data: { employeeId, type } }),
  checkOut: (employeeId: number, type?: string) => 
    request({ url: '/attendance/check-out', method: 'POST', data: { employeeId, type } }),
  getTodayAttendance: (employeeId: number) => 
    request({ url: `/attendance/today/${employeeId}` }),
  getAttendances: (params?: any) => 
    request({ url: '/attendance', data: params }),
  
  // Check-in
  customerCheckIn: (data: { customerId: number; storeId: number; appointmentId?: number; type?: string }) =>
    request({ url: '/attendance/check-ins', method: 'POST', data }),
  getCheckIns: (params?: any) =>
    request({ url: '/attendance/check-ins', data: params }),
  
  // Orders
  getOrders: (params?: any) =>
    request({ url: '/orders', data: params }),
  completeOrder: (id: number) =>
    request({ url: `/orders/${id}/complete`, method: 'PUT' })
}

export default api
