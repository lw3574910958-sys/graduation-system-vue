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
  topicId: props.topicId || '',
  topicTitle: props.topicTitle || '',
  applyReason: '',
  studentAbility: '',
  expectedGoal: ''
})

// 表单验证规则
const formRules: FormRules = {
  applyReason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少10个字符', trigger: 'blur' }
  ],
  studentAbility: [
    { required: true, message: '请输入学生能力说明', trigger: 'blur' },
    { min: 10, message: '能力说明至少10个字符', trigger: 'blur' }
  ],
  expectedGoal: [
    { required: true, message: '请输入预期目标', trigger: 'blur' },
    { min: 10, message: '预期目标至少10个字符', trigger: 'blur' }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  return props.topicTitle ? `申请选题 - ${props.topicTitle}` : '申请选题'
})

// 显示对话框
const show = (topicId: string, topicTitle: string) => {
  formData.topicId = topicId
  formData.topicTitle = topicTitle
  formData.applyReason = ''
  formData.studentAbility = ''
  formData.expectedGoal = ''
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
    
    const requestData: SelectionApplyRequest = {
      topicId: formData.topicId,
      applyReason: formData.applyReason,
      studentAbility: formData.studentAbility,
      expectedGoal: formData.expectedGoal
    }
    
    await selectionApi.applySelection(requestData)
    
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