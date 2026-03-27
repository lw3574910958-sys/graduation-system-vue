<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      @submit.prevent
      class="unified-form"
    >
      <el-form-item label="课题标题" prop="topicTitle">
        <el-input
          v-model="formData.topicTitle"
          disabled
          placeholder="课题标题"
        />
      </el-form-item>
      
      <!-- 审核意见（仅重新申请时显示） -->
      <el-form-item 
        v-if="showReviewFeedback" 
        label="审核意见"
      >
        <el-alert
          type="warning"
          :closable="false"
          class="review-feedback-alert"
        >
          {{ formData.reviewFeedback }}
        </el-alert>
      </el-form-item>
      
      <el-form-item label="申请理由" prop="applyReason">
        <el-input
          v-model="formData.applyReason"
          type="textarea"
          :rows="3"
          placeholder="请输入申请理由"
        />
      </el-form-item>
      
      <el-form-item label="学生能力说明" prop="studentAbility">
        <el-input
          v-model="formData.studentAbility"
          type="textarea"
          :rows="3"
          placeholder="请说明您的相关能力和基础"
        />
      </el-form-item>
      
      <el-form-item label="预期目标" prop="expectedGoal">
        <el-input
          v-model="formData.expectedGoal"
          type="textarea"
          :rows="3"
          placeholder="请说明您的预期学习目标"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          提交申请
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { selectionApi } from '@/api/selection'
import type { SelectionApplyRequest } from '@/types/api/selection'
import { MESSAGE } from '@/constants/user'

interface Props {
  topicId?: string
  topicTitle?: string
  reviewFeedback?: string // 审核意见（驳回原因）
  selectionId?: string // 原选题 ID（重新申请时使用）
  isResubmit?: boolean // 是否为重新申请
}

const props = defineProps<Props>()

// 对话框可见性
const visible = defineModel<boolean>('visible', { default: false })

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  topicId: '',
  topicTitle: '',
  reviewFeedback: '', // 审核意见（仅重新申请时使用）
  applyReason: '',
  studentAbility: '',
  expectedGoal: '',
  selectionId: '' // 原选题 ID（重新申请时使用）
})

// 初始化数据
if (props.topicId) {
  formData.topicId = props.topicId
}
if (props.topicTitle) {
  formData.topicTitle = props.topicTitle
}

// 表单验证规则
const formRules: FormRules = {
  applyReason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 10, max: 500, message: '申请理由长度应在 10-500 个字符之间', trigger: 'blur' }
  ],
  studentAbility: [
    { required: true, message: '请输入学生能力说明', trigger: 'blur' },
    { min: 10, max: 500, message: '能力说明长度应在 10-500 个字符之间', trigger: 'blur' }
  ],
  expectedGoal: [
    { required: true, message: '请输入预期目标', trigger: 'blur' },
    { min: 10, max: 500, message: '预期目标长度应在 10-500 个字符之间', trigger: 'blur' }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  return props.topicTitle ? `申请选题 - ${props.topicTitle}` : '申请选题'
})

// 是否显示审核意见（检查 formData 中的值，因为 props.reviewFeedback 是只读的）
const showReviewFeedback = computed(() => {
  return formData.reviewFeedback && formData.reviewFeedback.trim() !== ''
})

// 显示对话框
const show = (topicId: string, topicTitle: string, reviewFeedback?: string, selectionId?: string) => {
  // 直接赋值，确保是原始值
  formData.topicId = topicId
  formData.topicTitle = topicTitle
  formData.reviewFeedback = reviewFeedback || ''
  formData.applyReason = ''
  formData.studentAbility = ''
  formData.expectedGoal = ''
  
  // 如果是重新申请，记录原选题 ID
  if (selectionId) {
    formData.selectionId = selectionId
  }
  
  visible.value = true
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 提交申请
const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    loading.value = true
    
    // 构建纯对象，避免传递响应式对象
    const requestData: any = {
      topicId: formData.topicId,
      applyReason: formData.applyReason,
      studentAbility: formData.studentAbility,
      expectedGoal: formData.expectedGoal
    }
    
    // 如果是重新申请，调用 resubmitSelection API
    if (formData.selectionId) {
      // 重新申请模式：调用 resubmitSelection
      await selectionApi.resubmitSelection(formData.selectionId, requestData)
    } else {
      // 首次申请模式：调用 applySelection
      await selectionApi.applySelection(requestData)
    }
    
    ElMessage.success(MESSAGE.CREATE_SUCCESS)
    handleClose()
    
    // 触发刷新事件
    emits('success')
    
  } catch (error: any) {
    console.error('申请失败:', error)
    ElMessage.error(error.message || MESSAGE.CREATE_FAILED)
  } finally {
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  show
})

// 定义事件
const emits = defineEmits<{
  success: []
}>()
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 审核意见样式优化 - 保留黄色背景 */
.review-feedback-alert {
  width: 100%;
  background-color: #fdf6ec;
}

/* 统一表单样式 */
.unified-form :deep(.el-input),
.unified-form :deep(.el-select),
.unified-form :deep(.el-textarea) {
  width: 100%;
}

.unified-form :deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>