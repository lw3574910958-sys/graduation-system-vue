<template>
  <el-button v-bind="omit($attrs, 'onClick')" :loading="loading" @click="handleClick()">
    <slot></slot>
  </el-button>
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import { omit } from 'lodash-es'

defineOptions({
  inheritAttrs: false,
})

const loading = ref(false)
const attrs = useAttrs()
async function handleClick() {
  loading.value = true
  try {
    await (attrs.onClick as Function)?.()
  } finally {
    loading.value = false
  }
}
</script>
