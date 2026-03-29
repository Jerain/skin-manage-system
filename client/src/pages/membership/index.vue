<template>
  <view class="membership-page">
    <!-- Member Card -->
    <view class="member-card">
      <view class="card-bg">
        <view class="member-info">
          <u-avatar :src="customerInfo?.avatar" size="100" />
          <view class="info-text">
            <text class="member-name">{{ customerInfo?.name || '会员' }}</text>
            <text class="member-level">{{ getLevelName(customerInfo?.level) }}</text>
          </view>
        </view>
        <view class="card-stats">
          <view class="stat-item">
            <text class="stat-value">{{ formatMoney(customerInfo?.balance) }}</text>
            <text class="stat-label">余额</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ customerInfo?.points || 0 }}</text>
            <text class="stat-label">积分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ growthValue || 0 }}</text>
            <text class="stat-label">成长值</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Level Progress -->
    <view class="level-progress">
      <view class="progress-header">
        <text class="title">等级成长</text>
        <text class="subtitle">再积累 {{ nextLevelPoints - (growthValue % 1000) }} 成长值可升至 {{ getLevelName(nextLevel) }}</text>
      </view>
      <view class="level-track">
        <view 
          v-for="level in levels" 
          :key="level.value" 
          class="level-dot"
          :class="{ active: currentLevel >= level.value, current: currentLevel === level.value }"
        >
          <view class="dot"></view>
          <text class="level-name">{{ level.name }}</text>
        </view>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>

    <!-- Benefits -->
    <view class="benefits-section">
      <text class="section-title">会员权益</text>
      <view class="benefits-list">
        <view v-for="benefit in currentBenefits" :key="benefit.id" class="benefit-item">
          <u-icon :name="benefit.icon || 'checkmark-circle'" size="40" :color="benefit.color || '#67C23A'" />
          <view class="benefit-info">
            <text class="benefit-name">{{ benefit.name }}</text>
            <text class="benefit-desc">{{ benefit.description }}</text>
          </view>
        </view>
        <view v-if="!currentBenefits.length" class="empty-benefits">
          <text>暂无专属权益</text>
        </view>
      </view>
    </view>

    <!-- Growth History -->
    <view class="history-section">
      <text class="section-title">成长记录</text>
      <view class="history-list">
        <view v-for="record in growthHistory" :key="record.id" class="history-item">
          <view class="history-left">
            <text class="history-type">{{ record.type }}</text>
            <text class="history-date">{{ record.date }}</text>
          </view>
          <text class="history-value" :class="record.action">+{{ record.value }}</text>
        </view>
        <view v-if="!growthHistory.length" class="empty-history">
          <text>暂无记录</text>
        </view>
      </view>
    </view>

    <!-- Upgrade Tips -->
    <view class="upgrade-tips" v-if="currentLevel < 5">
      <text class="tips-title">升级攻略</text>
      <view class="tips-list">
        <view class="tip-item">
          <u-icon name="shopping-cart" size="32" color="#409EFF" />
          <text>每消费1元可获得1成长值</text>
        </view>
        <view class="tip-item">
          <u-icon name="checkmark-circle" size="32" color="#67C23A" />
          <text>完成护理计划可获得额外成长值</text>
        </view>
        <view class="tip-item">
          <u-icon name="star" size="32" color="#E6A23C" />
          <text>评价服务可获得积分奖励</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import api from '@/utils/api'

const store = useStore()
const customerInfo = computed(() => store.customerInfo)
const growthValue = ref(850)
const growthHistory = ref<any[]>([])

const levels = [
  { value: 1, name: '普通会员' },
  { value: 2, name: '银卡' },
  { value: 3, name: '金卡' },
  { value: 4, name: '白金卡' },
  { value: 5, name: '钻石卡' }
]

const currentLevel = computed(() => customerInfo.value?.level || 1)
const nextLevel = computed(() => Math.min(currentLevel.value + 1, 5))
const nextLevelPoints = computed(() => nextLevel.value * 1000)

const progressPercent = computed(() => {
  return (growthValue.value % 1000) / 10
})

const getLevelName = (level?: number) => {
  const map: Record<number, string> = {
    1: '普通会员', 2: '银卡会员', 3: '金卡会员', 4: '白金卡', 5: '钻石卡'
  }
  return map[level || 1] || '普通会员'
}

const currentBenefits = computed(() => {
  const benefits: Record<number, any[]> = {
    1: [{ id: 1, name: '新人礼遇', description: '首次消费享9折', icon: 'gift', color: '#F56C6C' }],
    2: [
      { id: 1, name: '9.5折优惠', description: '全场服务9.5折', icon: '票', color: '#409EFF' },
      { id: 2, name: '积分加倍', description: '消费积分翻倍', icon: 'star', color: '#E6A23C' }
    ],
    3: [
      { id: 1, name: '9折优惠', description: '全场服务9折', icon: '票', color: '#409EFF' },
      { id: 2, name: '专属护理', description: '每月免费护理一次', icon: 'heart', color: '#F56C6C' },
      { id: 3, name: '优先预约', description: '预约优先权', icon: 'clock', color: '#67C23A' }
    ],
    4: [
      { id: 1, name: '8.8折优惠', description: '全场服务8.8折', icon: '票', color: '#409EFF' },
      { id: 2, name: '免费护理', description: '每月2次免费护理', icon: 'heart', color: '#F56C6C' },
      { id: 3, name: '专属技师', description: '指定高级技师服务', icon: 'user', color: '#909399' },
      { id: 4, name: '生日礼包', description: '生日当月双倍积分', icon: 'gift', color: '#F56C6C' }
    ],
    5: [
      { id: 1, name: '8折优惠', description: '全场服务8折', icon: '票', color: '#409EFF' },
      { id: 2, name: '专属顾问', description: '1对1美丽顾问', icon: 'user', color: '#909399' },
      { id: 3, name: '免费护理', description: '每月4次免费护理', icon: 'heart', color: '#F56C6C' },
      { id: 4, name: 'VIP通道', description: '免排队优先服务', icon: 'arrow-right', color: '#67C23A' },
      { id: 5, name: '私人定制', description: '专属护理方案', icon: 'star', color: '#E6A23C' }
    ]
  }
  return benefits[currentLevel.value] || benefits[1]
})

const formatMoney = (amount?: number) => {
  return (amount || 0).toFixed(2)
}

const loadGrowthData = () => {
  // Mock data
  growthHistory.value = [
    { id: 1, type: '消费奖励', date: '2026-03-25', value: 298, action: 'add' },
    { id: 2, type: '评价奖励', date: '2026-03-20', value: 50, action: 'add' },
    { id: 3, type: '护理计划完成', date: '2026-03-15', value: 200, action: 'add' },
    { id: 4, type: '消费奖励', date: '2026-03-10', value: 198, action: 'add' },
    { id: 5, type: '签到奖励', date: '2026-03-05', value: 10, action: 'add' }
  ]
}

onMounted(() => {
  loadGrowthData()
})
</script>

<style scoped>
.membership-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.member-card {
  margin-bottom: 20rpx;
}

.card-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.member-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.member-level {
  font-size: 28rpx;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  display: inline-block;
}

.card-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
  display: block;
  margin-top: 8rpx;
}

.level-progress {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.progress-header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.level-track {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.level-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #ddd;
  margin-bottom: 10rpx;
}

.level-dot.active .dot {
  background: #667eea;
}

.level-dot.current .dot {
  width: 28rpx;
  height: 28rpx;
  background: #667eea;
  box-shadow: 0 0 10rpx rgba(102, 126, 234, 0.5);
}

.level-name {
  font-size: 20rpx;
  color: #999;
}

.level-dot.active .level-name {
  color: #667eea;
}

.progress-bar {
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx;
}

.benefits-section, .history-section, .upgrade-tips {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.benefit-info {
  flex: 1;
}

.benefit-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.benefit-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 6rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.history-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.history-type {
  font-size: 28rpx;
  color: #333;
}

.history-date {
  font-size: 24rpx;
  color: #999;
}

.history-value {
  font-size: 32rpx;
  font-weight: bold;
}

.history-value.add {
  color: #67C23A;
}

.history-value.sub {
  color: #F56C6C;
}

.empty-benefits, .empty-history {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.upgrade-tips {
  background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
}

.tips-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.tip-item text {
  font-size: 26rpx;
  color: #666;
}
</style>