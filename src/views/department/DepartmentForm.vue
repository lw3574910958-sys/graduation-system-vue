<template>
  <base-add-or-update
    :save-api="departmentApi.create"
    :update-api="departmentApi.update"
    :form-fields="formFields"
    :form-default="formDefault"
    :dialog-title="dialogTitle"
    :form-rules="formRules"
    @refresh-list="emit('refreshList')"
    ref="baseRef"
  >
  </base-add-or-update>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { departmentApi } from '@/api/department'
import { ElMessage } from 'element-plus'
import BaseAddOrUpdate from '@/components/common/BaseAddOrUpdate.vue'

// 触发自定义事件
const emit = defineEmits(['refreshList'])

// 基础组件引用
const baseRef = ref()

// 表单字段配置
const formFields = [
  {
    prop: 'name',
    label: '院系名称',
    component: 'el-input',
    props: { placeholder: '请输入院系名称' },
  },
  {
    prop: 'code',
    label: '院系代码',
    component: 'el-input',
    props: { placeholder: '请输入院系代码' },
  },
  {
    prop: 'description',
    label: '描述',
    component: 'el-input',
    props: { type: 'textarea', rows: 3, placeholder: '请输入描述' },
  }
]

// 表单初始值
const formDefault = {
  id: undefined,
  name: '',
  code: '',
  description: '',
}

// 对话框标题
const dialogTitle = {
  add: '新增院系',
  edit: '编辑院系',
}

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入院系名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入院系代码', trigger: 'blur' }
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

<style scoped>
/* 使用 global.less 中的 dialog-footer 样式 */
</style>