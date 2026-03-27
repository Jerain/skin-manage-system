<template>
  <div class="page-container">
    <div class="page-header">
      <h2>员工管理</h2>
      <el-button type="primary" @click="handleAdd">新增员工</el-button>
    </div>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="store.name" label="所属门店" />
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag>{{ getRoleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="position" label="职位" />
      <el-table-column prop="rating" label="评分" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="所属门店">
          <el-select v-model="form.storeId" placeholder="请选择门店">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEdit">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="店长" value="manager" />
            <el-option label="技师" value="technician" />
            <el-option label="前台" value="receptionist" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="form.position" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { employeesApi, storesApi } from '@/api'

const loading = ref(false)
const list = ref([])
const stores = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = ref({
  storeId: null as number | null,
  name: '',
  phone: '',
  password: '',
  role: 'technician',
  position: ''
})

const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    manager: '店长',
    technician: '技师',
    receptionist: '前台'
  }
  return map[role] || role
}

const loadData = async () => {
  loading.value = true
  try {
    const [employees, storeList] = await Promise.all([
      employeesApi.list(),
      storesApi.list()
    ])
    list.value = employees
    stores.value = storeList
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { storeId: null, name: '', phone: '', password: '', role: 'technician', position: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row, password: '' }
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该员工吗?', '提示', { type: 'warning' })
  try {
    await employeesApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.phone || !form.value.storeId) {
    return ElMessage.warning('请填写完整信息')
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await employeesApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await employeesApi.create(form.value)
      ElMessage.success('创建成功')
    }
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
