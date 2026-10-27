<template>
  <view class="message-page">
    <!-- 顶部操作栏 -->
    <view class="toolbar">
      <text class="toolbar-title">消息中心</text>
      <text v-if="unreadCount > 0" class="toolbar-action" @click="markAllRead">
        全部已读（{{ unreadCount }}）
      </text>
      <text v-else class="toolbar-tip">全部已读</text>
    </view>

    <!-- 消息列表 -->
    <view v-if="loading" class="empty">
      <u-loading mode="circle" color="#409EFF" />
    </view>

    <view v-else-if="!messages.length" class="empty">
      <u-icon name="chat" size="80" color="#ccc" />
      <text class="empty-text">暂无消息</text>
    </view>

    <view v-else class="message-list">
      <view
        v-for="item in messages"
        :key="item.id"
        class="message-item"
        :class="{ unread: !item.isRead }"
        @click="openMessage(item)"
      >
        <view class="icon-wrap" :class="typeClass(item.type)">
          <u-icon :name="iconOf(item.type)" size="22" color="#fff" />
        </view>

        <view class="message-body">
          <view class="message-head">
            <text class="message-title">{{ item.title }}</text>
            <text v-if="!item.isRead" class="dot" />
          </view>
          <text v-if="item.summary" class="message-summary">{{ item.summary }}</text>
          <text class="message-time">{{ formatTime(item.createdAt) }}</text>
        </view>

        <u-icon name="arrow-right" size="16" color="#ccc" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const messages = ref<any[]>([])
const unreadCount = ref(0)
const loading = ref(false)

const loadMessages = async () => {
  const customerId = uni.getStorageSync('customerId')
  if (!customerId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res: any = await api.getNotifications(customerId)
    const data = res?.data || res
    messages.value = Array.isArray(data) ? data : []
    const c: any = await api.getUnreadCount(customerId)
    unreadCount.value = c?.count ?? c?.data?.count ?? 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openMessage = async (item: any) => {
  if (!item.isRead) {
    try {
      await api.readNotification(item.id, uni.getStorageSync('customerId'))
      item.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      console.error(e)
    }
  }
  if (item.link) {
    uni.navigateTo({ url: item.link })
  }
}

const markAllRead = async () => {
  try {
    await api.readAllNotifications(uni.getStorageSync('customerId'))
    messages.value = messages.value.map((m: any) => ({ ...m, isRead: 1 }))
    unreadCount.value = 0
    uni.showToast({ title: '已全部标记为已读', icon: 'success' })
  } catch (e) {
    console.error(e)
  }
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const iconOf = (type?: string) => {
  const map: Record<string, string> = {
    skin_comparison: 'photo',
    care_plan: 'calendar',
    appointment: 'calendar-fill',
    promotion: 'star',
  }
  return map[type || ''] || 'notification'
}

const typeClass = (type?: string) => {
  const map: Record<string, string> = {
    skin_comparison: 'icon-blue',
    care_plan: 'icon-green',
    appointment: 'icon-orange',
    promotion: 'icon-red',
  }
  return map[type || ''] || 'icon-grey'
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.toolbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.toolbar-action {
  font-size: 26rpx;
  color: #409EFF;
}

.toolbar-tip {
  font-size: 26rpx;
  color: #ccc;
}

.message-list {
  padding: 20rpx;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.message-item.unread {
  background: #f7fbff;
}

.icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.icon-blue { background: #409EFF; }
.icon-green { background: #67C23A; }
.icon-orange { background: #E6A23C; }
.icon-red { background: #F56C6C; }
.icon-grey { background: #909399; }

.message-body {
  flex: 1;
  overflow: hidden;
}

.message-head {
  display: flex;
  align-items: center;
}

.message-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #F56C6C;
  margin-left: 12rpx;
}

.message-summary {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
  line-height: 1.5;
}

.message-time {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 24rpx;
}
</style>
