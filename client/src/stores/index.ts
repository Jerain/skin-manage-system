import { defineStore } from 'pinia'

interface UserInfo {
  id: number
  name: string
  phone: string
  avatar?: string
  level: number
  balance: number
  points: number
}

interface State {
  token: string
  userInfo: UserInfo | null
}

export const useStore = defineStore('main', {
  state: (): State => ({
    token: uni.getStorageSync('token') || '',
    userInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    setToken(token: string) {
      this.token = token
      uni.setStorageSync('token', token)
    },
    
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    
    logout() {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }
})
