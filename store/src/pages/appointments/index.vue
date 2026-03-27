<template>
  <view class="appointments-page">
    <!-- Tab Filter -->
    <u-tabs :list="tabList" :current="currentTab" @change="onTabChange" />
    
    <!-- Appointments List -->
    <scroll-view scroll-y class="appointment-list">
      <view class="empty-state" v-if="filteredAppointments.length === 0">
        <u-empty mode="data" text="今日暂无预约" />
      </view>
      
      <view class="appointment-card" v-for="apt in filteredAppointments" :key="apt.id">
        <view class="apt-header">
          <text class="apt-time">{{ apt.appointmentTime }}</text>
          <u-tag :type="getStatusType(apt.status)" :text="getStatusText(apt.status)" size="mini" />
        </view>
        
        <view class="apt-customer">
          <text class="customer-name">{{ apt.customer?.name }}</text>
          <text class="customer-phone">{{ apt.customer?.phone }}</text>
        </view>
        
        <view class="apt-service">
          <text class="service-name">{{ apt.service?.name }}</text>
          <text class="service-duration">{{ apt.service?.duration }}分钟</text>
        </view>
        
        <!-- Actions -->
        <view class="apt-actions">
          <u-button v-if="apt.status === 'pending'" type="success" size="mini" @click="handleConfirm(apt)">
            确认
          </u-button>
          <u-button v-if="apt.status === 'pending'" type="warning" size="mini" @click="handleReject(apt)">
            拒绝
          </u-button>
          <u-button v-if="apt.status === 'confirmed'" type="primary" size="mini" @click="handleComplete(apt)">
            完成服务
          </u-button>
        </view>
        
        <view class="apt-note" v-if="apt.notes">
          备注：{{ apt.notes }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const tabList = [
  { name: '全部' },
  { name: '待确认' },
  { name: '已确认' },
  { name: '已完成' }
]

const currentTab = ref(0)
const appointments = ref<any[]>([])
const loading = ref(false)

const filteredAppointments = computed(() => {
  switch (currentTab.value) {
    case 1: return appointments.value.filter((a: any) => a.status === 'pending')
    case 2: return appointments.value.filter((a: any) => a.status === 'confirmed')
    case 3: return appointments.value.filter((a: any) => a.status === 'completed')
    default: return appointments.value
  }
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const onTabChange = (index: number) => {
  currentTab.value = index
}

const handleConfirm = async (apt: any) => {
  try {
    await api.confirmAppointment(apt.id)
    uni.showToast({ title: '已确认', icon: 'success' })
    loadAppointments()
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleReject = async (apt: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要拒绝该预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.rejectAppointment(apt.id, '门店拒绝')
          uni.showToast({ title: '已拒绝', icon: 'success' })
          loadAppointments()
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const handleComplete = async (apt: any) => {
  uni.showModal({
    title: '完成确认',
    content: '确认服务已完成吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.completeAppointment(apt.id)
          uni.showToast({ title: '已完成', icon: 'success' })
          loadAppointments()
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const loadAppointments = async () => {
  loading.value = true
  try {
    appointments.value = await api.getTodayAppointments()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.appointments-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.appointment-list {
  padding: 20rpx;
  height: calc(100vh - 100rpx);
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
}

.appointment-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.apt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.apt-time {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.apt-customer {
  display: flex;
  gap: 20rpx;
  margin-bottom: 10rpx;
}

.customer-name {
  font-size: 28rpx;
  color: #333;
}

.customer-phone {
  font-size: 28rpx;
  color: #666;
}

.apt-service {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.service-name {
  font-size: 28rpx;
  color: #409EFF;
  font-weight: bold;
}

.service-duration {
  font-size: 26rpx;
  color: #999;
}

.apt-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 15rpx;
}

.apt-note {
  margin-top: 15rpx;
  padding-top: 15rpx;
  border-top: 1rpx solid #f5f5f5;
  font-size: 24rpx;
  color: #999;
}
</style>
