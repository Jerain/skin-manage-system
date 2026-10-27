<template>
  <view class="message-page">
    <!-- 顶部操作栏 -->
    <view class="toolbar">
      <view
        class="filter-item"
        :class="{ active: !unreadOnly }"
        @click="switchFilter(false)"
      >全部</view>
      <view
        class="filter-item"
        :class="{ active: unreadOnly }"
        @click="switchFilter(true)"
      >未读{{ unreadCount > 0 ? `(${unreadCount})` : ''}}</view>
      <view class="read-all" @click="handleReadAll">全部已读</view>
    </view>

    <!-- 消息列表 -->
    <view v-if="messages.length" class="message-list">
      <view
        v-for="item in messages"
        :key="item.id"
        class="message-card"
        :class="{ unread: !item.isRead }"
        @click="handleOpen(item)"
      >
        <view class="card-head">
          <view class="type-tag" :class="typeClass(item.type)">
            {{ typeText(item.type) }}
          </view>
          <text class="time">{{ formatTime(item.createdAt) }}</text>
          <view v-if="!item.isRead" class="red-dot" />
        </view>

        <text class="card-title">{{ item.title }}</text>
        <text v-if="item.summary" class="card-summary">{{ item.summary }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <u-icon name="chat" size="80" color="#CCC" />
      <text class="empty-text">{{ loading ? '加载中...' : '暂无消息' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import api from '@/utils/api'
import { useStore } from '@/stores'

const store = useStore()

const messages = ref<any[]>([])
const unreadCount = ref(0)
const unreadOnly = ref(false)
const loading = ref(false)

const customerId = () => {
  const info: any = store.customerInfo
  return info?.id
}

const typeText = (type?: string) => {
  const map: Record<string, string> = {
    skin_comparison: '肤质报告',
    care_plan: '护理计划',
    appointment: '预约提醒',
    promotion: '活动通知',
    system: '系统通知'
  }
  return map[type || ''] || '通知'
}

const typeClass = (type?: string) => {
  const map: Record<string, string> = {
    skin_comparison: 'tag-blue',
    care_plan: 'tag-green',
    appointment: 'tag-orange',
    promotion: 'tag-purple',
    system: 'tag-grey'
  }
  return map[type || ''] || 'tag-grey'
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadUnreadCount = async () => {
  const cid = customerId()
  if (!cid) return
  try {
    const res: any = await api.getUnreadCount(cid)
    unreadCount.value = res?.count ?? res?.data?.count ?? 0
  } catch (e) {
    console.error(e)
  }
}

const loadMessages = async () => {
  const cid = customerId()
  if (!cid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res: any = await api.getNotifications(cid, unreadOnly.value, 50)
    const data = res?.data || res
    messages.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const switchFilter = (unread: boolean) => {
  unreadOnly.value = unread
  loadMessages()
}

/** 打开消息：先标记已读，再按 link 跳转 */
const handleOpen = async (item: any) => {
  const cid = customerId()
  if (cid && !item.isRead) {
    try {
      await api.readNotification(item.id, cid)
      item.isRead = 1
      loadUnreadCount()
    } catch (e) {
      console.error(e)
    }
  }
  if (item.link) {
    uni.navigateTo({ url: item.link })
  }
}

const handleReadAll = async () => {
  const cid = customerId()
  if (!cid) return
  if (!unreadCount.value) {
    uni.showToast({ title: '没有未读消息', icon: 'none' })
    return
  }
  try {
    await api.readAllNotifications(cid)
    uni.showToast({ title: '已全部标记为已读', icon: 'success' })
    loadMessages()
    loadUnreadCount()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadMessages()
  loadUnreadCount()
})

onShow(() => {
  loadUnreadCount()
})
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 30rpx;
}

.toolbar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 30rpx;
  height: 88rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  font-size: 28rpx;
  color: #666;
  margin-right: 40rpx;
  position: relative;
  line-height: 88rpx;
}

.filter-item.active {
  color: #409EFF;
  font-weight: 600;
}

.filter-item.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 12rpx;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #409EFF;
  border-radius: 2rpx;
}

.read-all {
  margin-left: auto;
  font-size: 26rpx;
  color: #999;
}

.message-list {
  padding: 20rpx;
}

.message-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 26rpx;
  margin-bottom: 20rpx;
}

.message-card.unread {
  background: #f7fbff;
}

.card-head {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.type-tag {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  color: #fff;
}

.tag-blue { background: #409EFF; }
.tag-green { background: #67C23A; }
.tag-orange { background: #E6A23C; }
.tag-purple { background: #8B5CF6; }
.tag-grey { background: #999; }

.time {
  margin-left: 16rpx;
  font-size: 24rpx;
  color: #bbb;
}

.red-dot {
  margin-left: auto;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #F56C6C;
}

.card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

.card-summary {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #888;
  line-height: 1.6;
}

.empty {
  padding-top: 200rpx;
  text-align: center;
}

.empty-text {
  display: block;
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
