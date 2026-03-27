<template>
  <div class="page-container">
    <div class="page-header">
      <h2>服务项目管理</h2>
      <div>
        <el-button @click="showCategoryDialog = true">管理分类</el-button>
        <el-button type="primary" @click="handleAdd">新增服务</el-button>
      </div>
    </div>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="categoryId" label="分类">
        <template #default="{ row }">
          {{ getCategoryName(row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" />
      <el-table-column prop="isFeatured" label="推荐">
        <template #default="{ row }">
          <el-tag v-if="row.isFeatured" type="success">推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
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

    <!-- Service Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑服务' : '新增服务'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="所属分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="form.duration" :min="15" :step="15" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="推荐">
          <el-switch v-model="form.isFeatured" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- Category Dialog -->
    <el-dialog v-model="showCategoryDialog" title="服务分类管理" width="400px">
      <el-table :data="categories" max-height="300">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sortOrder" label="排序" />
      </el-table>
      <template #footer>
        <el-button @click="showCategoryDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { servicesApi } from '@/api'

const loading = ref(false)
const list = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const showCategoryDialog = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = ref({
  categoryId: null as number | null,
  name: '',
  price: 0,
  duration: 60,
  description: '',
  isFeatured: false
})

const getCategoryName = (categoryId: number) => {
  const cat = categories.value.find((c: any) => c.id === categoryId)
  return cat?.name || '-'
}

const loadData = async () => {
  loading.value = true
  try {
    const [services, cats] = await Promise.all([
      servicesApi.list(),
      servicesApi.categories()
    ])
    list.value = services
    categories.value = cats
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { categoryId: null, name: '', price: 0, duration: 60, description: '', isFeatured: false }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该服务项目吗?', '提示', { type: 'warning' })
  try {
    await servicesApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.categoryId) {
    return ElMessage.warning('请填写完整信息')
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await servicesApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await servicesApi.create(form.value)
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
