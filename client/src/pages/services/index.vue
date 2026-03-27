<template>
  <view class="services-page">
    <!-- Category Tabs -->
    <view class="category-tabs">
      <scroll-view scroll-x>
        <view 
          class="tab-item" 
          :class="{ active: activeCategory === 0 }"
          @click="selectCategory(0, null)"
        >
          全部
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeCategory === category.id }"
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id, category.name)"
        >
          {{ category.name }}
        </view>
      </scroll-view>
    </view>
    
    <!-- Services List -->
    <scroll-view scroll-y class="service-list">
      <view class="service-card" v-for="service in filteredServices" :key="service.id" @click="selectService(service)">
        <view class="service-header">
          <text class="service-name">{{ service.name }}</text>
          <u-tag v-if="service.isFeatured" type="warning" text="推荐" size="mini" />
        </view>
        
        <view class="service-info">
          <text class="service-price">¥{{ service.price }}</text>
          <text class="service-duration">{{ service.duration }}分钟</text>
        </view>
        
        <view class="service-desc" v-if="service.description">
          {{ service.description }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const categories = ref<any[]>([])
const services = ref<any[]>([])
const activeCategory = ref(0)

const filteredServices = computed(() => {
  if (activeCategory.value === 0) return services.value
  return services.value.filter((s: any) => s.categoryId === activeCategory.value)
})

const selectCategory = async (id: number, name: string | null) => {
  activeCategory.value = id
  if (id !== 0) {
    try {
      const storeId = uni.getStorageSync('selectedStore')?.id
      services.value = await api.getServicesByCategory(id, storeId)
    } catch (e) {
      console.error(e)
    }
  }
}

const selectService = (service: any) => {
  uni.setStorageSync('selectedService', service)
  uni.navigateBack()
}

onMounted(async () => {
  try {
    const [catList, serviceList] = await Promise.all([
      api.getCategories(),
      api.getServices()
    ])
    categories.value = catList
    services.value = serviceList
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.services-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.category-tabs {
  background: #fff;
  white-space: nowrap;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  display: inline-block;
  padding: 15rpx 30rpx;
  margin-right: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  color: #409EFF;
  font-weight: bold;
}

.service-list {
  padding: 20rpx;
  height: calc(100vh - 100rpx);
}

.service-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.service-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.service-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.service-duration {
  font-size: 24rpx;
  color: #999;
}

.service-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
