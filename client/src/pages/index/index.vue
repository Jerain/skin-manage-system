<template>
  <view class="home-page">
    <!-- Search Bar -->
    <view class="search-bar" @click="goToStores">
      <u-icon name="search" />
      <text>搜索门店</text>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" @click="goToAppointment">
        <u-icon name="calendar" size="40" color="#409EFF" />
        <text>立即预约</text>
      </view>
      <view class="action-item" @click="goToOrders">
        <u-icon name="file-text" size="40" color="#67C23A" />
        <text>我的订单</text>
      </view>
      <view class="action-item" @click="goToServices">
        <u-icon name="grid" size="40" color="#E6A23C" />
        <text>服务项目</text>
      </view>
    </view>

    <!-- Featured Stores -->
    <view class="section">
      <view class="section-header">
        <text class="title">推荐门店</text>
        <text class="more" @click="goToStores">更多 ></text>
      </view>
      <view class="store-list">
        <view class="store-card" v-for="store in stores" :key="store.id" @click="selectStore(store)">
          <view class="store-info">
            <text class="store-name">{{ store.name }}</text>
            <text class="store-address">{{ store.address }}</text>
            <view class="store-meta">
              <text class="phone">{{ store.phone }}</text>
              <text class="hours">{{ store.businessHours }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Featured Services -->
    <view class="section">
      <view class="section-header">
        <text class="title">热门项目</text>
        <text class="more" @click="goToServices">更多 ></text>
      </view>
      <scroll-view scroll-x class="service-scroll">
        <view class="service-card" v-for="service in services" :key="service.id">
          <view class="service-name">{{ service.name }}</view>
          <view class="service-price">¥{{ service.price }}</view>
          <view class="service-duration">{{ service.duration }}分钟</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const stores = ref<any[]>([])
const services = ref<any[]>([])

const goToStores = () => uni.navigateTo({ url: '/pages/stores/index' })
const goToServices = () => uni.navigateTo({ url: '/pages/services/index' })
const goToAppointment = () => uni.navigateTo({ url: '/pages/appointment/create' })
const goToOrders = () => uni.navigateTo({ url: '/pages/orders/index' })

const selectStore = (store: any) => {
  uni.setStorageSync('selectedStore', store)
  uni.navigateTo({ url: '/pages/appointment/create' })
}

onMounted(async () => {
  try {
    const [storeList, serviceList] = await Promise.all([
      api.getStores(),
      api.getServices()
    ])
    stores.value = storeList.slice(0, 3)
    services.value = serviceList.filter((s: any) => s.isFeatured).slice(0, 5)
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.home-page {
  padding: 20rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
  color: #999;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 30rpx;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
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

.section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.more {
  font-size: 24rpx;
  color: #999;
}

.store-list {
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
}

.store-card {
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.store-name {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.store-address {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.store-meta {
  display: flex;
  gap: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.service-scroll {
  white-space: nowrap;
}

.service-card {
  display: inline-block;
  width: 200rpx;
  background: #fff;
  padding: 20rpx;
  margin-right: 20rpx;
  border-radius: 10rpx;
  text-align: center;
}

.service-name {
  font-size: 26rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-price {
  color: #ff4d4f;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.service-duration {
  font-size: 22rpx;
  color: #999;
}
</style>
