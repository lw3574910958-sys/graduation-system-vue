<template>
  <el-dialog
    v-model="visible"
    title="上传文档"
    width="600px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      @submit.prevent
      class="unified-form"
    >
      <el-form-item label="文件类型" prop="fileType">
        <el-input :value="fileTypeLabel" disabled />
      </el-form-item>
      
      <el-form-item label="选择文件" prop="file">
        <input
          ref="fileInputRef"
          type="file"
          :accept="getFileAccept()"
          style="display: none;"
          @change="handleFileChange"
        />
        <el-button @click="triggerFileInput">
          选择文件
        </el-button>
        <span v-if="selectedFileName" style="margin-left: 10px;">{{ selectedFileName }}</span>
      </el-form-item>
      
      <el-form-item label="文档描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入文档描述（可选）"
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
          上传
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { documentApi } from '@/api/document'
import { selectionApi } from '@/api/selection'
import { MESSAGE } from '@/constants/user'
import { FILE_TYPE_LABELS } from '@/constants/user'
import { useRoute } from 'vue-router'

// 路由
const route = useRoute()

// 对话框可见性
const visible = defineModel<boolean>('visible', { default: false })

// 表单引用
const formRef = ref<FormInstance>()
const fileInputRef = ref<HTMLInputElement>()
const selectedFileName = ref('')

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  topicId: '' as string,
  fileType: null as number | null,
  file: '' as string,
  description: '',
  originalDocumentId: '' as string | null // 原文档 ID（重新上传时使用）
})

// 文件类型标签（从路由参数读取）
const fileTypeLabel = computed(() => {
  const type = route.query.type as string
  if (type !== undefined && type !== null) {
    const fileTypeNum = parseInt(type)
    return FILE_TYPE_LABELS[fileTypeNum as keyof typeof FILE_TYPE_LABELS] || '未知'
  }
  return '未知'
})

// 表单验证规则
const formRules: FormRules = {
  fileType: [
    { required: true, message: '文件类型不能为空', trigger: 'change' }
  ],
  file: [
    { required: true, message: '请选择要上传的文件', trigger: 'change' }
  ]
}

// 获取文件接受类型
const getFileAccept = () => {
  // 根据文件类型返回对应的接受类型（与后端 FileFormatType 保持一致）
  const type = route.query.type as string
  if (type !== undefined && type !== null) {
    const fileTypeNum = parseInt(type)
    // 0-开题报告，1-中期报告，2-毕业论文 - 通常都是 Word 或 PDF
    if (fileTypeNum === 0 || fileTypeNum === 1 || fileTypeNum === 2) {
      return '.doc,.docx,.pdf'
    }
  }
  return ''
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      formData.file = file.name
      selectedFileName.value = file.name
    }
  }
}

// 重置表单
const resetForm = () => {
  formData.topicId = ''
  formData.fileType = null
  formData.file = ''
  formData.description = ''
  formData.originalDocumentId = null
  selectedFileName.value = ''
  formRef.value?.resetFields()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 显示对话框
const show = async (originalDocumentId?: string, fileTypeFromRoute?: number) => {
  resetForm()
  
  // 如果是重新上传，记录原文档 ID
  if (originalDocumentId) {
    formData.originalDocumentId = originalDocumentId
  }
  
  // 从路由参数或函数参数获取文件类型
  let fileType: number | null = null
  if (fileTypeFromRoute !== undefined && fileTypeFromRoute !== null) {
    fileType = fileTypeFromRoute
  } else {
    const type = route.query.type as string
    if (type !== undefined && type !== null) {
      fileType = parseInt(type)
    }
  }
  
  if (fileType !== null) {
    formData.fileType = fileType
  }
  
  // 查询用户的选题记录，获取 topicId
  try {
    const res = await selectionApi.getSelectionPage({
      current: 1,
      size: 100
    })
    
    // 查找已确认的选题
    const confirmedSelection = res.data?.records?.find(
      (record: any) => record.status === 3 // 3 表示已确认
    )
    
    if (confirmedSelection && confirmedSelection.topicId) {
      formData.topicId = String(confirmedSelection.topicId)
    } else {
      ElMessage.warning('未找到已确认的选题')
      return
    }
  } catch (error: any) {
    console.error('查询选题状态失败:', error)
    ElMessage.error('查询选题状态失败')
    return
  }
  
  visible.value = true
}

// 提交上传
const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  // 检查是否选择了文件
  const fileInput = fileInputRef.value
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    ElMessage.error('请先选择文件')
    return
  }
  
  const file = fileInput.files[0]
  if (!file) {
    ElMessage.error('文件选择失败，请重试')
    return
  }
  
  try {
    loading.value = true
    
    // 判断是首次上传还是重新上传
    if (formData.originalDocumentId) {
      // 重新上传模式：调用 reuploadDocument API
      await documentApi.reuploadDocument(formData.originalDocumentId, {
        topicId: formData.topicId,
        fileType: formData.fileType!,
        file: file,
        description: formData.description || undefined
      })
      ElMessage.success('重新上传成功')
    } else {
      // 首次上传模式：调用 uploadDocument
      await documentApi.uploadDocument({
        topicId: formData.topicId,
        fileType: formData.fileType!,
        file: file,
        description: formData.description || undefined,
        version: '1.0'
      })
      ElMessage.success(MESSAGE.CREATE_SUCCESS)
    }
    
    handleClose()
    
    // 触发刷新事件
    emits('success')
    
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error(error.message || '上传失败')
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
