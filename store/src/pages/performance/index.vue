<template>
  <view class="performance-page">
    <!-- Summary Cards -->
    <view class="summary-section">
      <view class="summary-card">
        <text class="card-label">今日业绩</text>
        <text class="card-value">¥{{ formatMoney(todayPerformance) }}</text>
      </view>
      <view class="summary-card">
        <text class="card-label">本月业绩</text>
        <text class="card-value">¥{{ formatMoney(monthPerformance) }}</text>
      </view>
      <view class="summary-card">
        <text class="card-label">累计业绩</text>
        <text class="card-value">¥{{ formatMoney(totalPerformance) }}</text>
      </view>
    </view>
    
    <!-- Bonus Section -->
    <view class="bonus-section">
      <view class="section-title">奖金信息</view>
      <view class="bonus-card">
        <view class="bonus-row">
          <text class="bonus-label">当前奖金</text>
          <text class="bonus-value primary">¥{{ formatMoney(currentBonus) }}</text>
        </view>
        <view class="bonus-row">
          <text class="bonus-label">已发放金额</text>
          <text class="bonus-value">¥{{ formatMoney(paidBonus) }}</text>
        </view>
        <view class="bonus-row">
          <text class="bonus-label">待发放金额</text>
          <text class="bonus-value warning">¥{{ formatMoney(pendingBonus) }}</text>
        </view>
      </view>
    </view>
    
    <!-- Performance Chart -->
    <view class="chart-section">
      <view class="section-title">业绩趋势 (近7天)</view>
      <view class="chart-container">
        <view class="chart-bars">
          <view class="chart-bar" v-for="(item, index) in weeklyData" :key="index">
            <view class="bar-fill" :style="{ height: item.height + '%' }"></view>
            <text class="bar-label">{{ item.day }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Refresh Button -->
    <view class="refresh-section">
      <u-button type="primary" @click="loadData" :loading="loading">刷新数据</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@/stores'
import api from '@/utils/api'

const store = useStore()
const loading = ref(false)

// Performance data
const todayPerformance = ref(0)
const monthPerformance = ref(0)
const totalPerformance = ref(0)

// Bonus data
const currentBonus = ref(0)
const paidBonus = ref(0)
const pendingBonus = ref(0)

// Chart data
const weeklyData = ref([
  { day: '周一', amount: 0, height: 0 },
  { day: '周二', amount: 0, height: 0 },
  { day: '周三', amount: 0, height: 0 },
  { day: '周四', amount: 0, height: 0 },
  { day: '周五', amount: 0, height: 0 },
  { day: '周六', amount: 0, height: 0 },
  { day: '周日', amount: 0, height: 0 }
])

const formatMoney = (value: number) => {
  return (value || 0).toFixed(2)
}

const loadData = async () => {
  const employeeId = store.employeeInfo?.id
  if (!employeeId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    // Get realtime performance data
    const data = await api.getRealtimePerformance(employeeId)
    
    todayPerformance.value = data.todayAmount || 0
    monthPerformance.value = data.monthAmount || 0
    totalPerformance.value = data.totalAmount || 0
    
    // Get bonus data
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const bonusData = await api.getTechnicianBonus(employeeId, currentMonth)
    
    currentBonus.value = bonusData.currentBonus || 0
    paidBonus.value = bonusData.paidBonus || 0
    pendingBonus.value = bonusData.pendingBonus || 0
    
    // Update weekly data
    if (data.weeklyData && data.weeklyData.length > 0) {
      const maxAmount = Math.max(...data.weeklyData.map((item: number) => item || 0))
      weeklyData.value = weeklyData.value.map((item, index) => ({
        ...item,
        amount: data.weeklyData[index] || 0,
        height: maxAmount > 0 ? ((data.weeklyData[index] || 0) / maxAmount * 100) : 0
      }))
    }
    
    uni.showToast({ title: '数据已更新', icon: 'success' })
  } catch (error: any) {
    console.error('Failed to load performance data:', error)
    uni.showToast({ title: error?.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.performance-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.summary-section {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx 20rpx;
  text-align: center;
}

.card-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.card-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.bonus-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.bonus-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
}

.bonus-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.bonus-row:last-child {
  border-bottom: none;
}

.bonus-label {
  font-size: 28rpx;
  color: #666;
}

.bonus-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.bonus-value.primary {
  color: #409EFF;
}

.bonus-value.warning {
  color: #E6A23C;
}

.chart-section {
  margin-bottom: 30rpx;
}

.chart-container {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200rpx;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-fill {
  width: 40rpx;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx 6rpx 0 0;
  min-height: 10rpx;
}

.bar-label {
  font-size: 22rpx;
  color: #666;
  margin-top: 10rpx;
}

.refresh-section {
  margin-top: 30rpx;
}
</style>