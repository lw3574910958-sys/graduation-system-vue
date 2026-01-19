<template>
  <div class="basic-layout">
    <Header />
    <div class="basic-layout-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue';
</script>

<style scoped>
.basic-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.basic-layout-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>