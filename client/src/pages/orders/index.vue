<template>
  <view class="orders-page">
    <!-- Tab Filter -->
    <u-tabs :list="tabList" :current="currentTab" @change="onTabChange" />
    
    <!-- Orders List -->
    <scroll-view scroll-y class="order-list">
      <view class="empty-state" v-if="filteredOrders.length === 0">
        <u-empty mode="data" text="暂无订单记录" />
      </view>
      
      <view class="order-card" v-for="order in filteredOrders" :key="order.id" @click="viewOrder(order)">
        <view class="order-header">
          <text class="order-no">{{ order.orderNo }}</text>
          <u-tag :type="getStatusType(order.status)" :text="getStatusText(order.status)" size="mini" />
        </view>
        
        <view class="order-info">
          <view class="info-row">
            <text class="label">门店：</text>
            <text class="value">{{ order.store.name }}</text>
          </view>
          <view class="info-row">
            <text class="label">服务：</text>
            <text class="value">{{ order.service.name }}</text>
          </view>
          <view class="info-row" v-if="order.employee">
            <text class="label">技师：</text>
            <text class="value">{{ order.employee.name }}</text>
          </view>
        </view>
        
        <view class="order-price">
          <text class="amount">¥{{ order.amount }}</text>
        </view>
        
        <view class="order-meta">
          <u-tag :type="order.payStatus === 'paid' ? 'success' : 'warning'" 
                  :text="order.payStatus === 'paid' ? '已支付' : '未支付'" 
                  size="mini" />
          <text class="order-time">{{ formatDate(order.createdAt) }}</text>
        </view>
        
        <!-- Pay Button -->
        <view class="order-actions" v-if="order.payStatus === 'unpaid' && order.status === 'pending'">
          <u-button type="primary" size="mini" @click.stop="handlePay(order)">去支付</u-button>
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
  { name: '待支付' },
  { name: '进行中' },
  { name: '已完成' }
]

const currentTab = ref(0)
const orders = ref<any[]>([])
const loading = ref(false)

const filteredOrders = computed(() => {
  switch (currentTab.value) {
    case 1: return orders.value.filter((o: any) => o.payStatus === 'unpaid')
    case 2: return orders.value.filter((o: any) => o.status === 'processing')
    case 3: return orders.value.filter((o: any) => o.status === 'completed')
    default: return orders.value
  }
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    processing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const onTabChange = (index: number) => {
  currentTab.value = index
}

const viewOrder = (order: any) => {
  uni.setStorageSync('selectedOrder', order)
  uni.navigateTo({ url: '/pages/orders/detail' })
}

const handlePay = async (order: any) => {
  uni.showActionSheet({
    itemList: ['余额支付', '微信支付', '支付宝支付'],
    success: async (res) => {
      const payTypeMap = ['balance', 'wechat', 'alipay']
      try {
        await api.payOrder(order.id, payTypeMap[res.tapIndex])
        uni.showToast({ title: '支付成功', icon: 'success' })
        loadOrders()
      } catch (e) {
        uni.showToast({ title: '支付失败', icon: 'none' })
      }
    }
  })
}

const loadOrders = async () => {
  loading.value = true
  try {
    const userInfo = uni.getStorageSync('userInfo')
    orders.value = await api.getOrders({ customerId: userInfo?.id })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.order-list {
  padding: 20rpx;
  height: calc(100vh - 100rpx);
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
}

.order-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-no {
  font-size: 24rpx;
  color: #666;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 15rpx;
}

.info-row {
  font-size: 26rpx;
  display: flex;
}

.label {
  color: #999;
  width: 120rpx;
}

.value {
  color: #333;
  flex: 1;
}

.order-price {
  display: flex;
  justify-content: flex-end;
  padding: 10rpx 0;
}

.amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.order-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-actions {
  margin-top: 15rpx;
}
</style>
