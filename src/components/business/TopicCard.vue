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
          <label class="fw-bold mr-8 w-60px text-right">指导教师ID:</label>
          <span>{{ topic.teacherId }}</span>
        </div>
        <div class="d-flex mb-4">
          <label class="fw-bold mr-8 w-60px text-right">院系ID:</label>
          <span>{{ topic.departmentId }}</span>
        </div>
        <div class="d-flex mb-4" v-if="topic.selectedCount !== undefined">
          <label class="fw-bold mr-8 w-60px text-right">已选人数:</label>
          <span>{{ topic.selectedCount }}/{{ topic.maxSelections || 1 }}</span>
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
import { TOPIC_STATUS_LABELS } from '@/constants/enums'

// 课题类型定义 (对应后端 TopicVO)
// 注意：为了保持组件兼容性，保留一些可能需要的扩展字段
interface Topic {
  id: number
  title: string
  description: string
  teacherId: number
  status: number
  departmentId: number
  source?: string
  type?: string
  nature?: string
  difficulty?: number
  workload?: number
  maxSelections?: number
  selectedCount: number
  createdAt?: string
  updatedAt?: string
  // 可选的扩展字段，用于显示教师和学生名称
  teacherName?: string
  studentName?: string
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

// 获取状态类型 (对应后端状态：0-草稿，1-审核中，2-开放，3-关闭)
const getStatusType = (status: number) => {
  if (!status && status !== 0) return 'info'
  switch (status) {
    case 0: // 草稿
      return 'info'
    case 1: // 审核中
      return 'warning'
    case 2: // 开放
      return 'success'
    case 3: // 关闭
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本 (对应后端状态：0-草稿，1-审核中，2-开放，3-关闭)
const getStatusText = (status: number) => {
  if (!status && status !== 0) return '未知'
  return TOPIC_STATUS_LABELS[status as keyof typeof TOPIC_STATUS_LABELS] || '未知'
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