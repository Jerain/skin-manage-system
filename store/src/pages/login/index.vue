<template>
  <view class="login-page">
    <view class="logo">
      <u-icon name="shop" size="120" color="#409EFF" />
      <text class="title">门店端登录</text>
    </view>
    
    <u-form :model="form">
      <u-form-item label="手机号" prop="phone" required>
        <u-input v-model="form.phone" placeholder="请输入手机号" border="border" />
      </u-form-item>
      
      <u-form-item label="密码" prop="password" required>
        <u-input v-model="form.password" type="password" placeholder="请输入密码" border="border" />
      </u-form-item>
      
      <u-button type="primary" @click="handleLogin" :loading="loading" :disabled="loading" block>
        登录
      </u-button>
    </u-form>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '@/stores'
import api from '@/utils/api'

const store = useStore()
const loading = ref(false)

const form = ref({
  phone: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.phone || !form.value.password) {
    return uni.showToast({ title: '请输入手机号和密码', icon: 'none' })
  }
  
  loading.value = true
  try {
    const res = await api.login(form.value)
    store.setToken(res.access_token)
    store.setEmployeeInfo(res.employee)
    uni.setStorageSync('employeeInfo', res.employee)
    
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  padding: 60rpx 40rpx;
  min-height: 100vh;
  background: #fff;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-top: 20rpx;
}
</style>
