<template>
  <el-card class="topic-card" shadow="hover">
    <template #header>
      <div class="d-flex justify-between align-center">
        <span class="fw-bold fs-16 text-primary">{{ topic.title }}</span>
        <el-tag :type="getStatusType(topic.status)" size="small">{{ getStatusText(topic.status) }}</el-tag>
      </div>
    </template>
    
    <div class="p-10">
      <div class="text-muted fs-14">
        {{ topic.description }}
      </div>
      
      <div class="topic-meta">
        <div class="d-flex mb-4">
          <label class="fw-bold mr-8 w-60px text-right">指导教师:</label>
          <span>{{ topic.teacherName }}</span>
        </div>
        <div class="d-flex mb-4">
          <label class="fw-bold mr-8 w-60px text-right">学生:</label>
          <span>{{ topic.studentName || '未分配' }}</span>
        </div>
        <div class="d-flex mb-4">
          <label class="fw-bold mr-8 w-60px text-right">创建时间:</label>
          <span>{{ formatDate(topic.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="d-flex justify-end" style="gap: 8px;">
        <el-button type="primary" size="small" @click="handleView">查看详情</el-button>
        <el-button v-if="canOperate" type="success" size="small" @click="handleSelect">选择课题</el-button>
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

// 课题类型定义
interface Topic {
  id: number
  title: string
  description: string
  teacherId: number
  teacherName: string
  studentId?: number
  studentName?: string
  status: string
  createdAt?: string
}

// 定义props
const props = defineProps({
  topic: {
    type: Object as PropType<Topic>,
    required: true
  },
  canOperate: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['view', 'select'])

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
    case 'open':
      return 'success'
    case 'assigned':
    case 'selected':
      return 'warning'
    case 'completed':
      return 'info'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
    case 'open':
      return '可选'
    case 'assigned':
    case 'selected':
      return '已选'
    case 'completed':
      return '完成'
    default:
      return status
  }
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 查看详情
const handleView = () => {
  emit('view', props.topic)
}

// 选择课题
const handleSelect = () => {
  emit('select', props.topic)
}
</script>

<style scoped>
/* 使用 global.less 中的通用样式类 */
</style>