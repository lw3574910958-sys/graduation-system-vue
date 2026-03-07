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
    // 编辑时可选（不传则不修改密码）
    optional: true,
  },
  {
    prop: 'avatar',
    label: '头像',
    component: 'FileUpload', // 使用文件上传组件
    props: { 
      isAvatarUpload: true, // 标记为头像上传
      accept: 'image/*', // 只允许图片格式
      listType: 'picture-card', // 图片卡片样式
      maxUploadSize: 1, // 最多上传 1 张图片
      maxSize: 2, // 最大 2MB
      autoUpload: true, // ✅ 启用自动上传，选择图片后立即调用后端接口
    },
  }
]

// 表单初始值
interface FormDataType {
  id?: string
  username?: string
  password?: string
  realName?: string
  userType?: string
  email?: string
  phone?: string
  departmentId?: number
  status?: number
  avatar?: string
}

const formDefault: FormDataType = {
  id: undefined,
  username: undefined,
  password: undefined,
  realName: undefined,
  userType: undefined,
  email: undefined,
  phone: undefined,
  departmentId: undefined,
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
          // 创建用户时必填
          callback(new Error('请输入密码'));
        } else if (value && (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(value))) {
          // 编辑时如果填写了密码，则验证格式
          callback(new Error('密码必须至少包含一个字母和一个数字，长度至少为6位'));
        } else {
          // 编辑时不填密码也可以
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
  ]
}

import type { UserCreateRequest, UserUpdateRequest } from '@/types/api/user'

const createUser = (data: FormDataType) => {
  const requestData: UserCreateRequest = {
    username: data.username!,
    realName: data.realName!,
    userType: data.userType!,
    password: data.password!,
    status: data.status,
    avatar: data.avatar
  }
  return userApi.createUser(requestData)
}
const updateUser = (id: string, data: Partial<UserUpdateRequest>) => {
  // 构建更新数据，如果密码为空则不传递
  const updateData: Partial<UserUpdateRequest> = {}
  if (data.realName) updateData.realName = data.realName
  if (data.userType) updateData.userType = data.userType
  if (data.password) updateData.password = data.password  // 只有填写了密码才传递
  if (data.status !== undefined) updateData.status = data.status
  if (data.avatar !== undefined) updateData.avatar = data.avatar
  
  return userApi.updateUser(id, updateData)
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
