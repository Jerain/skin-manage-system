<template>
  <div class="page-container">
    <div class="page-header">
      <h2>奖金规则配置</h2>
      <el-button type="primary" @click="handleAdd">新增规则</el-button>
    </div>

    <!-- Filter -->
    <el-form :inline="true" class="filter-form">
      <el-form-item label="门店">
        <el-select v-model="filterStoreId" placeholder="全部门店" clearable @change="loadData">
          <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="规则类型">
        <el-select v-model="filterType" placeholder="全部类型" clearable @change="loadData">
          <el-option label="基础比例" value="base" />
          <el-option label="阶梯奖励" value="tier" />
          <el-option label="特殊奖励" value="special" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="store.name" label="门店" />
      <el-table-column prop="ruleType" label="规则类型">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.ruleType)">{{ getTypeText(row.ruleType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="规则名称" />
      <el-table-column prop="rate" label="比例/金额" width="150">
        <template #default="{ row }">
          {{ row.rate ? `${row.rate * 100}%` : row.amount ? `¥${row.amount}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="targetAmount" label="目标业绩" width="120">
        <template #default="{ row }">
          {{ row.targetAmount ? `¥${row.targetAmount}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="所属门店" prop="storeId">
          <el-select v-model="form.storeId" placeholder="请选择门店">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="form.ruleType" placeholder="请选择类型" @change="handleTypeChange">
            <el-option label="基础比例" value="base" />
            <el-option label="阶梯奖励" value="tier" />
            <el-option label="��殊奖励" value="special" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规则名称" />
        </el-form-item>
        
        <!-- Base Type Settings -->
        <el-form-item v-if="form.ruleType === 'base'" label="提成比例" prop="rate">
          <el-input-number v-model="form.rate" :min="0" :max="1" :step="0.01" :precision="2" />
          <span class="form-tip">（如 0.1 表示 10%）</span>
        </el-form-item>
        
        <!-- Tier Type Settings -->
        <template v-if="form.ruleType === 'tier'">
          <el-form-item label="目标业绩" prop="targetAmount">
            <el-input-number v-model="form.targetAmount" :min="0" :step="1000" />
            <span class="form-tip">（达到此业绩后触发）</span>
          </el-form-item>
          <el-form-item label="奖励金额" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :step="100" />
            <span class="form-tip">（达标后额外奖励）</span>
          </el-form-item>
        </template>
        
        <!-- Special Type Settings -->
        <template v-if="form.ruleType === 'special'">
          <el-form-item label="奖励金额" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :step="100" />
          </el-form-item>
          <el-form-item label="触发条件" prop="condition">
            <el-input v-model="form.condition" type="textarea" placeholder="如：新客户首单" />
          </el-form-item>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { bonusRulesApi, storesApi } from '@/api'

const loading = ref(false)
const list = ref([])
const stores = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref(0)

// Filters
const filterStoreId = ref<number | null>(null)
const filterType = ref('')

const form = ref({
  storeId: null as number | null,
  ruleType: 'base',
  name: '',
  rate: 0.1,
  targetAmount: 0,
  amount: 0,
  condition: '',
  description: '',
  status: 1
})

const rules = {
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  rate: [{ required: true, message: '请设置提成比例', trigger: 'blur' }]
}

const formRef = ref()

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    base: '基础比例',
    tier: '阶梯奖励',
    special: '特殊奖励'
  }
  return map[type] || type
}

const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    base: 'primary',
    tier: 'warning',
    special: 'success'
  }
  return map[type] || ''
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filterStoreId.value) params.storeId = filterStoreId.value
    if (filterType.value) params.type = filterType.value
    
    const [rulesData, storeList] = await Promise.all([
      bonusRulesApi.list(filterStoreId.value || undefined),
      storesApi.list()
    ])
    list.value = rulesData
    stores.value = storeList
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    storeId: null,
    ruleType: 'base',
    name: '',
    rate: 0.1,
    targetAmount: 0,
    amount: 0,
    condition: '',
    description: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该规则吗?', '提示', { type: 'warning' })
  try {
    await bonusRulesApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleStatusChange = async (row: any) => {
  try {
    await bonusRulesApi.update(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
    loadData()
  }
}

const handleTypeChange = () => {
  // Reset form fields based on type
  if (form.value.ruleType === 'base') {
    form.value.rate = 0.1
  } else {
    form.value.rate = 0
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const submitData = { ...form.value }
      // Convert rate to percentage for base type
      if (submitData.ruleType === 'base') {
        submitData.rate = submitData.rate
      }
      
      if (isEdit.value) {
        await bonusRulesApi.update(editId.value, submitData)
        ElMessage.success('更新成功')
      } else {
        await bonusRulesApi.create(submitData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
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

.filter-form {
  margin-bottom: 20px;
}

.form-tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>