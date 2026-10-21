const BASE_URL = 'http://localhost:3000/api'
/** 静态资源根地址（上传照片、生成的对比图） */
const ASSET_URL = 'http://localhost:3000'

/** 把后端返回的相对资源路径转成完整可访问地址 */
export const assetUrl = (path?: string | null): string => {
  if (!path) return ''
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return ASSET_URL + (path.startsWith('/') ? path : '/' + path)
}

/** 与客户端保持一致的命名 */
export const resolveImageUrl = assetUrl

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
  
  // Customers
  getCustomers: () =>
    request({ url: '/customers' }),
  
  // Technicians
  getTechnicians: (storeId?: number) =>
    request({ url: '/technicians', data: storeId ? { storeId } : {} }),
  
  // Skin records & comparisons (F001)
  uploadSkinPhoto: (filePath: string) => {
    return new Promise<any>((resolve, reject) => {
      const token = uni.getStorageSync('token')
      uni.uploadFile({
        url: BASE_URL + '/skin-records/upload',
        filePath,
        name: 'file',
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success: (res: any) => {
          try {
            const parsed = JSON.parse(res.data)
            if (parsed.code === 0) {
              resolve(parsed.data)
            } else {
              uni.showToast({ title: parsed.message || '上传失败', icon: 'none' })
              reject(parsed)
            }
          } catch (e) {
            uni.showToast({ title: '上传失败', icon: 'none' })
            reject(e)
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(err)
        }
      })
    })
  },
  createSkinRecord: (data: any) =>
    request({ url: '/skin-records', method: 'POST', data }),
  analyzeSkinPhoto: (photoUrl: string) =>
    request({ url: '/skin-records/analyze', method: 'POST', data: { photoUrl } }),
  getSkinRecords: (customerId: number) =>
    request({ url: `/skin-records/customer/${customerId}` }),
  generateSkinComparison: (data: any) =>
    request({ url: '/skin-comparisons', method: 'POST', data }),
  getSkinComparisons: (customerId: number) =>
    request({ url: `/skin-comparisons/${customerId}` }),
  
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
    request({ url: `/orders/${id}/complete`, method: 'PUT' }),
  
  // Performance
  getRealtimePerformance: (employeeId: number) =>
    request({ url: `/performance/technician/${employeeId}/realtime` }),
  getPerformance: (employeeId: number, month?: string) =>
    request({ url: `/performance/technician/${employeeId}`, data: month ? { month } : {} }),
  getBonusRules: (storeId?: number) =>
    request({ url: '/performance/bonus-rules', data: storeId ? { storeId } : {} }),
  getTechnicianBonus: (technicianId: number, month: string) =>
    request({ url: `/performance/bonus/${technicianId}/${month}` })
}

export default api
