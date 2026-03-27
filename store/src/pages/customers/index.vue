<template>
  <view class="customers-page">
    <view class="search-bar">
      <u-search v-model="keyword" placeholder="搜索客户" @search="handleSearch" />
    </view>
    
    <scroll-view scroll-y class="customer-list">
      <view class="customer-card" v-for="customer in filteredCustomers" :key="customer.id" @click="viewCustomer(customer)">
        <view class="customer-info">
          <text class="customer-name">{{ customer.name }}</text>
          <text class="customer-phone">{{ customer.phone }}</text>
        </view>
        <view class="customer-meta">
          <text class="skin-type">{{ customer.skinType || '未设置肤质' }}</text>
          <u-tag type="warning" :text="'LV' + customer.level" size="mini" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const keyword = ref('')
const customers = ref<any[]>([])

const filteredCustomers = computed(() => {
  if (!keyword.value) return customers.value
  return customers.value.filter((c: any) => 
    c.name.includes(keyword.value) || c.phone.includes(keyword.value)
  )
})

const handleSearch = () => {
  // 搜索逻辑在 computed 中处理
}

const viewCustomer = (customer: any) => {
  uni.showToast({ title: '查看客户详情开发中', icon: 'none' })
}

onMounted(async () => {
  try {
    customers.value = await api.getAppointments().then((res: any) => {
      // 去重获取客户列表
      const customerMap = new Map()
      res.forEach((apt: any) => {
        if (apt.customer && !customerMap.has(apt.customer.id)) {
          customerMap.set(apt.customer.id, apt.customer)
        }
      })
      return Array.from(customerMap.values())
    })
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.customers-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
}

.customer-list {
  padding: 20rpx;
  height: calc(100vh - 120rpx);
}

.customer-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.customer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.customer-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.customer-phone {
  font-size: 28rpx;
  color: #666;
}

.customer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skin-type {
  font-size: 24rpx;
  color: #999;
}
</style>
