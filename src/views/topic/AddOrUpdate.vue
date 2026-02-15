<!-- <base-add-or-update
  :save-api="topicApi.create"
  :update-api="topicApi.update"
  :form-fields="formFields"
  :form-default="formDefault"
  :dialog-title="dialogTitle"
  :form-rules="formRules"
  @refresh-list="emit('refreshList')"
  ref="baseRef"
>
</base-add-or-update> -->

<script lang="ts" setup>
import { ref } from 'vue'
import { topicApi } from '@/api/topic'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseAddOrUpdate from '@/components/common/BaseAddOrUpdate.vue'

// 触发自定义事件
const emit = defineEmits(['refreshList'])

// 基础组件引用
const baseRef = ref()

// 表单字段配置
const formFields = [
  {
    prop: 'title',
    label: '课题标题',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入课题标题' },
  },
  {
    prop: 'description',
    label: '课题描述',
    component: 'el-input',
    props: { type: 'textarea', rows: 4, style: { width: '60%' }, placeholder: '请输入课题描述' },
  },
  {
    prop: 'teacherId',
    label: '发布教师ID',
    component: 'el-input-number',
    props: { min: 1, style: { width: '60%' }, placeholder: '请输入发布教师ID' },
  },

  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    props: { style: { width: '60%' }, placeholder: '请选择状态' },
    options: [
      { label: '开放', value: 0 },
      { label: '已选', value: 1 },
      { label: '关闭', value: 2 }
    ]
  }
]

// 表单初始值
const formDefault = {
  id: undefined,
  title: '',
  description: '',
  requirement: '',
  difficulty: '',
  teacherId: 0,
  departmentId: 0,
  maxStudents: 1,
  status: 0,
}

// 对话框标题
const dialogTitle = {
  add: '新增课题信息',
  edit: '修改课题信息',
}

// 表单校验规则
const formRules = {
  title: [
    {
      required: true,
      message: '请输入课题标题',
      trigger: 'blur',
    },
  ],
  description: [
    {
      required: true,
      message: '请输入课题描述',
      trigger: 'blur',
    },
  ],
  teacherId: [
    {
      required: true,
      message: '请输入发布教师ID',
      trigger: 'blur',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'blur',
    },
  ]
}

// 暴露方法给父组件调用
defineExpose({
  showModel,
  onCancel,
})

// 包装showModel方法
function showModel(row?: any) {
  baseRef.value?.showModel(row)
}

// 包装onCancel方法
function onCancel() {
  baseRef.value?.onCancel()
}
</script>
