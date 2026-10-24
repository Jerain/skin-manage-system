<template>
  <view class="attendance-page">
    <!-- 今日考勤卡片 -->
    <view class="card">
      <view class="card-title">今日考勤</view>

      <view v-if="todayAttendance" class="status-section">
        <view class="status-item">
          <text class="label">上班时间</text>
          <text class="value">{{ formatTime(todayAttendance.checkIn) }}</text>
        </view>
        <view class="status-item">
          <text class="label">下班时间</text>
          <text class="value">{{ formatTime(todayAttendance.checkOut) }}</text>
        </view>
        <view class="status-item">
          <text class="label">状态</text>
          <u-tag
            :type="getStatusType(todayAttendance.status)"
            :text="getStatusText(todayAttendance.status)"
          />
        </view>
        <view v-if="todayAttendance.workDuration" class="status-item">
          <text class="label">工作时长</text>
          <text class="value">{{ todayAttendance.workDuration }}</text>
        </view>
      </view>
      <view v-else class="empty-text">今日尚未打卡</view>

      <view class="btn-group">
        <u-button
          type="primary"
          @click="handleCheckIn"
          :loading="submitting"
          :disabled="!!todayAttendance?.checkIn"
        >上班打卡</u-button>
        <u-button
          type="success"
          @click="handleCheckOut"
          :loading="submitting"
          :disabled="!todayAttendance?.checkIn || !!todayAttendance?.checkOut"
        >下班打卡</u-button>
      </view>
    </view>

    <!-- 考勤记录 -->
    <view class="card">
      <view class="card-title">考勤记录</view>

      <view class="date-range">
        <u-input
          v-model="startDate"
          placeholder="开始日期 YYYY-MM-DD"
          border="surround"
          type="date"
        />
        <u-input
          v-model="endDate"
          placeholder="结束日期 YYYY-MM-DD"
          border="surround"
          type="date"
        />
      </view>
      <u-button type="primary" plain @click="loadRecords">查询</u-button>

      <view v-if="records.length" class="record-list">
        <view v-for="item in records" :key="item.id" class="record-item">
          <view class="record-left">
            <text class="record-date">{{ formatDate(item.workDate) }}</text>
            <text class="record-time">
              {{ formatTime(item.checkIn) }} ~ {{ formatTime(item.checkOut) }}
            </text>
          </view>
          <u-tag
            :type="getStatusType(item.status)"
            :text="getStatusText(item.status)"
          />
        </view>
      </view>
      <view v-else class="empty-text">暂无考勤记录</view>
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
const records = ref<any[]>([])
const submitting = ref(false)
const startDate = ref('')
const endDate = ref('')

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return String(dateStr).slice(0, 10)
}

const getStatusType = (status?: string) => {
  const map: Record<string, string> = {
    normal: 'success',
    late: 'warning',
    leave: 'info',
    absent: 'danger'
  }
  return map[status || ''] || 'info'
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    late: '迟到',
    leave: '请假',
    absent: '缺勤'
  }
  return map[status || ''] || '未打卡'
}

const loadTodayAttendance = async () => {
  if (!employeeInfo.value) return
  try {
    const res: any = await api.getTodayAttendance(employeeInfo.value.id)
    todayAttendance.value = res?.data || res
  } catch (e) {
    console.error(e)
  }
}

const loadRecords = async () => {
  if (!employeeInfo.value) return
  try {
    const res: any = await api.getAttendances({
      employeeId: employeeInfo.value.id,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined
    })
    const data = res?.data || res
    records.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
  }
}

const handleCheckIn = async () => {
  if (!employeeInfo.value) return
  submitting.value = true
  try {
    await api.checkIn(employeeInfo.value.id, 'face')
    uni.showToast({ title: '打卡成功', icon: 'success' })
    await loadTodayAttendance()
    await loadRecords()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const handleCheckOut = async () => {
  if (!employeeInfo.value) return
  submitting.value = true
  try {
    await api.checkOut(employeeInfo.value.id, 'face')
    uni.showToast({ title: '打卡成功', icon: 'success' })
    await loadTodayAttendance()
    await loadRecords()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadTodayAttendance()
    loadRecords()
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' })
  }
})
</script>

<style scoped>
.attendance-page {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.status-section {
  margin-bottom: 24rpx;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-item .label {
  font-size: 28rpx;
  color: #999;
}

.status-item .value {
  font-size: 28rpx;
  color: #333;
}

.btn-group {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.btn-group .u-button {
  flex: 1;
}

.date-range {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.date-range .u-input {
  flex: 1;
}

.record-list {
  margin-top: 24rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-left {
  display: flex;
  flex-direction: column;
}

.record-date {
  font-size: 28rpx;
  color: #333;
}

.record-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.empty-text {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  padding: 40rpx 0;
}
</style>
