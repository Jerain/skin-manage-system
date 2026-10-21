<template>
  <view class="skin-record-page">
    <!-- 客户选择 -->
    <view class="form-section">
      <view class="section-title">选择客户</view>
      <view class="customer-picker" @click="showCustomerPicker = true">
        <text class="picker-value" :class="{ placeholder: !selectedCustomer }">
          {{ selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : '请选择客户' }}
        </text>
        <text class="picker-arrow">›</text>
      </view>
    </view>

    <!-- 照片上传 -->
    <view class="form-section">
      <view class="section-title">护理前后照片</view>
      <view class="photo-section">
        <view class="photo-item">
          <view class="photo-label">护理前</view>
          <view class="photo-box" @click="choosePhoto('before')">
            <image v-if="beforeImage" :src="resolveImageUrl(beforeImage)" class="photo-preview" mode="aspectFill" />
            <view v-else class="photo-placeholder">
              <text class="placeholder-icon">📷</text>
              <text class="placeholder-text">拍照/相册</text>
            </view>
          </view>
          <text v-if="beforeImage" class="photo-again" @click.stop="choosePhoto('before')">重新选择</text>
        </view>

        <view class="photo-item">
          <view class="photo-label">护理后</view>
          <view class="photo-box" @click="choosePhoto('after')">
            <image v-if="afterImage" :src="resolveImageUrl(afterImage)" class="photo-preview" mode="aspectFill" />
            <view v-else class="photo-placeholder">
              <text class="placeholder-icon">📷</text>
              <text class="placeholder-text">拍照/相册</text>
            </view>
          </view>
          <text v-if="afterImage" class="photo-again" @click.stop="choosePhoto('after')">重新选择</text>
        </view>
      </view>

      <!-- AI 分析按钮 -->
      <view class="ai-analyze-row">
        <u-button
          type="primary"
          plain
          size="small"
          :loading="analyzing"
          :disabled="!afterImage"
          @click="handleAiAnalyze"
        >{{ analyzing ? 'AI分析中...' : '✨ AI分析肤质' }}</u-button>
        <text class="ai-hint">AI 自动识别肤质类型与皮肤问题</text>
      </view>

      <!-- AI 分析结果 -->
      <view v-if="aiResult" class="ai-result">
        <view class="ai-result-row">
          <text class="ai-result-label">肤质类型</text>
          <text class="ai-result-value">{{ aiResult.skinType || '未识别' }}</text>
        </view>
        <view class="ai-result-row">
          <text class="ai-result-label">皮肤问题</text>
          <text class="ai-result-value">{{ aiResult.skinIssues?.length ? aiResult.skinIssues.join('、') : '无明显问题' }}</text>
        </view>
        <view v-if="aiResult.summary" class="ai-result-row">
          <text class="ai-result-label">分析摘要</text>
          <text class="ai-result-value">{{ aiResult.summary }}</text>
        </view>
      </view>
    </view>

    <!-- 肤质信息 -->
    <view class="form-section">
      <view class="section-title">肤质信息</view>

      <view class="form-row">
        <text class="form-label">肤质类型</text>
        <view class="tag-group">
          <view
            v-for="type in skinTypeOptions"
            :key="type"
            class="tag"
            :class="{ active: form.skinType === type }"
            @click="form.skinType = type"
          >{{ type }}</view>
        </view>
      </view>

      <view class="form-row">
        <text class="form-label">皮肤问题</text>
        <view class="tag-group">
          <view
            v-for="issue in issueOptions"
            :key="issue"
            class="tag"
            :class="{ active: form.skinIssues.includes(issue) }"
            @click="toggleIssue(issue)"
          >{{ issue }}</view>
        </view>
      </view>

      <view class="form-row">
        <text class="form-label">备注</text>
        <textarea
          v-model="form.notes"
          class="form-textarea"
          placeholder="记录本次护理重点（选填）"
          :maxlength="200"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <u-button
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >{{ submitting ? '提交中...' : '提交肤质记录' }}</u-button>
      <u-button
        v-if="beforeImage && afterImage"
        type="primary"
        plain
        :loading="generating"
        :disabled="!canSubmit"
        @click="handleGenerateComparison"
      >{{ generating ? 'AI生成中...' : 'AI生成对比图' }}</u-button>
    </view>

    <!-- 客户选择弹窗 -->
    <u-popup :show="showCustomerPicker" mode="bottom" round :safe-area-inset-bottom="false">
      <view class="picker-popup">
        <view class="popup-title">选择客户</view>
        <scroll-view scroll-y class="customer-scroll">
          <view
            v-for="c in customers"
            :key="c.id"
            class="customer-option"
            @click="selectCustomer(c)"
          >
            <text class="option-name">{{ c.name }}</text>
            <text class="option-phone">{{ c.phone }}</text>
            <text v-if="c.skinType" class="option-skin">{{ c.skinType }}</text>
          </view>
          <view v-if="customers.length === 0" class="empty-tip">暂无可选客户</view>
        </scroll-view>
        <u-button @click="showCustomerPicker = false">关闭</u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api, { resolveImageUrl } from '@/utils/api'
import { useStore } from '@/stores'

const store = useStore()

const skinTypeOptions = ['干性', '油性', '混合性', '敏感性']
const issueOptions = ['痘痘', '色斑', '毛孔粗大', '细纹', '泛红', '暗沉']

const customers = ref<any[]>([])
const selectedCustomer = ref<any>(null)
const showCustomerPicker = ref(false)

const beforeImage = ref('')
const afterImage = ref('')

const form = reactive({
  skinType: '',
  skinIssues: [] as string[],
  notes: ''
})

const submitting = ref(false)
const generating = ref(false)
const analyzing = ref(false)
const aiResult = ref<any>(null)

const canSubmit = computed(() => !!selectedCustomer.value)

/** AI 分析护理后照片，自动填充肤质信息 */
const handleAiAnalyze = async () => {
  if (!afterImage.value) {
    uni.showToast({ title: '请先上传护理后照片', icon: 'none' })
    return
  }
  analyzing.value = true
  uni.showLoading({ title: 'AI分析中...' })
  try {
    const res: any = await api.analyzeSkinPhoto(afterImage.value)
    const data = res?.data || res
    aiResult.value = data
    if (data?.available) {
      if (data.skinType) form.skinType = data.skinType
      if (Array.isArray(data.skinIssues) && data.skinIssues.length) {
        form.skinIssues = data.skinIssues
      }
      uni.showToast({ title: 'AI分析完成', icon: 'success' })
    } else {
      uni.showToast({ title: data?.summary || 'AI分析失败，请手动填写', icon: 'none' })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({ title: 'AI分析失败，请手动填写', icon: 'none' })
  } finally {
    uni.hideLoading()
    analyzing.value = false
  }
}

const toggleIssue = (issue: string) => {
  const idx = form.skinIssues.indexOf(issue)
  if (idx > -1) {
    form.skinIssues.splice(idx, 1)
  } else {
    form.skinIssues.push(issue)
  }
}

/** 选择照片：选完立即上传到服务器，拿到可访问的 URL */
const choosePhoto = async (slot: 'before' | 'after') => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res: any) => {
      const path = res.tempFilePaths?.[0]
      if (!path) return
      uni.showLoading({ title: '上传中...' })
      try {
        const uploaded = await api.uploadSkinPhoto(path)
        const url = uploaded?.url || path
        if (slot === 'before') {
          beforeImage.value = url
        } else {
          afterImage.value = url
        }
      } catch (e) {
        console.error(e)
      } finally {
        uni.hideLoading()
      }
    },
    fail: () => {
      // 用户取消
    }
  })
}

/** 提交肤质记录 */
const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: '请先选择客户', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const customerId = selectedCustomer.value.id
    const common = {
      customerId,
      skinType: form.skinType,
      skinIssues: form.skinIssues.join('、'),
      technicianId: store.employeeInfo?.id
    }

    // 有护理前照片则先存护理前记录
    if (beforeImage.value) {
      await api.createSkinRecord({
        ...common,
        photoUrl: beforeImage.value,
        notes: form.notes ? `${form.notes}（护理前）` : '护理前'
      })
    }

    // 护理后记录
    const after = await api.createSkinRecord({
      ...common,
      photoUrl: afterImage.value,
      notes: form.notes ? `${form.notes}（护理后）` : '护理后'
    })

    // 两张照片都有则立即生成对比图
    if (beforeImage.value && afterImage.value && after?.id) {
      uni.showLoading({ title: 'AI分析中...' })
      const records = await api.getSkinRecords(customerId)
      const list = Array.isArray(records) ? records : (records?.data || [])
      const beforeRec = list.find((r: any) => r.photoUrl === beforeImage.value)
      if (beforeRec) {
        await api.generateSkinComparison({
          customerId,
          beforeRecordId: beforeRec.id,
          afterRecordId: after.id,
          push: true
        })
      }
      uni.hideLoading()
    }

    uni.showToast({ title: '提交成功', icon: 'success' })
    resetForm()
  } catch (e: any) {
    console.error(e)
    uni.hideLoading()
  } finally {
    submitting.value = false
  }
}

/** AI 生成对比图（需要前后两条记录） */
const handleGenerateComparison = async () => {
  if (!canSubmit.value) return
  generating.value = true
  try {
    const records = await api.getSkinRecords(selectedCustomer.value.id)
    const list = Array.isArray(records) ? records : (records?.data || [])
    if (list.length < 2) {
      uni.showToast({ title: '至少需要两条记录才能生成对比图', icon: 'none' })
      return
    }
    const result = await api.generateSkinComparison({
      customerId: selectedCustomer.value.id,
      beforeRecordId: list[1].id,
      afterRecordId: list[0].id,
      push: true
    })
    if (result?.code === 0) {
      uni.showToast({ title: '对比图已生成并推送', icon: 'success' })
    }
  } catch (e: any) {
    console.error(e)
    uni.showToast({ title: '生成失败', icon: 'none' })
  } finally {
    generating.value = false
  }
}

const resetForm = () => {
  beforeImage.value = ''
  afterImage.value = ''
  form.skinType = ''
  form.skinIssues = []
  form.notes = ''
}

const selectCustomer = (c: any) => {
  selectedCustomer.value = c
  showCustomerPicker.value = false
}

onMounted(async () => {
  try {
    customers.value = await api.getCustomers()
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.skin-record-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60rpx;
}

.form-section {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 25rpx;
}

.customer-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  background: #f7f8fa;
  border-radius: 10rpx;
}

.picker-value {
  font-size: 28rpx;
  color: #333;
}

.picker-value.placeholder {
  color: #999;
}

.picker-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.photo-section {
  display: flex;
  gap: 20rpx;
}

.photo-item {
  flex: 1;
}

.photo-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
  text-align: center;
}

.photo-box {
  width: 100%;
  height: 260rpx;
  background: #f7f8fa;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-preview {
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.placeholder-text {
  font-size: 24rpx;
  color: #999;
}

.photo-again {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #409eff;
  margin-top: 12rpx;
}

.form-row {
  margin-bottom: 30rpx;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 18rpx;
  font-weight: 500;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 28rpx;
  background: #f7f8fa;
  border: 2rpx solid #eee;
  border-radius: 100rpx;
  font-size: 26rpx;
  color: #666;
}

.tag.active {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.form-textarea {
  width: 100%;
  height: 150rpx;
  background: #f7f8fa;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.ai-analyze-row {
  display: flex;
  align-items: center;
  margin-top: 25rpx;
}

.ai-hint {
  font-size: 22rpx;
  color: #999;
  margin-left: 18rpx;
}

.ai-result {
  margin-top: 20rpx;
  padding: 22rpx;
  background: #f4f8ff;
  border-radius: 10rpx;
}

.ai-result-row {
  display: flex;
  margin-bottom: 12rpx;
}

.ai-result-row:last-child {
  margin-bottom: 0;
}

.ai-result-label {
  font-size: 25rpx;
  color: #666;
  width: 130rpx;
  flex-shrink: 0;
}

.ai-result-value {
  font-size: 25rpx;
  color: #333;
  flex: 1;
}

.submit-section {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.picker-popup {
  padding: 30rpx;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
}

.customer-scroll {
  flex: 1;
  margin-bottom: 20rpx;
}

.customer-option {
  display: flex;
  align-items: center;
  padding: 25rpx 10rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.option-name {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.option-phone {
  font-size: 26rpx;
  color: #999;
  flex: 1;
}

.option-skin {
  font-size: 24rpx;
  color: #409eff;
  background: #ecf5ff;
  padding: 6rpx 16rpx;
  border-radius: 100rpx;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 60rpx 0;
}
</style>
