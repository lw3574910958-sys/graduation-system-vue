<template>
  <el-dialog
    v-model="visible"
    title="选题详情"
    width="700px"
    :before-close="handleClose"
  >
    <el-descriptions :column="2" border v-if="selectionData">
      <el-descriptions-item label="课题名称" :span="2">{{ selectionData.topicTitle }}</el-descriptions-item>
      <el-descriptions-item label="学生姓名">{{ selectionData.studentName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="学号">{{ selectionData.studentNumber || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态" v-if="!isStudent">
        <el-tag :type="getStatusType(selectionData.status)">
          {{ getSelectionStatusLabel(selectionData.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="申请时间" :span="2">{{ selectionData.createdAt }}</el-descriptions-item>
      <el-descriptions-item label="申请理由" :span="2">{{ selectionData.applyReason || '-' }}</el-descriptions-item>
      <el-descriptions-item label="学生能力说明" :span="2">{{ selectionData.studentAbility || '-' }}</el-descriptions-item>
      <el-descriptions-item label="预期目标" :span="2">{{ selectionData.expectedGoal || '-' }}</el-descriptions-item>
      
      <!-- 审核信息（如果有） -->
      <template v-if="selectionData.reviewedAt">
        <el-divider content-position="left">审核信息</el-divider>
        <el-descriptions-item label="审核结果">
          <el-tag :type="getReviewResultType(selectionData.status)">
            {{ getReviewResultLabel(selectionData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ selectionData.reviewedAt }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ selectionData.reviewComment || '-' }}</el-descriptions-item>
      </template>
      
      <!-- 确认信息（如果有） -->
      <template v-if="selectionData.confirmedAt">
        <el-divider content-position="left">确认信息</el-divider>
        <el-descriptions-item label="确认时间">{{ selectionData.confirmedAt }}</el-descriptions-item>
      </template>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { SELECTION_STATUS, SELECTION_STATUS_LABELS } from '@/constants/enums'
import type { SelectionResponse } from '@/types/api/selection'
import { useAuthStore } from '@/stores'

// 获取认证信息
const authStore = useAuthStore()
const isStudent = computed(() => authStore.userInfo?.userType === 'student')

// 定义 props
interface Props {
  selectionData: SelectionResponse | null
}

const props = defineProps<Props>()

// 定义 emits
const emit = defineEmits<{
  close: []
}>()

// 弹窗显示状态
const visible = ref(false)

// 监听 props 数据变化
watch(() => props.selectionData, (newVal) => {
  if (newVal) {
    visible.value = true
  } else {
    visible.value = false
  }
}, { immediate: true })

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 获取状态标签
const getSelectionStatusLabel = (status: number): string => {
  return SELECTION_STATUS_LABELS[status as keyof typeof SELECTION_STATUS_LABELS] || '未知状态'
}

// 获取状态类型
const getStatusType = (status: number): 'success' | 'warning' | 'danger' | 'info' => {
  switch(status) {
    case SELECTION_STATUS.PENDING_REVIEW:
      return 'warning'
    case SELECTION_STATUS.APPROVED:
      return 'success'
    case SELECTION_STATUS.REJECTED:
      return 'danger'
    case SELECTION_STATUS.CONFIRMED:
      return 'info'
    default:
      return 'info'
  }
}

// 获取审核结果标签
const getReviewResultLabel = (status: number): string => {
  if (status === SELECTION_STATUS.APPROVED) {
    return '审核通过'
  } else if (status === SELECTION_STATUS.REJECTED) {
    return '审核驳回'
  }
  return '-'
}

// 获取审核结果类型
const getReviewResultType = (status: number): 'success' | 'danger' | 'info' => {
  if (status === SELECTION_STATUS.APPROVED) {
    return 'success'
  } else if (status === SELECTION_STATUS.REJECTED) {
    return 'danger'
  }
  return 'info'
}
</script>

<style scoped lang="scss">
.el-descriptions {
  margin-top: 8px;
}

.el-divider {
  margin: 16px 0;
  font-weight: bold;
}
</style>
