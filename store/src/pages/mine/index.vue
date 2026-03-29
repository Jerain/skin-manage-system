<template>
  <view class="mine-page">
    <!-- Employee Info -->
    <view class="employee-header" v-if="isLoggedIn">
      <u-avatar :src="employeeInfo?.avatar" :text="employeeInfo?.name" size="80" />
      <view class="employee-info">
        <text class="employee-name">{{ employeeInfo?.name }}</text>
        <text class="employee-role">{{ getRoleText(employeeInfo?.role) }}</text>
        <text class="employee-store">门店：{{ employeeInfo?.storeId }}</text>
      </view>
    </view>
    
    <!-- Menu List -->
    <view class="menu-section">
      <view class="menu-item" @click="goToAttendance">
        <view class="menu-left">
          <u-icon name="clock" size="22" />
          <text class="menu-text">考勤打卡</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="goToCheckIn">
        <view class="menu-left">
          <u-icon name="checkmark-circle" size="22" />
          <text class="menu-text">客户签到</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="goToAppointments">
        <view class="menu-left">
          <u-icon name="calendar" size="22" />
          <text class="menu-text">预约管理</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="goToCustomers">
        <view class="menu-left">
          <u-icon name="account" size="22" />
          <text class="menu-text">客户管理</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="goToPerformance">
        <view class="menu-left">
          <u-icon name="trending-up" size="22" color="#f5576c" />
          <text class="menu-text">我的业绩</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item logout" @click="handleLogout" v-if="isLoggedIn">
        <view class="menu-left">
          <u-icon name="close-circle" size="22" />
          <text class="menu-text">退出登录</text>
        </view>
      </view>
    </view>
    
    <!-- Login Prompt -->
    <view class="login-prompt" v-if="!isLoggedIn">
      <u-button type="primary" @click="goToLogin">立即登录</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'

const store = useStore()
const isLoggedIn = computed(() => store.isLoggedIn)
const employeeInfo = computed(() => store.employeeInfo)

const getRoleText = (role?: string) => {
  const map: Record<string, string> = {
    manager: '店长',
    technician: '技师',
    receptionist: '前台'
  }
  return map[role || ''] || role || ''
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const goToAttendance = () => {
  uni.navigateTo({ url: '/pages/attendance/index' })
}

const goToCheckIn = () => {
  uni.navigateTo({ url: '/pages/checkin/index' })
}

const goToAppointments = () => {
  uni.switchTab({ url: '/pages/appointments/index' })
}

const goToCustomers = () => {
  uni.navigateTo({ url: '/pages/customers/index' })
}

const goToPerformance = () => {
  uni.navigateTo({ url: '/pages/performance/index' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        store.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/login/index' })
        }, 500)
      }
    }
  })
}

onMounted(() => {
  const cachedInfo = uni.getStorageSync('employeeInfo')
  if (cachedInfo) {
    store.setEmployeeInfo(cachedInfo)
  }
})
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.employee-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.employee-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.employee-role {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.employee-store {
  font-size: 24rpx;
  color: rgba(255,255,255,0.6);
}

.menu-section {
  margin-top: 20rpx;
  background: #fff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.menu-item.logout {
  margin-top: 20rpx;
}

.menu-item.logout .menu-text {
  color: #ff4d4f;
}

.login-prompt {
  padding: 100rpx;
}
</style>
