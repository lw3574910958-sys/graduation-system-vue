<template>
  <base-add-or-update
    :save-api="documentApi.create"
    :update-api="documentApi.update"
    :form-fields="formFields"
    :form-default="formDefault"
    :dialog-title="dialogTitle"
    :form-rules="formRules"
    @refresh-list="emit('refreshList')"
    ref="baseRef"
  >
  </base-add-or-update>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { documentApi } from '@/api/document'
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
    label: '文档标题',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入文档标题' },
  },
  {
    prop: 'fileName',
    label: '文件名',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入文件名' },
  },
  {
    prop: 'filePath',
    label: '文件路径',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入文件路径' },
  },
  {
    prop: 'studentId',
    label: '学生ID',
    component: 'el-input-number',
    props: { min: 1, style: { width: '60%' }, placeholder: '请输入学生ID' },
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入学生姓名' },
  },
  {
    prop: 'topicId',
    label: '题目ID',
    component: 'el-input-number',
    props: { min: 1, style: { width: '60%' }, placeholder: '请输入题目ID' },
  },
  {
    prop: 'topicTitle',
    label: '题目标题',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入题目标题' },
  },
  {
    prop: 'fileType',
    label: '文件类型',
    component: 'el-select',
    props: { style: { width: '60%' }, placeholder: '请选择文件类型' },
    options: [
      { label: '开题报告', value: '0' },
      { label: '中期报告', value: '1' },
      { label: '毕业论文', value: '2' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    props: { style: { width: '60%' }, placeholder: '请选择状态' },
    options: [
      { label: '待审', value: '0' },
      { label: '通过', value: '1' },
      { label: '驳回', value: '2' }
    ]
  }
]

// 表单初始值
const formDefault = {
  id: undefined,
  title: '',
  fileName: '',
  fileSize: 0,
  fileType: '0',
  filePath: '',
  studentId: 0,
  studentName: '',
  topicId: 0,
  topicTitle: '',
  status: '0',
  uploadTime: undefined,
}

// 对话框标题
const dialogTitle = {
  add: '新增文档信息',
  edit: '修改文档信息',
}

// 表单校验规则
const formRules = {
  title: [
    {
      required: true,
      message: '请输入文档标题',
      trigger: 'blur',
    },
  ],
  fileName: [
    {
      required: true,
      message: '请输入文件名',
      trigger: 'blur',
    },
  ],
  filePath: [
    {
      required: true,
      message: '请输入文件路径',
      trigger: 'blur',
    },
  ],
  studentId: [
    {
      required: true,
      message: '请输入学生ID',
      trigger: 'blur',
    },
  ],
  studentName: [
    {
      required: true,
      message: '请输入学生姓名',
      trigger: 'blur',
    },
  ],
  topicId: [
    {
      required: true,
      message: '请输入题目ID',
      trigger: 'blur',
    },
  ],
  topicTitle: [
    {
      required: true,
      message: '请输入题目标题',
      trigger: 'blur',
    },
  ],
  fileType: [
    {
      required: true,
      message: '请选择文件类型',
      trigger: 'blur',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'blur',
    },
  ],
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