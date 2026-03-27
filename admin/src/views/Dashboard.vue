<template>
  <div class="dashboard">
    <h2>数据概览</h2>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon class="stat-icon" color="#409EFF"><Shop /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.stores }}</div>
              <div class="stat-label">门店数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon class="stat-icon" color="#67C23A"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.employees }}</div>
              <div class="stat-label">员工数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon class="stat-icon" color="#E6A23C"><UserFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.customers }}</div>
              <div class="stat-label">客户数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon class="stat-icon" color="#F56C6C"><Calendar /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayAppointments }}</div>
              <div class="stat-label">今日预约</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>今日预约列表</span>
          </template>
          <el-table :data="todayAppointments" style="width: 100%">
            <el-table-column prop="customer.name" label="客户" />
            <el-table-column prop="service.name" label="服务项目" />
            <el-table-column prop="employee.name" label="技师" />
            <el-table-column prop="appointmentTime" label="时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近订单</span>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" width="150" />
            <el-table-column prop="customer.name" label="客户" />
            <el-table-column prop="amount" label="金额">
              <template #default="{ row }">
                ¥{{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column prop="payStatus" label="支付状态">
              <template #default="{ row }">
                <el-tag :type="row.payStatus === 'paid' ? 'success' : 'warning'">
                  {{ row.payStatus === 'paid' ? '已支付' : '未支付' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storesApi, employeesApi, customersApi, appointmentsApi, ordersApi } from '@/api'

const stats = ref({
  stores: 0,
  employees: 0,
  customers: 0,
  todayAppointments: 0
})

const todayAppointments = ref([])
const recentOrders = ref([])

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

onMounted(async () => {
  try {
    const [stores, employees, customers, todayData, orders] = await Promise.all([
      storesApi.list(),
      employeesApi.list(),
      customersApi.list(),
      appointmentsApi.today(),
      ordersApi.list({ limit: 10 })
    ])
    
    stats.value = {
      stores: stores.length,
      employees: employees.length,
      customers: customers.length,
      todayAppointments: todayData.length
    }
    todayAppointments.value = todayData
    recentOrders.value = orders.slice(0, 10)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 40px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #999;
  font-size: 14px;
}
</style>
