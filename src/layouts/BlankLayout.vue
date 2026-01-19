<template>
  <div class="blank-layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
// 空白布局，通常用于登录页面等不需要侧边栏和头部的页面
</script>

<style scoped>
.blank-layout {
  height: 100vh;
  width: 100vw;
}
</style>