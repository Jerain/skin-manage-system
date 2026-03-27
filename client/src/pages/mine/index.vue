<template>
  <view class="mine-page">
    <!-- User Info -->
    <view class="user-header" v-if="isLoggedIn">
      <view class="user-avatar">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" />
        <u-icon v-else name="account" size="60" color="#409EFF" />
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.name }}</text>
        <text class="user-phone">{{ userInfo.phone }}</text>
        <view class="user-tags">
          <u-tag type="warning" :text="'LV' + userInfo.level" size="mini" />
        </view>
      </view>
    </view>
    
    <!-- Login Prompt -->
    <view class="login-prompt" v-else>
      <u-icon name="account" size="80" color="#999" />
      <text class="prompt-text">请先登录</text>
      <u-button type="primary" @click="goToLogin">立即登录</u-button>
    </view>
    
    <!-- Stats Cards -->
    <view class="stats-section" v-if="isLoggedIn">
      <view class="stat-card" @click="goToOrders">
        <text class="stat-value">¥{{ userInfo.balance }}</text>
        <text class="stat-label">账户余额</text>
      </view>
      <view class="stat-card" @click="goToOrders">
        <text class="stat-value">{{ userInfo.points }}</text>
        <text class="stat-label">我的积分</text>
      </view>
    </view>
    
    <!-- Menu List -->
    <view class="menu-section">
      <view class="menu-item" @click="goToOrders">
        <view class="menu-left">
          <u-icon name="list" size="22" />
          <text class="menu-text">我的订单</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="goToAppointments">
        <view class="menu-left">
          <u-icon name="calendar" size="22" />
          <text class="menu-text">我的预约</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="showRechargeDialog">
        <view class="menu-left">
          <u-icon name="wallet" size="22" />
          <text class="menu-text">账户充值</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="showMemberCards">
        <view class="menu-left">
          <u-icon name="gift" size="22" />
          <text class="menu-text">我的卡项</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="editProfile">
        <view class="menu-left">
          <u-icon name="edit-pen" size="22" />
          <text class="menu-text">个人资料</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item" @click="showSettings">
        <view class="menu-left">
          <u-icon name="setting" size="22" />
          <text class="menu-text">设置</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
      
      <view class="menu-item logout" @click="handleLogout" v-if="isLoggedIn">
        <view class="menu-left">
          <u-icon name="close-circle" size="22" />
          <text class="menu-text">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'

const store = useStore()
const isLoggedIn = computed(() => store.isLoggedIn)
const userInfo = computed(() => store.userInfo || {})

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const goToOrders = () => {
  uni.switchTab({ url: '/pages/orders/index' })
}

const goToAppointments = () => {
  uni.switchTab({ url: '/pages/appointment/index' })
}

const showRechargeDialog = () => {
  uni.showToast({ title: '充值功能开发中', icon: 'none' })
}

const showMemberCards = () => {
  uni.showToast({ title: '卡项功能开发中', icon: 'none' })
}

const editProfile = () => {
  uni.showToast({ title: '个人资料编辑开发中', icon: 'none' })
}

const showSettings = () => {
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        store.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/login/index' })
        }, 500)
      }
    }
  })
}

onMounted(() => {
  const cachedUserInfo = uni.getStorageSync('userInfo')
  if (cachedUserInfo) {
    store.setUserInfo(cachedUserInfo)
  }
})
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.user-phone {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.user-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 5rpx;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 40rpx;
  gap: 30rpx;
}

.prompt-text {
  font-size: 28rpx;
  color: #999;
}

.stats-section {
  display: flex;
  padding: 20rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 10rpx;
  padding: 40rpx 30rpx;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.menu-section {
  margin-top: 20rpx;
  background: #fff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.menu-item.logout {
  margin-top: 20rpx;
}

.menu-item.logout .menu-text {
  color: #ff4d4f;
}
</style>
