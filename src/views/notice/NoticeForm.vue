<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { noticeApi } from '@/api/notice'
import type { NoticeCreateRequest, NoticeUpdateRequest, NoticeResponse } from '@/types'

// 直接定义枚举值，避免导入问题
const NoticeTypeEnum = {
  SYSTEM_NOTICE: 1,
  ANNOUNCEMENT: 2,
  REMINDER: 3
}

const NoticePriorityEnum = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
}

const TargetScopeEnum = {
  ALL: 0,
  STUDENT: 1,
  TEACHER: 2,
  ADMIN: 3
}

const props = defineProps<{
  modelValue: boolean
  notice?: NoticeResponse | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive<NoticeCreateRequest & NoticeUpdateRequest>({
  title: '',
  content: '',
  type: NoticeTypeEnum.SYSTEM_NOTICE,
  priority: NoticePriorityEnum.MEDIUM,
  startTime: '',
  endTime: '',
  isSticky: 0,
  targetScope: TargetScopeEnum.ALL,
  attachmentUrl: '',
  publishNow: false
})

// 表单规则
const formRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ]
}

// 枚举选项
const noticeTypeOptions = [
  { label: '系统通知', value: NoticeTypeEnum.SYSTEM_NOTICE },
  { label: '公告', value: NoticeTypeEnum.ANNOUNCEMENT },
  { label: '提醒', value: NoticeTypeEnum.REMINDER }
]

const noticePriorityOptions = [
  { label: '低', value: NoticePriorityEnum.LOW },
  { label: '中', value: NoticePriorityEnum.MEDIUM },
  { label: '高', value: NoticePriorityEnum.HIGH }
]

const targetScopeOptions = [
  { label: '全体', value: TargetScopeEnum.ALL },
  { label: '学生', value: TargetScopeEnum.STUDENT },
  { label: '教师', value: TargetScopeEnum.TEACHER },
  { label: '管理员', value: TargetScopeEnum.ADMIN }
]

// 编辑模式判断
const isEditMode = computed(() => !!props.notice?.id)

// 监听对话框打开
watch(dialogVisible, (newVal) => {
  if (newVal) {
    if (props.notice) {
      // 编辑模式 - 填充表单数据
      Object.assign(formData, {
        title: props.notice.title,
        content: props.notice.content,
        type: props.notice.type,
        priority: props.notice.priority,
        startTime: props.notice.startTime,
        endTime: props.notice.endTime,
        isSticky: props.notice.isSticky,
        targetScope: props.notice.targetScope,
        attachmentUrl: props.notice.attachmentUrl || ''
      })
    } else {
      // 新建模式 - 重置表单
      resetForm()
    }
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    content: '',
    type: NoticeTypeEnum.SYSTEM_NOTICE,
    priority: NoticePriorityEnum.MEDIUM,
    startTime: '',
    endTime: '',
    isSticky: 0,
    targetScope: TargetScopeEnum.ALL,
    attachmentUrl: '',
    publishNow: false
  })
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (isEditMode.value) {
      // 编辑模式
      const updateData: NoticeUpdateRequest = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isSticky: formData.isSticky,
        targetScope: formData.targetScope,
        attachmentUrl: formData.attachmentUrl
      }
      
      const res = await noticeApi.updateNotice(props.notice!.id, updateData)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        emit('success')
      }
    } else {
      // 新建模式
      const createData: NoticeCreateRequest = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isSticky: formData.isSticky,
        targetScope: formData.targetScope,
        attachmentUrl: formData.attachmentUrl,
        publishNow: formData.publishNow
      }
      
      const res = await noticeApi.createNotice(createData)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        emit('success')
      }
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error(isEditMode.value ? '更新失败' : '创建失败')
    }
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑通知' : '新建通知'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="通知标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入通知标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="通知类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择通知类型" style="width: 100%">
          <el-option
            v-for="option in noticeTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
          <el-option
            v-for="option in noticePriorityOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="目标范围" prop="targetScope">
        <el-select v-model="formData.targetScope" placeholder="请选择目标范围" style="width: 100%">
          <el-option
            v-for="option in targetScopeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="生效时间">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          placeholder="请选择开始时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 45%"
        />
        <span class="mx-2">至</span>
        <el-date-picker
          v-model="formData.endTime"
          type="datetime"
          placeholder="请选择结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 45%"
        />
      </el-form-item>
      
      <el-form-item label="是否置顶">
        <el-switch
          v-model="formData.isSticky"
          :active-value="1"
          :inactive-value="0"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      
      <el-form-item v-if="!isEditMode" label="立即发布">
        <el-switch
          v-model="formData.publishNow"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      
      <el-form-item label="附件链接">
        <el-input
          v-model="formData.attachmentUrl"
          placeholder="请输入附件URL"
        />
      </el-form-item>
      
      <el-form-item label="通知内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="6"
          placeholder="请输入通知内容"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.mx-2 {
  margin: 0 0.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>