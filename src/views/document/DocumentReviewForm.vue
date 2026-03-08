<template>
  <el-dialog
    v-model="visible"
    :title="`审核文档 - ${documentData?.originalFilename || ''}`"
    width="600px"
    :before-close="handleClose"
  >
    <div class="document-info">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文档名称">{{ documentData?.originalFilename }}</el-descriptions-item>
        <el-descriptions-item label="文档类型">{{ documentData?.fileTypeDesc }}</el-descriptions-item>
        <el-descriptions-item label="上传者">{{ documentData?.userName }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ documentData?.uploadedAt }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ documentData?.fileSizeDisplay }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(documentData?.reviewStatus)">
            {{ documentData?.reviewStatusDesc }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider />

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      @submit.prevent
      class="unified-form"
    >
      <el-form-item label="审核结果" prop="reviewStatus">
        <el-radio-group v-model="formData.reviewStatus">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="2">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        label="审核意见" 
        prop="feedback"
        :required="formData.reviewStatus === 2"
      >
        <el-input
          v-model="formData.feedback"
          type="textarea"
          :rows="4"
          :placeholder="formData.reviewStatus === 2 ? '请输入驳回原因' : '请输入审核意见'"
        />
      </el-form-item>
      
      <el-form-item label="审核建议" prop="suggestion">
        <el-input
          v-model="formData.suggestion"
          type="textarea"
          :rows="3"
          placeholder="如有修改建议，请在此填写"
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
          提交审核
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { documentApi } from '@/api/document'
import type { DocumentReviewRequest, DocumentResponse } from '@/types/api/document'
import { MESSAGE } from '@/constants/user'

interface Props {
  document?: DocumentResponse
}

const props = defineProps<Props>()

// 对话框可见性
const visible = defineModel<boolean>('visible', { default: false })

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 文档数据
const documentData = ref<DocumentResponse | null>(null)

// 表单数据
const formData = reactive({
  documentId: 0,
  reviewStatus: 1, // 默认通过
  feedback: '',
  suggestion: ''
})

// 表单验证规则
const formRules: FormRules = {
  reviewStatus: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  feedback: [
    {
      required: true,
      message: '驳回时必须填写审核意见',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (formData.reviewStatus === 2 && (!value || value.trim() === '')) {
          callback(new Error('驳回时必须填写审核意见'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 监听文档数据变化
watch(() => props.document, (newVal) => {
  if (newVal) {
    documentData.value = newVal
    formData.documentId = newVal.id
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  formData.reviewStatus = 1
  formData.feedback = ''
  formData.suggestion = ''
  formRef.value?.resetFields()
}

// 获取状态标签类型
const getStatusType = (status?: number) => {
  switch(status) {
    case 0: return 'info'   // 待审核
    case 1: return 'success' // 通过
    case 2: return 'danger'  // 驳回
    default: return 'info'
  }
}

// 显示对话框
const show = (document: DocumentResponse) => {
  documentData.value = document
  formData.documentId = document.id
  resetForm()
  visible.value = true
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    loading.value = true
    
    const requestData: DocumentReviewRequest = {
      documentId: formData.documentId,
      reviewStatus: formData.reviewStatus,
      feedback: formData.feedback || undefined,
      suggestion: formData.suggestion || undefined
    }
    
    await documentApi.reviewDocument(requestData)
    
    ElMessage.success(MESSAGE.UPDATE_SUCCESS)
    handleClose()
    
    // 触发刷新事件
    emits('success')
    
  } catch (error: any) {
    console.error('审核失败:', error)
    ElMessage.error(error.message || MESSAGE.UPDATE_FAILED)
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
.document-info {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 统一表单样式 */
.unified-form :deep(.el-input),
.unified-form :deep(.el-select),
.unified-form :deep(.el-textarea),
.unified-form :deep(.el-radio-group) {
  width: 100%;
}

.unified-form :deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>