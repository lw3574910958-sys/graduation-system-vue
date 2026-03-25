<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :before-close="handleClose"
  >
    <!-- 自定义标题区域（可选） -->
    <slot name="header-content">
      <div v-if="entityTitle" class="dialog-subtitle">
        {{ entityTitle }}
      </div>
    </slot>

    <el-descriptions :column="1" border>
      <!-- 自定义前置内容（可选） -->
      <slot name="before-info"></slot>

      <!-- 审核结果 -->
      <el-descriptions-item label="审核结果">
        <el-tag :type="reviewOutcomeType" size="default">
          {{ reviewOutcomeLabel }}
        </el-tag>
      </el-descriptions-item>

      <!-- 审核人 -->
      <el-descriptions-item label="审核人">
        {{ reviewerNameDisplay }}
      </el-descriptions-item>

      <!-- 审核时间 -->
      <el-descriptions-item label="审核时间">
        {{ reviewedAtDisplay }}
      </el-descriptions-item>

      <!-- 审核意见/反馈 -->
      <el-descriptions-item 
        v-if="feedback" 
        label="审核意见" 
        :span="1"
      >
        <div class="review-feedback">
          {{ feedback }}
        </div>
      </el-descriptions-item>

      <!-- 自定义后置内容（可选） -->
      <slot name="after-info"></slot>
    </el-descriptions>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="ReviewInfoDialog">
import { computed } from 'vue'
import { getTopicReviewOutcomeLabel } from '@/constants'

// Props 定义
interface Props {
  title?: string // 对话框标题
  entityTitle?: string // 实体标题（如题目标题、文档名称等）
  reviewOutcome?: number | null // 审核结果：1-通过，2-驳回
  reviewerName?: string | null // 审核人姓名
  reviewerId?: string | number | null // 审核人 ID
  reviewedAt?: string | null // 审核时间
  feedback?: string | null // 审核意见/反馈
}

const props = withDefaults(defineProps<Props>(), {
  title: '审核信息',
  entityTitle: '',
  reviewOutcome: null,
  reviewerName: null,
  reviewerId: null,
  reviewedAt: null,
  feedback: '',
})

// 对话框可见性（使用 defineModel）
const visible = defineModel<boolean>('visible', { default: false })

// 计算属性：审核结果标签
const reviewOutcomeLabel = computed(() => {
  if (!props.reviewOutcome) return '-'
  return getTopicReviewOutcomeLabel(props.reviewOutcome)
})

// 计算属性：审核结果标签类型
const reviewOutcomeType = computed(() => {
  if (!props.reviewOutcome) return 'info'
  return props.reviewOutcome === 1 ? 'success' : 'danger'
})

// 计算属性：审核人显示名称（姓名 + ID）
const reviewerNameDisplay = computed(() => {
  if (props.reviewerName && props.reviewerId) {
    return `${props.reviewerName} - ${props.reviewerId}`
  } else if (props.reviewerName) {
    return props.reviewerName
  } else if (props.reviewerId) {
    return `ID: ${props.reviewerId}`
  }
  return '-'
})

// 计算属性：审核时间显示
const reviewedAtDisplay = computed(() => {
  if (!props.reviewedAt) return '-'
  return props.reviewedAt.replace('T', ' ').substring(0, 19)
})

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.dialog-subtitle {
  font-size: 14px;
  color: #606266;
  margin-top: -10px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.review-feedback {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  color: #606266;
}

:deep(.el-descriptions__label) {
  width: 100px;
  text-align: left;
  font-weight: 500;
}

:deep(.el-descriptions__content) {
  flex: 1;
}

:deep(.el-tag) {
  min-width: 80px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
