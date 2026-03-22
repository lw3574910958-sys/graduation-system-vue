<template>
  <el-dialog
    v-model="visible"
    :title="`审核题目 - ${topicData?.title || ''}`"
    width="600px"
    :before-close="handleClose"
  >
    <div class="review-info">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="题目标题">{{ topicData?.title }}</el-descriptions-item>
        <el-descriptions-item label="发布教师">{{ topicData?.teacherNumber }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">{{ topicData?.departmentName }}</el-descriptions-item>
        <el-descriptions-item label="题目状态">
          <el-tag :type="getStatusType(topicData?.status)">
            {{ getStatusLabel(topicData?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="题目来源" :span="2">{{ topicData?.source }}</el-descriptions-item>
        <el-descriptions-item label="题目类型" :span="2">{{ topicData?.type }}</el-descriptions-item>
        <el-descriptions-item label="题目性质" :span="2">{{ topicData?.nature }}</el-descriptions-item>
        <el-descriptions-item label="预计难度" :span="2">
          <el-rate v-model="difficulty" disabled show-score text-color="#ff9900" />
        </el-descriptions-item>
        <el-descriptions-item label="预计工作量" :span="2">
          <el-rate v-model="workload" disabled show-score text-color="#ff9900" />
        </el-descriptions-item>
        <el-descriptions-item label="选题人数限制" :span="2">
          {{ topicData?.selectedCount }} / {{ topicData?.maxSelections }}
        </el-descriptions-item>
        <el-descriptions-item label="题目描述" :span="2">
          <div class="description-text">{{ topicData?.description }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider />

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="审核结果" prop="reviewResult">
        <el-radio-group v-model="formData.reviewResult">
          <el-radio :label="REVIEW_RESULT.APPROVED">审核通过</el-radio>
          <el-radio :label="REVIEW_RESULT.REJECTED">审核驳回</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="审核意见" prop="reviewComment">
        <el-input
          v-model="formData.reviewComment"
          type="textarea"
          :rows="4"
          placeholder="请输入审核意见（选填）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确认审核
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { TOPIC_STATUS, TOPIC_STATUS_LABELS, TOPIC_REVIEW_RESULT as REVIEW_RESULT } from '@/constants/enums'
import { topicApi } from '@/api/topic'
import type { TopicResponse } from '@/types/api/topic'

// 定义 props
interface Props {
  topicData: TopicResponse | null
}

const props = defineProps<Props>()

// 定义 emits
const emit = defineEmits<{
  close: []
  success: []
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 弹窗显示状态
const visible = ref(false)

// 提交状态
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  topicId: '',
  reviewResult: REVIEW_RESULT.APPROVED,
  reviewComment: ''
})

// 表单验证规则
const formRules = reactive<FormRules>({
  reviewResult: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ]
})

// 难度和工作量（用于显示）
const difficulty = ref(0)
const workload = ref(0)

// 监听 props 数据变化
watch(() => props.topicData, (newVal) => {
  if (newVal) {
    formData.topicId = String(newVal.id)
    difficulty.value = newVal.difficulty || 0
    workload.value = newVal.workload || 0
    visible.value = true
  }
}, { immediate: true })

// 获取状态标签类型
const getStatusType = (status?: number) => {
  if (!status) return 'info'
  switch (status) {
    case TOPIC_STATUS.OPEN:
      return 'success'
    case TOPIC_STATUS.REVIEWING:
      return 'warning'
    case TOPIC_STATUS.SELECTED:
      return 'primary'
    case TOPIC_STATUS.CLOSED:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态标签文本
const getStatusLabel = (status?: number) => {
  if (!status) return '未知'
  return TOPIC_STATUS_LABELS[status as keyof typeof TOPIC_STATUS_LABELS] || '未知'
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  formData.reviewComment = ''
  emit('close')
}

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitLoading.value = true
      
      await topicApi.reviewTopic({
        topicId: formData.topicId,
        reviewResult: formData.reviewResult,
        reviewComment: formData.reviewComment || undefined
      })
      
      ElMessage.success('题目审核成功')
      emit('success')
      handleClose()
    } catch (error: any) {
      ElMessage.error(error.message || '审核失败')
    } finally {
      submitLoading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.review-info {
  margin-bottom: 20px;
  
  .description-text {
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
