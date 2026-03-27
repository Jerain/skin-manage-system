<template>
  <view class="checkin-page">
    <view class="checkin-card">
      <view class="card-title">客户签到</view>
      
      <!-- Manual Input -->
      <view class="input-section">
        <view class="input-label">手机号</view>
        <u-input v-model="phone" placeholder="请输入客户手机号" border="border" />
      </view>
      
      <u-button type="primary" @click="handleCheckIn">确认签到</u-button>
    </view>
    
    <!-- Recent Check-ins -->
    <view class="recent-section">
      <view class="section-title">今日签到记录</view>
      <scroll-view scroll-y class="checkin-list">
        <view class="checkin-item" v-for="item in checkIns" :key="item.id">
          <view class="checkin-info">
            <text class="customer-name">{{ item.customer?.name }}</text>
            <text class="customer-phone">{{ item.customer?.phone }}</text>
          </view>
          <text class="checkin-time">{{ formatTime(item.checkInTime) }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const phone = ref('')
const checkIns = ref<any[]>([])

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const handleCheckIn = async () => {
  if (!phone.value) {
    return uni.showToast({ title: '请输入手机号', icon: 'none' })
  }
  
  // TODO: Call API to get customer by phone, then check in
  uni.showToast({ title: '签到功能开发中', icon: 'none' })
}

const loadCheckIns = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    checkIns.value = await api.getCheckIns({ date: today })
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadCheckIns()
})
</script>

<style scoped>
.checkin-page {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.checkin-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.input-section {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.recent-section {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.checkin-list {
  max-height: 60vh;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.checkin-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.customer-name {
  font-size: 28rpx;
  color: #333;
}

.customer-phone {
  font-size: 24rpx;
  color: #666;
}

.checkin-time {
  font-size: 26rpx;
  color: #409EFF;
}
</style>
