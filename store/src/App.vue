<template>
  <view class="app-container">
    <u-navbar :title="title" :auto-back="true" v-if="showNavbar" />
    <slot />
    <u-tabbar :list="tabbarList" :active="activeTab" @change="tabChange" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('门店端')
const showNavbar = ref(true)
const activeTab = ref(0)

const tabbarList = [
  {
    iconPath: 'home',
    selectedIconPath: 'home-fill',
    text: '首页',
    pagePath: '/pages/index/index'
  },
  {
    iconPath: 'calendar',
    selectedIconPath: 'calendar-fill',
    text: '预约',
    pagePath: '/pages/appointments/index'
  },
  {
    iconPath: 'account',
    selectedIconPath: 'account-fill',
    text: '我的',
    pagePath: '/pages/mine/index'
  }
]

const tabChange = (index: number) => {
  activeTab.value = index
}
</script>

<style>
page {
  background-color: #f5f5f5;
}
.app-container {
  min-height: 100vh;
}
</style>
