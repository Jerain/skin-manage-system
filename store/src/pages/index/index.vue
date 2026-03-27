<template>
  <view class="home-page">
    <!-- Employee Info -->
    <view class="employee-header" v-if="isLoggedIn">
      <u-avatar :src="employeeInfo?.avatar" :text="employeeInfo?.name" size="80" />
      <view class="employee-info">
        <text class="employee-name">{{ employeeInfo?.name }}</text>
        <text class="employee-role">{{ getRoleText(employeeInfo?.role) }}</text>
      </view>
    </view>
    
    <!-- Attendance Card -->
    <view class="attendance-card" v-if="isLoggedIn">
      <view class="card-title">今日考勤</view>
      <view class="attendance-status" v-if="todayAttendance">
        <view class="status-item">
          <text class="label">上班时间</text>
          <text class="value">{{ formatTime(todayAttendance.checkIn) }}</text>
        </view>
        <view class="status-item" v-if="todayAttendance.checkOut">
          <text class="label">下班时间</text>
          <text class="value">{{ formatTime(todayAttendance.checkOut) }}</text>
        </view>
        <view class="status-item">
          <text class="label">状态</text>
          <u-tag :type="getAttendanceStatusType(todayAttendance.status)" :text="getAttendanceStatusText(todayAttendance.status)" />
        </view>
      </view>
      <view class="attendance-empty" v-else>
        <text>今日尚未打卡</text>
      </view>
      
      <view class="attendance-buttons">
        <u-button type="primary" @click="handleCheckIn" :disabled="!!todayAttendance?.checkIn">
          上班打卡
        </u-button>
        <u-button type="success" @click="handleCheckOut" :disabled="!todayAttendance?.checkIn || !!todayAttendance?.checkOut">
          下班打卡
        </u-button>
      </view>
    </view>
    
    <!-- Quick Actions -->
    <view class="quick-actions" v-if="isLoggedIn">
      <view class="action-item" @click="goToCheckIn">
        <u-icon name="checkmark-circle" size="50" color="#67C23A" />
        <text>客户签到</text>
      </view>
      <view class="action-item" @click="goToAppointments">
        <u-icon name="calendar" size="50" color="#409EFF" />
        <text>今日预约</text>
      </view>
      <view class="action-item" @click="goToCustomers">
        <u-icon name="account" size="50" color="#E6A23C" />
        <text>客户管理</text>
      </view>
    </view>
    
    <!-- Login Prompt -->
    <view class="login-prompt" v-if="!isLoggedIn">
      <u-icon name="account" size="80" color="#999" />
      <text class="prompt-text">请先登录</text>
      <u-button type="primary" @click="goToLogin">立即登录</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import api from '@/utils/api'

const store = useStore()
const isLoggedIn = computed(() => store.isLoggedIn)
const employeeInfo = computed(() => store.employeeInfo)

const todayAttendance = ref<any>(null)

const getRoleText = (role?: string) => {
  const map: Record<string, string> = {
    manager: '店长',
    technician: '技师',
    receptionist: '前台'
  }
  return map[role || ''] || role || ''
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getAttendanceStatusType = (status?: string) => {
  const map: Record<string, string> = {
    normal: 'success',
    late: 'warning',
    leave: 'info',
    absent: 'danger'
  }
  return map[status || ''] || 'info'
}

const getAttendanceStatusText = (status?: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    late: '迟到',
    leave: '请假',
    absent: '缺勤'
  }
  return map[status || ''] || '未打卡'
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
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

const handleCheckIn = async () => {
  if (!employeeInfo.value) return
  try {
    await api.checkIn(employeeInfo.value.id, 'face')
    uni.showToast({ title: '打卡成功', icon: 'success' })
    loadTodayAttendance()
  } catch (e) {
    console.error(e)
  }
}

const handleCheckOut = async () => {
  if (!employeeInfo.value) return
  try {
    await api.checkOut(employeeInfo.value.id, 'face')
    uni.showToast({ title: '打卡成功', icon: 'success' })
    loadTodayAttendance()
  } catch (e) {
    console.error(e)
  }
}

const loadTodayAttendance = async () => {
  if (!employeeInfo.value) return
  try {
    todayAttendance.value = await api.getTodayAttendance(employeeInfo.value.id)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadTodayAttendance()
  }
})
</script>

<style scoped>
.home-page {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
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

.attendance-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.attendance-status {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.label {
  font-size: 24rpx;
  color: #999;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.attendance-empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.attendance-buttons {
  display: flex;
  gap: 20rpx;
}

.attendance-buttons button {
  flex: 1;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 10rpx;
  padding: 40rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.action-item text {
  font-size: 24rpx;
  color: #666;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 40rpx;
  gap: 30rpx;
}

.prompt-text {
  font-size: 28rpx;
  color: #999;
}
</style>
