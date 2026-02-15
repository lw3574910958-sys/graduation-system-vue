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
    props: { style: { width: '50%' }, readonlyWhenUpdate: true, placeholder: '4-20位字母、数字或下划线' },
  },
  {
    prop: 'realName',
    label: '真实姓名',
    component: 'el-input',
    props: { style: { width: '50%' }, placeholder: '请输入真实姓名' },
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
    props: { type: 'password', style: { width: '50%' }, placeholder: '至少包含字母和数字，长度≥6位', showPassword: true },
  },
  {
    prop: 'phone',
    label: '手机号',
    component: 'el-input',
    props: { style: { width: '50%' }, placeholder: '请输入手机号码' },
  },
  {
    prop: 'email',
    label: '邮箱',
    component: 'el-input',
    props: { style: { width: '50%' }, placeholder: '请输入邮箱地址' },
  },
  {
    prop: 'avatar',
    label: '头像',
    component: 'el-input', // 实际上应该用文件上传组件，这里简化处理
    props: { style: { width: '50%' }, placeholder: '头像URL或存储路径' },
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
  phone: undefined,
  email: undefined,
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
    {
      pattern: /^[a-zA-Z0-9_]{4,20}$/,
      message: '用户名必须是4-20位字母、数字或下划线',
      trigger: 'blur',
    }
  ],
  realName: [
    {
      required: true,
      message: '请输入真实姓名',
      trigger: 'blur',
    },
    {
      min: 2,
      max: 20,
      message: '姓名长度应在2-20个字符之间',
      trigger: 'blur',
    }
  ],
  userType: [
    {
      required: true,
      message: '请选择用户类型',
      trigger: 'blur',
    },
    {
      validator: (rule: any, value: any, callback: (error?: Error | undefined) => void) => {
        const validTypes = ['student', 'teacher', 'admin'];
        if (!value || !validTypes.includes(value)) {
          callback(new Error('请选择有效的用户类型'));
        } else {
          callback();
        }
      },
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
        } else if (value && (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(value))) {
          callback(new Error('密码必须至少包含一个字母和一个数字，长度至少为6位'));
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
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    }
  ],
  email: [
    {
      pattern: /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/, 
      message: '请输入正确的邮箱地址',
      trigger: 'blur',
    }
  ]
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
