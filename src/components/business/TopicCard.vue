<template>
  <el-card class="topic-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="topic-title">{{ topic.title }}</span>
        <el-tag :type="getStatusType(topic.status)" size="small">{{ getStatusText(topic.status) }}</el-tag>
      </div>
    </template>
    
    <div class="topic-content">
      <div class="topic-description">
        {{ topic.description }}
      </div>
      
      <div class="topic-meta">
        <div class="meta-item">
          <label>指导教师:</label>
          <span>{{ topic.teacherName }}</span>
        </div>
        <div class="meta-item">
          <label>学生:</label>
          <span>{{ topic.studentName || '未分配' }}</span>
        </div>
        <div class="meta-item">
          <label>创建时间:</label>
          <span>{{ formatDate(topic.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="card-footer">
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
.topic-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.topic-content {
  padding: 10px 0;
}

.topic-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.topic-meta {
  font-size: 13px;
  color: #909399;
}

.meta-item {
  display: flex;
  margin-bottom: 4px;
}

.meta-item label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 60px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>