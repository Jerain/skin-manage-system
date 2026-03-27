<template>
  <div class="page-container">
    <el-page-header @back="router.back()" content="员工详情" />
    <div class="content">
      <p>员工详情页面 - 开发中</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.content {
  margin-top: 20px;
}
</style>
