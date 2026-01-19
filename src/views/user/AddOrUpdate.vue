<template>
  <base-add-or-update
    :save-api="createUser"
    :update-api="updateUser"
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
import { reactive, ref } from 'vue'
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseAddOrUpdate from '@/components/common/BaseAddOrUpdate.vue'

// 定义事件
const emit = defineEmits(['refreshList'])

// 基础组件引用
const baseRef = ref()

// 表单字段配置
const formFields = [
  {
    prop: 'username',
    label: '用户名',
    component: 'el-input',
    props: { style: { width: '50%' }, readonlyWhenUpdate: true },
  },
  {
    prop: 'realName',
    label: '真实姓名',
    component: 'el-input',
    props: { style: { width: '50%' } },
  },
  {
    prop: 'userType',
    label: '用户类型',
    component: 'el-select',
    props: { placeholder: '请选择用户类型', style: { width: '50%' } },
    options: [
      { label: '学生', value: 'student' },
      { label: '教师', value: 'teacher' },
      { label: '管理员', value: 'admin' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    props: { placeholder: '请选择状态', style: { width: '50%' } },
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
  {
    prop: 'password',
    label: '密码',
    component: 'el-input',
    props: { type: 'password', style: { width: '50%' }, placeholder: '请输入密码' },
  },
  {
    prop: 'avatar',
    label: '头像',
    component: 'el-input', // 实际上应该用文件上传组件，这里简化处理
    props: { style: { width: '50%' } },
  }
]

// 表单初始值
const formDefault = {
  id: undefined,
  username: undefined,
  password: undefined,
  realName: undefined,
  userType: undefined,
  status: 1,
  avatar: undefined,
}

// 对话框标题
const dialogTitle = {
  add: '新增用户信息',
  edit: '修改用户信息',
}

// 表单校验规则
const formRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  realName: [
    {
      required: true,
      message: '请输入真实姓名',
      trigger: 'blur',
    },
  ],
  userType: [
    {
      required: true,
      message: '请选择用户类型',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: false,
      validator: (rule: any, value: any, callback: (error?: Error | undefined) => void) => {
        // 只在创建用户时验证密码
        const formData = baseRef.value?.formData || {}
        if (!formData.id && !value) {
          callback(new Error('请输入密码'));
        } else {
          callback();
        }
      },
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

// 包装API方法以适配类型
const createUser = (data: any) => userApi.createUser(data)
const updateUser = (id: string | number, data: any) => {
  // 转换ID为数字类型，以匹配API期望的类型
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  return userApi.updateUser(numericId, data)
}

// 暴露方法给父组件调用
defineExpose({
  showModel,
  onCancel,
})

// 包装showModel方法
function showModel(row?: Record<string, any>) {
  baseRef.value?.showModel(row)
}

// 包装onCancel方法
function onCancel() {
  baseRef.value?.onCancel()
}
</script>
