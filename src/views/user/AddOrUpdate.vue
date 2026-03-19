<template>
  <base-add-or-update
    :save-api="createUser"
    :update-api="updateUser"
    :form-fields="formFields"
    :form-default="formDefault"
    :dialog-title="dialogTitle"
    :form-rules="formRules"
    dialog-width="700px"
    label-width="100px"
    @refresh-list="emit('refreshList')"
    ref="baseRef"
  >
  </base-add-or-update>
</template>

<script lang="ts" setup name="UserAddOrUpdate">
import { reactive, ref, onMounted } from 'vue'
import { userApi } from '@/api/user'
import { departmentApi } from '@/api/department'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseAddOrUpdate from '@/components/common/BaseAddOrUpdate.vue'
import type { DepartmentResponse } from '@/types/api/department'

// 定义事件
const emit = defineEmits(['refreshList'])

// 基础组件引用
const baseRef = ref()

// 院系选项
const departmentOptions = ref<DepartmentResponse[]>([])

// 加载院系数据
const loadDepartments = async () => {
  try {
    const response = await departmentApi.getAllDepartments()
    console.log('获取院系数据响应:', response)
    departmentOptions.value = response.data || []
    console.log('院系选项:', departmentOptions.value)
  } catch (error) {
    console.error('获取院系数据失败:', error)
  }
}

// 表单字段配置
const formFields = [
  {
    prop: 'username',
    label: '用户名',
    component: 'el-input',
    props: { style: { width: '100%' }, readonlyWhenUpdate: true, placeholder: '4-20 位字母、数字或下划线' },
  },
  {
    prop: 'realName',
    label: '真实姓名',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入真实姓名' },
  },
  {
    prop: 'userType',
    label: '用户类型',
    component: 'el-select',
    props: { placeholder: '请选择用户类型', style: { width: '100%' } },
    disabledWhenUpdate: true, // 编辑时禁用用户类型字段，防止数据多变
    options: [
      { label: '学生', value: 'student' },
      { label: '教师', value: 'teacher' },
      { label: '系统管理员', value: 'system_admin' },
      { label: '院系管理员', value: 'department_admin' },
    ],
  },
  // 学号/工号/管理员编号 (根据用户类型动态显示)
  {
    prop: 'studentId',
    label: '学号',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入学号' },
    showWhen: (formData: any) => formData.userType === 'student',
  },
  {
    prop: 'teacherId',
    label: '工号',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入工号' },
    showWhen: (formData: any) => formData.userType === 'teacher',
  },
  {
    prop: 'adminId',
    label: '管理员编号',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入管理员编号' },
    showWhen: (formData: any) => formData.userType === 'system_admin' || formData.userType === 'department_admin',
  },
  // 性别字段 (学生和教师需要)
  {
    prop: 'gender',
    label: '性别',
    component: 'el-select',
    props: { placeholder: '请选择性别', style: { width: '100%' } },
    options: [
      { label: '男', value: 1 },
      { label: '女', value: 0 },
    ],
    showWhen: (formData: any) => formData.userType === 'student' || formData.userType === 'teacher',
  },
  // 专业字段 (仅学生需要)
  {
    prop: 'major',
    label: '专业',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入专业名称' },
    showWhen: (formData: any) => formData.userType === 'student',
    optional: true,
  },
  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    props: { placeholder: '请选择状态', style: { width: '100%' } },
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
  // 院系字段 (所有类型都需要，但管理员可选)
  {
    prop: 'departmentId',
    label: '所属院系',
    component: 'el-select',
    props: { 
      placeholder: '请选择院系', 
      style: { width: '100%' },
      clearable: true, // 允许清空
    },
    // 系统管理员不显示所属院系字段
    showWhen: (formData: any) => formData.userType !== 'system_admin',
    // 使用函数动态获取选项，确保每次渲染时都能获取最新数据
    options: () => [
      { label: '无', value: 0 }, // 添加"无"选项
      ...departmentOptions.value.map(dept => ({ label: dept.name, value: dept.id })),
    ],
  },
  // 学生特有字段：班级
  {
    prop: 'className',
    label: '班级',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入班级' },
    showWhen: (formData: any) => formData.userType === 'student',
    optional: true,
  },
  // 教师特有字段：职称
  {
    prop: 'title',
    label: '职称',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入职称（如教授、副教授等）' },
    showWhen: (formData: any) => formData.userType === 'teacher',
    optional: true,
  },
  {
    prop: 'phone',
    label: '手机号',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入手机号' },
  },
  {
    prop: 'email',
    label: '邮箱',
    component: 'el-input',
    props: { style: { width: '100%' }, placeholder: '请输入邮箱地址' },
  },
  {
    prop: 'password',
    label: '密码',
    component: 'PasswordWithGenerator', // 使用带生成器的密码输入组件
    props: { 
      type: 'password', 
      style: { width: '100%' }, 
      placeholder: '至少包含字母和数字，长度≥6 位', 
      showPassword: true 
    },
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
  studentId?: string   // 学号 (学生特有)
  teacherId?: string   // 工号 (教师特有)
  adminId?: string     // 管理员编号 (管理员特有)
  gender?: number      // 性别 (学生/教师)
  major?: string       // 专业 (学生)
  className?: string   // 班级 (学生)
  title?: string       // 职称 (教师)
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
  studentId: undefined,
  teacherId: undefined,
  adminId: undefined,
  gender: undefined,
  major: undefined,
  className: undefined,
  title: undefined,
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
        const validTypes = ['student', 'teacher', 'system_admin', 'department_admin'];
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
      validator: (rule: any, value: any, callback: (error?: Error | undefined) => void) => {
        if (!isEditMode) {
          // 创建用户时：必填
          if (!value || value.trim() === '') {
            callback(new Error('请输入密码'));
          } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(value)) {
            callback(new Error('密码必须至少包含一个字母和一个数字，长度至少为 6 位'));
          } else {
            callback();
          }
        } else {
          // 编辑用户时：可选
          if (value && value.trim() !== '') {
            if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(value)) {
              callback(new Error('密码必须至少包含一个字母和一个数字，长度至少为 6 位'));
            } else {
              callback();
            }
          } else {
            // 不填写密码也可以
            callback();
          }
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
  departmentId: [
    {
      required: true,
      message: '请选择所属院系',
      trigger: 'blur',
    },
  ],
  roleLevel: [
    {
      required: false,  // 可选，根据用户类型决定是否显示
      message: '请选择角色级别',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: false,
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  email: [
    {
      required: false,
      type: 'email',
      message: '请输入正确的邮箱格式',
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
    email: data.email,
    phone: data.phone,
    departmentId: data.departmentId,
    avatar: data.avatar,
    // 学生特有字段
    studentId: data.studentId,
    gender: data.gender,
    major: data.major,
    className: data.className,
    // 教师特有字段
    teacherId: data.teacherId,
    title: data.title,
    // 管理员特有字段
    adminId: data.adminId,
  }
  return userApi.createUser(requestData)
}
const updateUser = (id: string | number, data: Partial<UserUpdateRequest>) => {
  // 构建更新数据，如果密码为空则不传递
  const updateData: Partial<UserUpdateRequest> = {}
  if (data.realName) updateData.realName = data.realName
  if (data.userType) updateData.userType = data.userType
  if (data.password) updateData.password = data.password  // 只有填写了密码才传递
  if (data.status !== undefined) updateData.status = data.status
  if (data.departmentId !== undefined) updateData.departmentId = data.departmentId
  if (data.avatar !== undefined) updateData.avatar = data.avatar
  // 学生特有字段
  if (data.studentId !== undefined) updateData.studentId = data.studentId
  if (data.gender !== undefined) updateData.gender = data.gender
  if (data.major !== undefined) updateData.major = data.major
  if (data.className !== undefined) updateData.className = data.className
  // 教师特有字段
  if (data.teacherId !== undefined) updateData.teacherId = data.teacherId
  if (data.title !== undefined) updateData.title = data.title
  // 管理员特有字段
  if (data.adminId !== undefined) updateData.adminId = data.adminId
  
  // 将 id 转换为 string 类型，确保与 userApi.updateUser 的类型一致
  return userApi.updateUser(String(id), updateData)
}

// 暴露方法给父组件调用
defineExpose({
  showModel,
  onCancel,
})

// 标记当前是否为编辑模式
let isEditMode = false

// 包装 showModel 方法
async function showModel(row?: Record<string, any>) {
  // 判断是否为编辑模式
  isEditMode = !!row?.id
  
  // 如果是编辑模式，先获取用户详情数据
  if (isEditMode && row?.id) {
    try {
      // 调用 API 获取用户详情
      const response = await userApi.getUserByUserId(row.id)
      // 将详情数据传递给 BaseAddOrUpdate - 注意要取 response.data
      baseRef.value?.showModel(response.data)
    } catch (error) {
      console.error('获取用户详情失败:', error)
      ElMessage.error('获取用户详情失败')
    }
  } else {
    // 新增模式，直接使用传入的数据
    baseRef.value?.showModel(row)
  }
}

// 包装 onCancel 方法
function onCancel() {
  baseRef.value?.onCancel()
}

// 组件挂载时加载院系数据
onMounted(() => {
  loadDepartments()
})
</script>
