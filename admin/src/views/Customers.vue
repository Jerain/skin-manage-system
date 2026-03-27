<template>
  <div class="page-container">
    <div class="page-header">
      <h2>客户管理</h2>
    </div>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="avatar" label="头像" width="80">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :src="row.avatar" :size="40" />
          <el-avatar v-else :size="40">{{ row.name?.charAt(0) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="skinType" label="肤质" />
      <el-table-column prop="level" label="会员等级">
        <template #default="{ row }">
          <el-tag type="warning">LV{{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="余额">
        <template #default="{ row }">
          ¥{{ row.balance }}
        </template>
      </el-table-column>
      <el-table-column prop="points" label="积分" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="编辑客户" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="肤质">
          <el-input v-model="form.skinType" />
        </el-form-item>
        <el-form-item label="过敏史">
          <el-input v-model="form.allergyInfo" type="textarea" />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-input-number v-model="form.level" :min="1" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { customersApi } from '@/api'

const loading = ref(false)
const list = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editId = ref(0)

const form = ref({
  name: '',
  phone: '',
  skinType: '',
  allergyInfo: '',
  level: 1
})

const loadData = async () => {
  loading.value = true
  try {
    list.value = await customersApi.list()
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: any) => {
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await customersApi.update(editId.value, form.value)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
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
