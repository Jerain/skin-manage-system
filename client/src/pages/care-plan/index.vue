<template>
  <view class="care-plan-page">
    <!-- Header -->
    <view class="page-header">
      <text class="title">我的护理计划</text>
      <text class="subtitle">专属个性化护肤方案</text>
    </view>

    <!-- Active Plan -->
    <view class="active-plan" v-if="activePlan">
      <view class="plan-card">
        <view class="plan-header">
          <view class="plan-info">
            <text class="plan-name">{{ activePlan.skinType || '综合护理' }}方案</text>
            <text class="plan-date">{{ activePlan.planStartDate }} 至 {{ activePlan.planEndDate }}</text>
          </view>
          <view class="plan-status" :class="activePlan.status">
            {{ getStatusText(activePlan.status) }}
          </view>
        </view>

        <!-- Progress -->
        <view class="progress-section">
          <view class="progress-info">
            <text class="progress-label">执行进度</text>
            <text class="progress-value">{{ completedCount }}/{{ totalCount }}</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
          </view>
        </view>

        <!-- Items -->
        <view class="plan-items">
          <text class="section-title">护理项目</text>
          <view v-for="item in activePlan.items" :key="item.id" class="plan-item">
            <view class="item-left">
              <view class="item-date">{{ item.plannedMonth || item.suggestedDate }}</view>
              <view class="item-name">{{ item.serviceName || '护理项目' + item.serviceId }}</view>
            </view>
            <view class="item-status" :class="item.status">
              {{ getItemStatusText(item.status) }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view class="empty-state" v-else>
      <u-icon name="clipboard-list" size="80" color="#ccc" />
      <text class="empty-text">暂无护理计划</text>
      <text class="empty-tip">我们将根据您的肤质定制专属护理方案</text>
      <u-button type="primary" @click="generatePlan">生成护理计划</u-button>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions" v-if="activePlan">
      <view class="action-card" @click="goToServices">
        <u-icon name="plus-circle" size="40" color="#409EFF" />
        <text>添加护理项目</text>
      </view>
      <view class="action-card" @click="viewHistory">
        <u-icon name="clock" size="40" color="#67C23A" />
        <text>历史计划</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-mask">
      <u-loading-icon size="40" color="#667eea" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import api from '@/utils/api'

const store = useStore()
const loading = ref(false)
const activePlan = ref<any>(null)
const plans = ref<any[]>([])

const completedCount = computed(() => {
  return activePlan.value?.items?.filter((i: any) => i.status === 'completed').length || 0
})

const totalCount = computed(() => {
  return activePlan.value?.items?.length || 0
})

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const getStatusText = (status: string) => {
  const map: Record<string, string> = { active: '进行中', completed: '已完成', expired: '已过期' }
  return map[status] || status
}

const getItemStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待执行', completed: '已完成', skipped: '已跳过' }
  return map[status] || status
}

const loadPlans = async () => {
  if (!store.customerInfo?.id) return
  
  loading.value = true
  try {
    // Mock data for demo
    activePlan.value = {
      id: 1,
      skinType: '混合肌护理',
      planStartDate: '2026-03-01',
      planEndDate: '2026-05-31',
      status: 'active',
      items: [
        { id: 1, serviceId: 1, serviceName: '深层清洁护理', plannedMonth: '3月', suggestedDate: '2026-03-15', status: 'completed' },
        { id: 2, serviceId: 2, serviceName: '补水保湿护理', plannedMonth: '3月', suggestedDate: '2026-03-28', status: 'completed' },
        { id: 3, serviceId: 1, serviceName: '深层清洁护理', plannedMonth: '4月', suggestedDate: '2026-04-10', status: 'pending' },
        { id: 4, serviceId: 3, serviceName: '抗衰紧致护理', plannedMonth: '4月', suggestedDate: '2026-04-25', status: 'pending' },
        { id: 5, serviceId: 2, serviceName: '补水保湿护理', plannedMonth: '5月', suggestedDate: '2026-05-15', status: 'pending' },
      ]
    }
  } catch (e) {
    console.error('Load plans error:', e)
  } finally {
    loading.value = false
  }
}

const generatePlan = () => {
  uni.showToast({ title: '正在生成护理计划...', icon: 'loading' })
  setTimeout(() => {
    loadPlans()
    uni.showToast({ title: '计划已生成', icon: 'success' })
  }, 1500)
}

const goToServices = () => {
  uni.switchTab({ url: '/pages/services/index' })
}

const viewHistory = () => {
  uni.showToast({ title: '历史计划开发中', icon: 'none' })
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.care-plan-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.subtitle {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
  display: block;
  margin-top: 10rpx;
}

.plan-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.plan-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.plan-date {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.plan-status {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.plan-status.active {
  background: #e8f5e9;
  color: #4caf50;
}

.plan-status.completed {
  background: #e3f2fd;
  color: #2196f3;
}

.progress-section {
  margin-bottom: 30rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.progress-label {
  font-size: 28rpx;
  color: #666;
}

.progress-value {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.progress-bar {
  height: 16rpx;
  background: #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.plan-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.item-date {
  font-size: 24rpx;
  color: #999;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  margin-top: 6rpx;
}

.item-status {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.item-status.pending {
  background: #fff3e0;
  color: #ff9800;
}

.item-status.completed {
  background: #e8f5e9;
  color: #4caf50;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-top: 30rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
  margin-bottom: 40rpx;
}

.quick-actions {
  display: flex;
  gap: 20rpx;
}

.action-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.action-card text {
  font-size: 26rpx;
  color: #666;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
</style>