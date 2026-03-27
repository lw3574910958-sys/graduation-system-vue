<template>
  <base-add-or-update
    :save-api="handleSave"
    :update-api="topicApi.update"
    :form-fields="formFields"
    :form-default="formDefault"
    :dialog-title="dialogTitle"
    :form-rules="formRules"
    dialog-width="700px"
    label-width="100px"
    @refresh-list="emit('refreshList')"
    ref="baseRef"
  >
    <template #buttons="{ loading }">
      <el-button 
        v-if="isAddMode && canEditOrDelete" 
        type="primary" 
        @click="handleSubmit(true)"
        :loading="loading"
      >
        暂存
      </el-button>
      <el-button 
        v-if="isAddMode && canEditOrDelete" 
        type="success" 
        @click="handleSubmit(false)"
        :loading="loading"
      >
        确定
      </el-button>
      <el-button 
        v-if="!isAddMode && canEditOrDelete" 
        type="primary" 
        @click="handleSubmit(false)"
        :loading="loading"
      >
        确定
      </el-button>
      <el-button @click="onCancel()">取消</el-button>
    </template>
  </base-add-or-update>
</template>

<script lang="ts" setup name="TopicAddOrUpdate">
import { ref, computed } from 'vue'
import { topicApi } from '@/api/topic'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseAddOrUpdate from '@/components/common/BaseAddOrUpdate.vue'
import type { TopicCreateRequest, TopicUpdateRequest } from '@/types/api/topic'
import { TOPIC_SOURCE, TOPIC_TYPE, TOPIC_NATURE, TOPIC_DIFFICULTY, TOPIC_WORKLOAD, USER_TYPE_ENUM } from '@/constants/enums'
import { useAuthStore } from '@/stores'

// 触发自定义事件
const emit = defineEmits(['refreshList'])

// 获取用户信息
const authStore = useAuthStore()
const userType = computed(() => authStore.userInfo?.userType)

// 基础组件引用
const baseRef = ref()

// 判断是否为新增模式
const isAddMode = ref(false)

// 判断是否为教师（可以申请课题）
const canEditOrDelete = computed(() => {
  return userType.value === USER_TYPE_ENUM.TEACHER
})

// 表单字段配置
const formFields = [
  // 第一行：题目标题（独占一行）
  {
    prop: 'title',
    label: '题目标题',
    component: 'el-input',
    props: { placeholder: '请输入题目标题' },
    fullWidth: true // 独占一行标记
  },
  // 第二行：题目来源（独占一行）
  {
    prop: 'source',
    label: '题目来源',
    component: 'el-select',
    props: { placeholder: '请选择题目来源' },
    options: Object.entries(TOPIC_SOURCE).map(([key, value]) => ({
      label: value,
      value: value
    }))
  },
  // 第三行：题目类型（独占一行）
  {
    prop: 'type',
    label: '题目类型',
    component: 'el-radio-group',
    props: {},
    options: Object.entries(TOPIC_TYPE).map(([key, value]) => ({
      label: value,
      value: value
    })),
    fullWidth: true // 独占一行
  },
  // 第四行：题目性质（独占一行）
  {
    prop: 'nature',
    label: '题目性质',
    component: 'el-radio-group',
    props: {},
    options: Object.entries(TOPIC_NATURE).map(([key, value]) => ({
      label: value,
      value: value
    })),
    fullWidth: true // 独占一行
  },
  // 第四行：预计难度（独占一行）
  {
    prop: 'difficulty',
    label: '预计难度',
    component: 'el-select',
    props: { placeholder: '请选择预计难度' },
    options: [
      { label: '简单', value: 1 },
      { label: '适中', value: 2 },
      { label: '困难', value: 3 },
      { label: '很难', value: 4 },
      { label: '极难', value: 5 }
    ]
  },
  // 第五行：预计工作量（独占一行）
  {
    prop: 'workload',
    label: '预计工作量',
    component: 'el-select',
    props: { placeholder: '请选择预计工作量' },
    options: [
      { label: '少于 10 学时', value: 1 },
      { label: '10-20 学时', value: 2 },
      { label: '20-30 学时', value: 3 },
      { label: '30-40 学时', value: 4 },
      { label: '40 学时以上', value: 5 }
    ]
  },
  // 第六行：选题人数限制（独占一行）
  {
    prop: 'maxSelections',
    label: '选题人数限制',
    component: 'el-input-number',
    props: { 
      min: 1, 
      max: 100, 
      controlsPosition: 'right', // 右侧带加减按钮
      placeholder: '请输入选题人数限制'
    },
  },
  // 第七行：题目描述（独占一行，位于最后）
  {
    prop: 'description',
    label: '题目描述',
    component: 'el-input',
    props: { type: 'textarea', rows: 4, placeholder: '请输入题目描述' },
    fullWidth: true // 独占一行标记
  }
]

// 表单初始值 - 使用 TopicCreateRequest 类型
// 注意：departmentId 和 teacherId 由后端根据登录用户信息自动填充
const formDefault: TopicCreateRequest = {
  title: '',
  description: '',
  source: undefined,
  type: undefined,
  nature: undefined,
  difficulty: undefined,
  workload: undefined,
  maxSelections: 1, // 默认 1 人
}

// 对话框标题
const dialogTitle = {
  add: '申请课题',
  edit: '修改课题',
}

// 表单校验规则
const formRules = {
  title: [
    {
      required: true,
      message: '请输入题目标题',
      trigger: 'blur',
    },
  ],
  description: [
    {
      required: true,
      message: '请输入题目描述',
      trigger: 'blur',
    },
  ],
  maxSelections: [
    {
      required: true,
      message: '请输入选题人数限制',
      trigger: 'blur',
    },
  ]
}

// 暴露方法给父组件调用
defineExpose({
  showModel,
  onCancel,
})

// 包装 showModel 方法，记录是否为新增模式
function showModel(row?: any) {
  isAddMode.value = !row // 如果没有 row，说明是新增模式
  baseRef.value?.showModel(row)
}

// 自定义保存方法（支持暂存和申请题目）
async function handleSave(param: TopicCreateRequest) {
  // 默认暂存（草稿状态），由后端处理
  return await topicApi.create(param)
}

// 处理按钮点击（暂存或申请题目）
async function handleSubmit(isDraft: boolean) {
  if (!baseRef.value) return
  
  // 触发表单验证
  try {
    await (baseRef.value as any).formRef.validate()
  } catch (error) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  // 获取表单数据（直接从 baseRef.value.formData 获取）
  const formData = baseRef.value.formData
  
  try {
    // 设置状态字段：0-暂存为草稿，1-直接提交审核
    formData.status = isDraft ? 0 : 1
    
    // 创建题目（后端会根据 status 字段设置初始状态）
    await topicApi.create(formData)
    
    ElMessage.success(isDraft ? '暂存成功' : '申请成功，已自动提交审核')
    emit('refreshList')
    baseRef.value.closeDialog()
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(error?.message || '提交失败')
  }
}

// 包装onCancel方法
function onCancel() {
  baseRef.value?.onCancel()
}
</script>
