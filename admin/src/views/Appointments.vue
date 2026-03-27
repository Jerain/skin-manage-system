<template>
  <div class="page-container">
    <div class="page-header">
      <h2>预约管理</h2>
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px">
        <el-option label="待确认" value="pending" />
        <el-option label="已确认" value="confirmed" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
    </div>

    <el-table :data="filteredList" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="customer.name" label="客户" />
      <el-table-column prop="store.name" label="门店" />
      <el-table-column prop="service.name" label="服务项目" />
      <el-table-column prop="employee.name" label="技师" />
      <el-table-column prop="appointmentDate" label="日期" />
      <el-table-column prop="appointmentTime" label="时间" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" size="small" type="success" @click="handleConfirm(row)">确认</el-button>
          <el-button v-if="row.status === 'pending'" size="small" type="danger" @click="handleReject(row)">拒绝</el-button>
          <el-button v-if="row.status === 'confirmed'" size="small" type="primary" @click="handleComplete(row)">完成</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { appointmentsApi } from '@/api'

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
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    list.value = await appointmentsApi.list()
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleConfirm = async (row: any) => {
  try {
    await appointmentsApi.confirm(row.id)
    ElMessage.success('已确认')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReject = async (row: any) => {
  const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝预约', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  if (reason) {
    try {
      await appointmentsApi.reject(row.id, reason)
      ElMessage.success('已拒绝')
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }
}

const handleComplete = async (row: any) => {
  try {
    await appointmentsApi.complete(row.id)
    ElMessage.success('已完成')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
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
