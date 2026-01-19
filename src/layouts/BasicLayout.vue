<template>
  <div class="basic-layout">
    <Header />
    <div class="flex-1 overflow-auto p-20 bg-light">
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
</style>