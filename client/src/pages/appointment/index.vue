<template>
  <view class="appointments-page">
    <!-- Tab Filter -->
    <u-tabs :list="tabList" :current="currentTab" @change="onTabChange" />
    
    <!-- Appointments List -->
    <scroll-view scroll-y class="appointment-list">
      <view class="empty-state" v-if="filteredAppointments.length === 0">
        <u-empty mode="data" text="暂无预约记录" />
      </view>
      
      <view class="appointment-card" v-for="apt in filteredAppointments" :key="apt.id">
        <view class="apt-header">
          <text class="apt-service">{{ apt.service.name }}</text>
          <u-tag :type="getStatusType(apt.status)" :text="getStatusText(apt.status)" size="mini" />
        </view>
        
        <view class="apt-info">
          <view class="info-row">
            <u-icon name="map-pin" size="14" color="#999" />
            <text>{{ apt.store.name }}</text>
          </view>
          <view class="info-row">
            <u-icon name="account" size="14" color="#999" />
            <text>技师：{{ apt.employee.name }}</text>
          </view>
          <view class="info-row">
            <u-icon name="clock" size="14" color="#999" />
            <text>{{ apt.appointmentDate }} {{ apt.appointmentTime }}</text>
          </view>
        </view>
        
        <!-- Action Buttons -->
        <view class="apt-actions" v-if="apt.status === 'pending' || apt.status === 'confirmed'">
          <u-button size="mini" type="warning" @click="handleCancel(apt)">取消预约</u-button>
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
    cancelled: 'info',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const onTabChange = (index: number) => {
  currentTab.value = index
}

const handleCancel = async (apt: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.cancelAppointment(apt.id, '客户取消')
          uni.showToast({ title: '已取消', icon: 'success' })
          loadAppointments()
        } catch (e) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

const loadAppointments = async () => {
  loading.value = true
  try {
    const userInfo = uni.getStorageSync('userInfo')
    appointments.value = await api.getAppointments({ customerId: userInfo?.id })
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
  margin-bottom: 20rpx;
}

.apt-service {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.apt-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 15rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.apt-actions {
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
