<template>
  <el-dialog
    v-model="visible"
    title="确认选题"
    width="500px"
    :before-close="handleClose"
  >
    <div class="confirm-info">
      <el-alert
        title="请确认您的选题"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      />

      <el-descriptions :column="1" border>
        <el-descriptions-item label="课题名称">{{ selectionData?.topicTitle }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ selectionData?.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">{{ selectionData?.departmentName }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag type="success">
            {{ SELECTION_STATUS_LABELS[SELECTION_STATUS.APPROVED] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ selectionData?.reviewedAt }}</el-descriptions-item>
        <el-descriptions-item label="审核意见">
          {{ selectionData?.reviewComment || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        title="确认后您将正式进入该课题的毕业设计流程，后续需要按要求提交开题报告、中期报告和毕业论文。"
        type="warning"
        :closable="false"
        show-icon
        class="mt-4"
      />
    </div>

    <template #footer>
      <el-button @click="handleClose">再想想</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleConfirm">
        确认选择此题
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { SELECTION_STATUS, SELECTION_STATUS_LABELS } from '@/constants/enums'
import { selectionApi } from '@/api/selection'
import type { SelectionResponse } from '@/types/api/selection'

// 定义 props
interface Props {
  selectionData: SelectionResponse | null
}

const props = defineProps<Props>()

// 定义 emits
const emit = defineEmits<{
  close: []
  success: []
}>()

// 弹窗显示状态
const visible = ref(false)

// 提交状态
const submitLoading = ref(false)

// 监听 props 数据变化
watch(() => props.selectionData, (newVal) => {
  if (newVal) {
    visible.value = true
  }
}, { immediate: true })

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 确认选题
const handleConfirm = async () => {
  if (!props.selectionData) return
  
  try {
    submitLoading.value = true
    
    await selectionApi.confirmSelection(String(props.selectionData.id))
    
    ElMessage.success('选题确认成功')
    emit('success')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.message || '确认失败')
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.confirm-info {
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .mt-4 {
    margin-top: 16px;
  }
}
</style>
