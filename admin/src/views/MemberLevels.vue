<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会员等级配置</h2>
      <el-button type="primary" @click="handleAdd">新增等级</el-button>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="成长值门槛决定客户升级到该等级所需的累计成长值；折扣为 0-1 之间的小数，0.9 表示 9 折。"
      style="margin-bottom: 16px"
    />

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="levelName" label="等级名称" width="140" />
      <el-table-column prop="levelCode" label="等级编码" width="120" />
      <el-table-column prop="threshold" label="成长值门槛" width="120" />
      <el-table-column prop="discount" label="折扣" width="100">
        <template #default="{ row }">
          <el-tag :type="discountTag(row.discount)">
            {{ row.discount ? `${(row.discount * 10).toFixed(1)}折` : '无折扣' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pointsRate" label="积分倍率" width="100" />
      <el-table-column label="优先预约" width="100">
        <template #default="{ row }">
          <el-tag :type="row.priorityBooking ? 'success' : 'info'">
            {{ row.priorityBooking ? '支持' : '不支持' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="专属技师" width="100">
        <template #default="{ row }">
          <el-tag :type="row.exclusiveTechnician ? 'success' : 'info'">
            {{ row.exclusiveTechnician ? '支持' : '不支持' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员等级' : '新增会员等级'" width="560px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="130px">
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="form.levelName" placeholder="如：银卡会员" />
        </el-form-item>
        <el-form-item label="等级编码" prop="levelCode">
          <el-input v-model="form.levelCode" placeholder="如：silver" />
        </el-form-item>
        <el-form-item label="成长值门槛" prop="threshold">
          <el-input-number v-model="form.threshold" :min="0" :step="100" />
          <span class="form-tip">（客户累计成长值达到此值即可升级）</span>
        </el-form-item>
        <el-form-item label="折扣" prop="discount">
          <el-input-number v-model="form.discount" :min="0" :max="1" :step="0.05" :precision="2" />
          <span class="form-tip">（如 0.9 表示 9 折，1 表示无折扣）</span>
        </el-form-item>
        <el-form-item label="积分倍率" prop="pointsRate">
          <el-input-number v-model="form.pointsRate" :min="1" :step="1" />
          <span class="form-tip">（消费积分倍率，1 为标准倍率）</span>
        </el-form-item>
        <el-form-item label="优先预约">
          <el-switch v-model="form.priorityBooking" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="专属技师">
          <el-switch v-model="form.exclusiveTechnician" :active-value="1" :inactive-value="0" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { memberLevelsApi } from '@/api'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive<any>({
  id: null,
  levelName: '',
  levelCode: '',
  threshold: 0,
  discount: 1,
  pointsRate: 1,
  priorityBooking: 0,
  exclusiveTechnician: 0
})

const rules = {
  levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  levelCode: [{ required: true, message: '请输入等级编码', trigger: 'blur' }],
  threshold: [{ required: true, message: '请输入成长值门槛', trigger: 'blur' }]
}

const discountTag = (discount: number) => {
  if (!discount || discount >= 1) return 'info'
  if (discount >= 0.9) return 'warning'
  return 'danger'
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await memberLevelsApi.list()
    list.value = Array.isArray(res) ? res : (res?.data || [])
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = null
  form.levelName = ''
  form.levelCode = ''
  form.threshold = 0
  form.discount = 1
  form.pointsRate = 1
  form.priorityBooking = 0
  form.exclusiveTechnician = 0
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    levelName: row.levelName,
    levelCode: row.levelCode,
    threshold: row.threshold,
    discount: Number(row.discount),
    pointsRate: row.pointsRate,
    priorityBooking: row.priorityBooking,
    exclusiveTechnician: row.exclusiveTechnician
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await memberLevelsApi.update(form.id, { ...form })
    } else {
      await memberLevelsApi.create({ ...form })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除会员等级「${row.levelName}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await memberLevelsApi.delete(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

onMounted(loadData)
</script>

<style scoped>
.form-tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>
