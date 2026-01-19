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
    prop: 'originalFilename',
    label: '原始文件名',
    component: 'el-input',
    props: { style: { width: '60%' }, placeholder: '请输入原始文件名' },
  },
  {
    prop: 'storedPath',
    label: '文档文件',
    component: 'FileUpload',
    props: { 
      style: { width: '60%' },
      listType: 'text',
      maxSize: 10,
      accept: '.pdf,.doc,.docx,.txt,.zip,.rar'
    },
  },
  {
    prop: 'userId',
    label: '用户ID',
    component: 'el-input-number',
    props: { min: 1, style: { width: '60%' }, placeholder: '请输入用户ID' },
  },
  {
    prop: 'topicId',
    label: '题目ID',
    component: 'el-input-number',
    props: { min: 1, style: { width: '60%' }, placeholder: '请输入题目ID' },
  },
  {
    prop: 'fileType',
    label: '文件类型',
    component: 'el-select',
    props: { style: { width: '60%' }, placeholder: '请选择文件类型' },
    options: [
      { label: '开题报告', value: 0 },
      { label: '中期报告', value: 1 },
      { label: '毕业论文', value: 2 }
    ]
  },
  {
    prop: 'reviewStatus',
    label: '审核状态',
    component: 'el-select',
    props: { style: { width: '60%' }, placeholder: '请选择审核状态' },
    options: [
      { label: '待审', value: 0 },
      { label: '通过', value: 1 },
      { label: '驳回', value: 2 }
    ]
  },
  {
    prop: 'feedback',
    label: '审核意见',
    component: 'el-input',
    props: { type: 'textarea', style: { width: '60%' }, placeholder: '请输入审核意见' },
  }
]

// 表单初始值
const formDefault = {
  id: undefined,
  userId: 0,
  topicId: 0,
  fileType: 0,
  originalFilename: '',
  storedPath: '',
  fileSize: 0,
  reviewStatus: 0,
  reviewerId: undefined,
  feedback: undefined,
  uploadedAt: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  reviewedAt: undefined,
}

// 对话框标题
const dialogTitle = {
  add: '新增文档信息',
  edit: '修改文档信息',
}

// 表单校验规则
const formRules = {
  originalFilename: [
    {
      required: true,
      message: '请输入原始文件名',
      trigger: 'blur',
    },
  ],
  storedPath: [
    {
      required: true,
      message: '请输入存储路径',
      trigger: 'blur',
    },
  ],
  userId: [
    {
      required: true,
      message: '请输入用户ID',
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
  fileType: [
    {
      required: true,
      message: '请选择文件类型',
      trigger: 'blur',
    },
  ],
  reviewStatus: [
    {
      required: true,
      message: '请选择审核状态',
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