<template>
  <el-dialog
    v-model="visible"
    :title="`审核选题申请 - ${selectionData?.topicTitle || ''}`"
    width="600px"
    :before-close="handleClose"
  >
    <div class="review-info">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请人">{{ selectionData?.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ selectionData?.studentNumber }}</el-descriptions-item>
        <el-descriptions-item label="课题">{{ selectionData?.topicTitle }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ selectionData?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="申请理由" :span="2">
          {{ selectionData?.applyReason }}
        </el-descriptions-item>
        <el-descriptions-item label="学生能力说明" :span="2">
          {{ selectionData?.studentAbility }}
        </el-descriptions-item>
        <el-descriptions-item label="预期目标" :span="2">
          {{ selectionData?.expectedGoal }}
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
      <el-form-item label="审核结果" prop="reviewResult">
        <el-radio-group v-model="formData.reviewResult">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="2">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        label="审核意见" 
        prop="reviewComment"
        :required="formData.reviewResult === 2"
      >
        <el-input
          v-model="formData.reviewComment"
          type="textarea"
          :rows="4"
          :placeholder="formData.reviewResult === 2 ? '请输入驳回原因' : '请输入审核意见'"
        />
      </el-form-item>
      
      <el-form-item label="建议修改" prop="suggestedChanges">
        <el-input
          v-model="formData.suggestedChanges"
          type="textarea"
          :rows="3"
          placeholder="如有修改建议，请在此填写"
        />
      </el-form-item>
      
      <el-form-item label="备注说明" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="其他需要说明的事项"
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
import { selectionApi } from '@/api/selection'
import type { SelectionReviewRequest, SelectionResponse } from '@/types/api/selection'
import { MESSAGE } from '@/constants/user'

interface Props {
  selection?: SelectionResponse
}

const props = defineProps<Props>()

// 对话框可见性
const visible = defineModel<boolean>('visible', { default: false })

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 选题数据
const selectionData = ref<SelectionResponse | null>(null)

// 表单数据
const formData = reactive({
  selectionId: 0,
  reviewResult: 1, // 默认通过
  reviewComment: '',
  suggestedChanges: '',
  remark: ''
})

// 表单验证规则
const formRules: FormRules = {
  reviewResult: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  reviewComment: [
    {
      required: true,
      message: '驳回时必须填写审核意见',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (formData.reviewResult === 2 && (!value || value.trim() === '')) {
          callback(new Error('驳回时必须填写审核意见'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 监听选题数据变化
watch(() => props.selection, (newVal) => {
  if (newVal) {
    selectionData.value = newVal
    formData.selectionId = newVal.id
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  formData.reviewResult = 1
  formData.reviewComment = ''
  formData.suggestedChanges = ''
  formData.remark = ''
  formRef.value?.resetFields()
}

// 显示对话框
const show = (selection: SelectionResponse) => {
  selectionData.value = selection
  formData.selectionId = selection.id
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
    
    const requestData: SelectionReviewRequest = {
      selectionId: formData.selectionId,
      reviewResult: formData.reviewResult,
      reviewComment: formData.reviewComment || undefined,
      suggestedChanges: formData.suggestedChanges || undefined,
      remark: formData.remark || undefined
    }
    
    await selectionApi.reviewSelection(requestData)
    
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
.review-info {
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