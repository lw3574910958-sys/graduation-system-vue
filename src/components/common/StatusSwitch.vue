<template>
  <el-switch
    v-model="currentStatus"
    :active-value="1"
    :inactive-value="0"
    active-text="启用"
    inactive-text="禁用"
    inline-prompt
    :loading="loading"
    :before-change="handleBeforeChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  row: any
  onToggle: (row: any) => Promise<void>
}

const props = defineProps<Props>()

// 使用 ref 存储当前状态
const currentStatus = ref(props.row.status)
const loading = ref(false)

// 监听外部数据变化，确保同步
watch(() => props.row.status, (newVal: number) => {
  currentStatus.value = newVal
})

// 在切换前执行，返回 Promise 控制是否允许切换
const handleBeforeChange = async () => {
  loading.value = true
  try {
    await props.onToggle(props.row)
    return true // 成功则允许切换
  } catch (error: any) {
    console.error('状态切换失败:', error)
    return false // 失败则阻止切换，自动恢复原状态
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
