<template>
  <view class="comparison-page">
    <!-- 顶部说明 -->
    <view class="header">
      <text class="header-title">我的肤质改善对比</text>
      <text class="header-sub">护理前后的真实变化，看得见的改善</text>
    </view>

    <!-- 对比图列表 -->
    <view v-if="comparisons.length === 0" class="empty-state">
      <text class="empty-icon">🪞</text>
      <text class="empty-title">暂无对比图</text>
      <text class="empty-desc">完成护理后，门店会为您生成肤质改善对比图</text>
    </view>

    <view v-else class="comparison-list">
      <view v-for="item in comparisons" :key="item.id" class="comparison-card">
        <!-- 对比图 -->
        <view class="image-area">
          <image
            v-if="item.comparisonImageUrl"
            :src="resolveImageUrl(item.comparisonImageUrl)"
            class="comparison-image"
            mode="aspectFill"
            @click="previewImage(resolveImageUrl(item.comparisonImageUrl))"
          />
          <view v-else class="image-placeholder">
            <text class="placeholder-text">对比图生成中</text>
          </view>
        </view>

        <!-- 前后滑块对比（当有前后照片时） -->
        <view v-if="item.before?.photoUrl && item.after?.photoUrl" class="slider-area">
          <view class="slider-container" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <image :src="resolveImageUrl(item.after.photoUrl)" class="slider-image" mode="aspectFill" />
            <view class="slider-before" :style="{ width: sliderPosition + '%' }">
              <image :src="resolveImageUrl(item.before.photoUrl)" class="slider-image" mode="aspectFill" />
            </view>
            <view class="slider-handle" :style="{ left: sliderPosition + '%' }">
              <view class="handle-line"></view>
            </view>
          </view>
          <view class="slider-labels">
            <text class="slider-label">护理前</text>
            <text class="slider-label">护理后</text>
          </view>
        </view>

        <!-- 改善亮点 -->
        <view class="highlights-section">
          <view class="highlights-title">
            <text class="title-icon">✨</text>
            <text class="title-text">改善亮点</text>
          </view>
          <text class="highlights-content">{{ item.improvementHighlights || '护理记录已归档' }}</text>
        </view>

        <!-- 时间 -->
        <view class="meta-row">
          <text class="meta-time">{{ formatDate(item.createdAt) }}</text>
          <u-tag v-if="item.pushed" type="success" text="已推送" size="mini" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api, { resolveImageUrl } from '@/utils/api'
import { useStore } from '@/stores'

const store = useStore()
const comparisons = ref<any[]>([])

// 滑块位置 0-100
const sliderPosition = ref(50)

const onTouchStart = (e: any) => {
  updateSliderPosition(e)
}

const onTouchMove = (e: any) => {
  updateSliderPosition(e)
}

const onTouchEnd = () => {
  // 保持当前位置
}

const updateSliderPosition = (e: any) => {
  const touch = e.touches?.[0] || e.changedTouches?.[0]
  if (!touch) return
  const detail = touch.clientX !== undefined ? touch.clientX : touch.pageX
  const query = uni.createSelectorQuery()
  query.select('.slider-container').boundingClientRect((rect: any) => {
    if (!rect) return
    const ratio = (detail - rect.left) / rect.width
    sliderPosition.value = Math.max(0, Math.min(100, ratio * 100))
  }).exec()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const previewImage = (url: string) => {
  uni.previewImage({ urls: [url], current: url })
}

onMounted(async () => {
  try {
    const customerId = store.userInfo?.id
    if (!customerId) {
      // 尝试从本地存储取
      const cached = uni.getStorageSync('userInfo')
      if (!cached?.id) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      const list = await api.getSkinComparisons(cached.id)
      comparisons.value = Array.isArray(list) ? list : (list?.data || [])
      return
    }
    const list = await api.getSkinComparisons(customerId)
    comparisons.value = Array.isArray(list) ? list : (list?.data || [])
  } catch (e: any) {
    console.error(e)
  }
})
</script>

<style scoped>
.comparison-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 30rpx 60rpx;
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.header-sub {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #666;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}

.comparison-list {
  padding: 20rpx;
  margin-top: -30rpx;
}

.comparison-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.image-area {
  width: 100%;
  height: 340rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f7f8fa;
}

.comparison-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 26rpx;
  color: #999;
}

.slider-area {
  margin-top: 24rpx;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 320rpx;
  overflow: hidden;
  border-radius: 12rpx;
  background: #f7f8fa;
}

.slider-image {
  width: 100%;
  height: 100%;
}

.slider-before {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
}

.slider-before .slider-image {
  width: 100vw;
  max-width: 100%;
}

.slider-handle {
  position: absolute;
  top: 0;
  height: 100%;
  width: 4rpx;
  background: #fff;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.4);
}

.handle-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
}

.slider-label {
  font-size: 24rpx;
  color: #999;
}

.highlights-section {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #fdf8ef;
  border-radius: 12rpx;
}

.highlights-title {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.title-icon {
  font-size: 30rpx;
  margin-right: 10rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #b8860b;
}

.highlights-content {
  font-size: 27rpx;
  color: #666;
  line-height: 1.7;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.meta-time {
  font-size: 24rpx;
  color: #999;
}
</style>
