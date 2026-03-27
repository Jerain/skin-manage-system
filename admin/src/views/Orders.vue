<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px">
        <el-option label="待支付" value="pending" />
        <el-option label="进行中" value="processing" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
    </div>

    <el-table :data="filteredList" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="customer.name" label="客户" />
      <el-table-column prop="store.name" label="门店" />
      <el-table-column prop="service.name" label="服务项目" />
      <el-table-column prop="amount" label="金额">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="payType" label="支付方式">
        <template #default="{ row }">
          {{ getPayTypeText(row.payType) }}
        </template>
      </el-table-column>
      <el-table-column prop="payStatus" label="支付状态">
        <template #default="{ row }">
          <el-tag :type="row.payStatus === 'paid' ? 'success' : 'warning'">
            {{ row.payStatus === 'paid' ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ordersApi } from '@/api'

const loading = ref(false)
const list = ref([])
const statusFilter = ref('')

const filteredList = computed(() => {
  if (!statusFilter.value) return list.value
  return list.value.filter((item: any) => item.status === statusFilter.value)
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    processing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getPayTypeText = (payType: string) => {
  const map: Record<string, string> = {
    balance: '余额',
    card: '卡项',
    wechat: '微信',
    alipay: '支付宝'
  }
  return map[payType] || '-'
}

const loadData = async () => {
  loading.value = true
  try {
    list.value = await ordersApi.list()
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}
</style>
