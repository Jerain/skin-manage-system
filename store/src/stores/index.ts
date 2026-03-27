import { defineStore } from 'pinia'

interface EmployeeInfo {
  id: number
  name: string
  phone: string
  role: string
  position: string
  storeId: number
  avatar?: string
}

interface State {
  token: string
  employeeInfo: EmployeeInfo | null
}

export const useStore = defineStore('main', {
  state: (): State => ({
    token: uni.getStorageSync('token') || '',
    employeeInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    setToken(token: string) {
      this.token = token
      uni.setStorageSync('token', token)
    },
    
    setEmployeeInfo(employeeInfo: EmployeeInfo) {
      this.employeeInfo = employeeInfo
    },
    
    logout() {
      this.token = ''
      this.employeeInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('employeeInfo')
    }
  }
})
