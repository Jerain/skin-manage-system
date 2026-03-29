<template>
  <view class="membership-page">
    <!-- Header -->
    <view class="page-header">
      <view class="level-badge">
        <text class="level-name">{{ currentLevel?.name || '普通会员' }}</text>
        <text class="level-icon">👑</text>
      </view>
      <view class="level-info">
        <text class="level-title">{{ currentLevel?.name || 'LV1' }}</text>
        <view class="level-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: levelProgress + '%' }"></view>
          </view>
          <text class="progress-text">{{ growthValue }}/{{ nextLevel?.requiredValue || currentLevel?.requiredValue || 1000 }} 成长值</text>
        </view>
      </view>
    </view>

    <!-- Benefits Card -->
    <view class="benefits-card">
      <text class="card-title">会员权益</text>
      <view class="benefits-list">
        <view v-for="benefit in currentLevel?.benefits || defaultBenefits" :key="benefit" class="benefit-item">
          <u-icon name="checkmark-circle" size="18" color="#67C23A" />
          <text>{{ benefit }}</text>
        </view>
      </view>
    </view>

    <!-- Level List -->
    <view class="levels-card">
      <text class="card-title">会员等级</text>
      <view class="level-list">
        <view 
          v-for="level in allLevels" 
          :key="level.id" 
          class="level-item"
          :class="{ active: level.id <= userInfo.level, locked: level.id > userInfo.level }"
        >
          <view class="level-icon-wrapper">
            <text class="level-emoji">{{ level.icon || '🌟' }}</text>
          </view>
          <view class="level-info-text">
            <text class="level-name">{{ level.name }}</text>
            <text class="level-requirement">需 {{ level.requiredValue }} 成长值</text>
          </view>
          <view class="level-status">
            <u-icon v-if="level.id < userInfo.level" name="check-circle" size="20" color="#67C23A" />
            <text v-else-if="level.id === userInfo.level" class="current-tag">当前</text>
            <u-icon v-else name="lock" size="20" color="#999" />
          </view>
        </view>
      </view>
    </view>

    <!-- Growth Tips -->
    <view class="tips-card">
      <text class="card-title">成长攻略</text>
      <view class="tip-item">
        <text class="tip-icon">📅</text>
        <view class="tip-content">
          <text class="tip-title">完善个人资料</text>
          <text class="tip-desc">完善信息 +50 成长值</text>
        </view>
      </view>
      <view class="tip-item">
        <text class="tip-icon">🛒</text>
        <view class="tip-content">
          <text class="tip-title">消费得积分</text>
          <text class="tip-desc">每消费1元 +1 成长值</text>
        </view>
      </view>
      <view class="tip-item">
        <text class="tip-icon">⭐</text>
        <view class="tip-content">
          <text class="tip-title">完成护理计划</text>
          <text class="tip-desc">完成计划 +100 成长值</text>
        </view>
      </view>
      <view class="tip-item">
        <text class="tip-icon">🎁</text>
        <view class="tip-content">
          <text class="tip-title">邀请好友</text>
          <text class="tip-desc">每邀请1人 +200 成长值</text>
        </view>
      </view>
    </view>

    <!-- Growth History -->
    <view class="history-card">
      <text class="card-title">成长记录</text>
      <view class="history-list">
        <view v-for="record in growthHistory" :key="record.id" class="history-item">
          <view class="history-icon">
            <text>{{ record.icon }}</text>
          </view>
          <view class="history-info">
            <text class="history-title">{{ record.action }}</text>
            <text class="history-time">{{ record.time }}</text>
          </view>
          <text class="history-value" :class="record.type">+{{ record.value }}</text>
        </view>
        <view v-if="!growthHistory.length" class="empty-tip">暂无记录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import api from '@/utils/api'

const store = useStore()
const userInfo = computed(() => store.userInfo || {})

const allLevels = ref([
  { id: 1, name: '普通会员', icon: '🌟', requiredValue: 0, benefits: ['基础折扣 5%', '生日礼遇'] },
  { id: 2, name: '银卡会员', icon: '🌙', requiredValue: 1000, benefits: ['基础折扣 8%', '生日礼遇', '优先预约'] },
  { id: 3, name: '金卡会员', icon: '☀️', requiredValue: 5000, benefits: ['基础折扣 12%', '专属顾问', '免费护理'] },
  { id: 4, name: '黑金会员', icon: '💎', requiredValue: 20000, benefits: ['基础折扣 18%', 'VIP护理室', '专属定制'] },
  { id: 5, name: '钻石会员', icon: '👑', requiredValue: 50000, benefits: ['专属服务', '全年免费护理', '私人定制方案'] }
])

const defaultBenefits = ['基础折扣 5%', '生日礼遇']

const currentLevel = computed(() => allLevels.value.find(l => l.id === userInfo.value.level) || allLevels.value[0])
const nextLevel = computed(() => allLevels.value.find(l => l.id === userInfo.value.level + 1))

const growthValue = computed(() => userInfo.value.growthValue || 800)
const levelProgress = computed(() => {
  const current = currentLevel.value?.requiredValue || 0
  const next = nextLevel.value?.requiredValue || currentLevel.value?.requiredValue + 1000
  const progress = ((growthValue.value - current) / (next - current)) * 100
  return Math.min(Math.max(progress, 0), 100)
})

const growthHistory = ref([
  { id: 1, icon: '🛒', action: '消费订单', time: '2026-03-25 14:30', value: 298, type: 'plus' },
  { id: 2, icon: '📝', action: '完善资料', time: '2026-03-20 10:00', value: 50, type: 'plus' },
  { id: 3, icon: '⭐', action: '完成护理计划', time: '2026-03-15 16:00', value: 100, type: 'plus' },
  { id: 4, icon: '🎁', action: '邀请好友', time: '2026-03-10 09:00', value: 200, type: 'plus' }
])

onMounted(() => {
  // Load real data
})
</script>

<style scoped>
.membership-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.level-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.level-icon {
  font-size: 40rpx;
}

.level-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 20rpx;
}

.level-progress {
  margin-top: 10rpx;
}

.progress-bar {
  height: 16rpx;
  background: rgba(255,255,255,0.3);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: #ffd700;
  border-radius: 8rpx;
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.benefits-card, .levels-card, .tips-card, .history-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
  font-size: 28rpx;
  color: #666;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.level-item.active {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
}

.level-item.locked {
  opacity: 0.6;
}

.level-icon-wrapper {
  width: 60rpx;
  height: 60rpx;
  background: #fff;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-emoji {
  font-size: 36rpx;
}

.level-info-text {
  flex: 1;
}

.level-info-text .level-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.level-requirement {
  font-size: 24rpx;
  color: #999;
}

.current-tag {
  font-size: 22rpx;
  background: #667eea;
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.tip-item:last-child {
  border-bottom: none;
}

.tip-icon {
  font-size: 36rpx;
}

.tip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.tip-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.tip-desc {
  font-size: 24rpx;
  color: #999;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-icon {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.history-title {
  font-size: 28rpx;
  color: #333;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}

.history-value {
  font-size: 32rpx;
  font-weight: bold;
}

.history-value.plus {
  color: #67C23A;
}

.history-value.minus {
  color: #ff4d4f;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
}
</style>