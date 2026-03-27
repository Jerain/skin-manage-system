<template>
  <view class="appointment-page">
    <!-- Step Indicator -->
    <u-steps :list="steps" :current="currentStep" />
    
    <!-- Step 1: Select Service -->
    <view v-if="currentStep === 0" class="step-content">
      <view class="section-title">选择服务项目</view>
      <scroll-view scroll-y class="service-list">
        <view 
          class="service-card"
          :class="{ selected: appointment.serviceId === service.id }"
          v-for="service in services"
          :key="service.id"
          @click="selectService(service)"
        >
          <text class="service-name">{{ service.name }}</text>
          <text class="service-price">¥{{ service.price }}</text>
          <text class="service-duration">{{ service.duration }}分钟</text>
        </view>
      </scroll-view>
      <view class="step-footer">
        <u-button type="primary" @click="nextStep" :disabled="!appointment.serviceId">下一步</u-button>
      </view>
    </view>
    
    <!-- Step 2: Select Store -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="section-title">选择门店</view>
      <scroll-view scroll-y class="store-list">
        <view 
          class="store-card"
          :class="{ selected: appointment.storeId === store.id }"
          v-for="store in stores"
          :key="store.id"
          @click="selectStore(store)"
        >
          <text class="store-name">{{ store.name }}</text>
          <text class="store-address">{{ store.address }}</text>
          <text class="store-phone">{{ store.phone }}</text>
        </view>
      </scroll-view>
      <view class="step-footer">
        <u-button @click="prevStep">上一步</u-button>
        <u-button type="primary" @click="nextStep" :disabled="!appointment.storeId">下一步</u-button>
      </view>
    </view>
    
    <!-- Step 3: Select Employee -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="section-title">选择技师</view>
      <scroll-view scroll-y class="employee-list">
        <view 
          class="employee-card"
          :class="{ selected: appointment.employeeId === employee.id }"
          v-for="employee in employees"
          :key="employee.id"
          @click="selectEmployee(employee)"
        >
          <u-avatar :src="employee.avatar" :text="employee.name" />
          <view class="employee-info">
            <text class="employee-name">{{ employee.name }}</text>
            <text class="employee-role">{{ getRoleText(employee.role) }}</text>
            <u-rate :value="employee.rating" disabled size="14" />
          </view>
        </view>
      </scroll-view>
      <view class="step-footer">
        <u-button @click="prevStep">上一步</u-button>
        <u-button type="primary" @click="nextStep" :disabled="!appointment.employeeId">下一步</u-button>
      </view>
    </view>
    
    <!-- Step 4: Select Time -->
    <view v-if="currentStep === 3" class="step-content">
      <view class="section-title">选择时间</view>
      
      <uni-datetime-picker 
        type="date" 
        v-model="appointment.appointmentDate"
        :end="maxDate"
        @change="onDateChange"
      />
      
      <view class="time-slots">
        <text class="time-title">可选时段</text>
        <view 
          class="time-slot"
          :class="{ 
            selected: appointment.appointmentTime === time,
            disabled: !availableTimes.includes(time)
          }"
          v-for="time in timeSlots"
          :key="time"
          @click="selectTime(time)"
        >
          {{ time }}
        </view>
      </view>
      
      <u-textarea v-model="appointment.notes" placeholder="备注（选填）" maxlength="200" />
      
      <view class="step-footer">
        <u-button @click="prevStep">上一步</u-button>
        <u-button type="primary" @click="submit" :loading="submitting" :disabled="!appointment.appointmentDate || !appointment.appointmentTime">
          提交预约
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const currentStep = ref(0)
const submitting = ref(false)
const services = ref<any[]>([])
const stores = ref<any[]>([])
const employees = ref<any[]>([])
const availableTimes = ref<string[]>([])

const steps = [
  { name: '选择项目' },
  { name: '选择门店' },
  { name: '选择技师' },
  { name: '选择时间' }
]

const appointment = ref({
  serviceId: null as number | null,
  storeId: null as number | null,
  employeeId: null as number | null,
  appointmentDate: '',
  appointmentTime: '',
  notes: ''
})

const selectedService = computed(() => services.value.find((s: any) => s.id === appointment.value.serviceId))

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
]

const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 2))

const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    manager: '店长',
    technician: '技师',
    receptionist: '前台'
  }
  return map[role] || role
}

const selectService = (service: any) => {
  appointment.value.serviceId = service.id
}

const selectStore = (store: any) => {
  appointment.value.storeId = store.id
  loadEmployees(store.id)
}

const selectEmployee = (employee: any) => {
  appointment.value.employeeId = employee.id
}

const selectTime = (time: string) => {
  if (!availableTimes.value.includes(time)) return
  appointment.value.appointmentTime = time
}

const onDateChange = async (e: any) => {
  if (appointment.value.employeeId && e.value) {
    const date = new Date(e.value).toISOString().split('T')[0]
    const service = selectedService.value
    await loadAvailableTimes(appointment.value.employeeId, date, service?.duration || 60)
  }
}

const loadEmployees = async (storeId: number) => {
  try {
    employees.value = await api.getEmployees(storeId)
  } catch (e) {
    console.error(e)
  }
}

const loadAvailableTimes = async (employeeId: number, date: string, duration: number) => {
  try {
    availableTimes.value = await api.getAvailableTimes(employeeId, date, duration)
  } catch (e) {
    console.error(e)
  }
}

const nextStep = async () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submit = async () => {
  if (!appointment.value.serviceId || !appointment.value.storeId || 
      !appointment.value.employeeId || !appointment.value.appointmentDate || !appointment.value.appointmentTime) {
    return uni.showToast({ title: '请完善预约信息', icon: 'none' })
  }
  
  submitting.value = true
  try {
    const date = new Date(appointment.value.appointmentDate).toISOString().split('T')[0]
    const service = selectedService.value
    const duration = (service?.duration || 60) / 60
    
    await api.createAppointment({
      customerId: uni.getStorageSync('userInfo').id,
      storeId: appointment.value.storeId,
      employeeId: appointment.value.employeeId,
      serviceId: appointment.value.serviceId,
      appointmentDate: date,
      appointmentTime: appointment.value.appointmentTime,
      durationHours: duration,
      notes: appointment.value.notes
    })
    
    uni.showToast({ title: '预约成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/appointment/index' })
    }, 1500)
  } catch (e: any) {
    uni.showToast({ title: e.message || '预约失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    services.value = await api.getServices()
    stores.value = await api.getStores()
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.appointment-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.step-content {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.service-list,
.store-list,
.employee-list {
  max-height: 70vh;
}

.service-card,
.store-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 15rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.service-card.selected,
.store-card.selected,
.employee-card.selected {
  border: 2rpx solid #409EFF;
}

.service-name,
.store-name,
.employee-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.service-price {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: bold;
}

.service-duration,
.store-address,
.store-phone {
  font-size: 24rpx;
  color: #999;
}

.employee-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.employee-role {
  font-size: 24rpx;
  color: #666;
}

.time-slots {
  margin-top: 20rpx;
}

.time-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.time-slot {
  display: inline-block;
  width: 140rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background: #fff;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
}

.time-slot.selected {
  background: #409EFF;
  color: #fff;
}

.time-slot.disabled {
  background: #f5f5f5;
  color: #ccc;
}

.step-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 0;
}
</style>
