<template>
  <view class="stores-page">
    <u-search v-model="keyword" placeholder="搜索门店" @search="handleSearch" />
    
    <scroll-view scroll-y class="store-list">
      <view class="store-card" v-for="store in filteredStores" :key="store.id" @click="selectStore(store)">
        <view class="store-header">
          <text class="store-name">{{ store.name }}</text>
          <u-tag v-if="store.status === 1" type="success" text="营业中" size="mini" />
        </view>
        
        <view class="store-address">
          <u-icon name="map-pin" size="16" color="#999" />
          <text>{{ store.address }}</text>
        </view>
        
        <view class="store-phone">
          <u-icon name="phone" size="16" color="#999" />
          <text>{{ store.phone }}</text>
        </view>
        
        <view class="store-hours">
          <u-icon name="clock" size="16" color="#999" />
          <text>{{ store.businessHours }}</text>
        </view>
        
        <view class="store-description" v-if="store.description">
          {{ store.description }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const keyword = ref('')
const stores = ref<any[]>([])
const loading = ref(false)

const filteredStores = computed(() => {
  if (!keyword.value) return stores.value
  return stores.value.filter((s: any) => 
    s.name.includes(keyword.value) || s.address.includes(keyword.value)
  )
})

const handleSearch = () => {
  // 搜索逻辑在 computed 中处理
}

const selectStore = (store: any) => {
  uni.setStorageSync('selectedStore', store)
  uni.navigateBack()
}

onMounted(async () => {
  loading.value = true
  try {
    stores.value = await api.getStores()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stores-page {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.store-list {
  margin-top: 20rpx;
}

.store-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.store-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.store-address,
.store-phone,
.store-hours {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.store-description {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
  padding-top: 15rpx;
  border-top: 1rpx solid #f5f5f5;
}
</style>
