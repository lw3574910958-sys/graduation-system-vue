<!-- 增强用户表单组件 -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="formData.username"
        placeholder="请输入用户名"
        clearable
      />
    </el-form-item>
    
    <el-form-item label="真实姓名" prop="realName">
      <el-input
        v-model="formData.realName"
        placeholder="请输入真实姓名"
        clearable
      />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        placeholder="请输入邮箱地址"
        clearable
      />
    </el-form-item>
    
    <el-form-item label="手机号" prop="phone">
      <el-input
        v-model="formData.phone"
        placeholder="请输入手机号"
        clearable
      />
    </el-form-item>
    
    <el-form-item label="用户类型" prop="userType">
      <el-select
        v-model="formData.userType"
        placeholder="请选择用户类型"
        clearable
      >
        <el-option
          v-for="type in userTypeOptions"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="所属部门" prop="departmentId">
      <el-select
        v-model="formData.departmentId"
        placeholder="请选择部门"
        clearable
      >
        <el-option
          v-for="dept in departmentOptions"
          :key="dept.id"
          :label="dept.name"
          :value="dept.id"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item>
      <el-button 
        type="primary" 
        :loading="submitLoading"
        @click="handleEnhancedSubmit"
      >
        {{ submitLoading ? '提交中...' : '提交' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button @click="handleValidateFields">验证特定字段</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  required, 
  email, 
  phone, 
  username,
  enhancedSubmit,
  validateFields,
  resetForm
} from '@/utils/formValidator'
import { departmentApi } from '@/api/department'
import type { UserCreateRequest } from '@/types/api/user'
import type { DepartmentResponse } from '@/types/api/department'

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<Partial<UserCreateRequest>>({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  userType: undefined,
  departmentId: undefined
})

// 表单验证规则
const formRules = reactive<FormRules>({
  username: username(),
  realName: [
    required('请输入真实姓名'),
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: email(),
  phone: phone(),
  userType: required('请选择用户类型'),
  departmentId: required('请选择所属部门')
})

// 提交状态
const submitLoading = ref(false)

// 用户类型选项
const userTypeOptions = [
  { value: 1, label: '学生' },
  { value: 2, label: '教师' },
  { value: 3, label: '管理员' }
]

// 部门选项
const departmentOptions = ref<DepartmentResponse[]>([])

// 获取部门数据
const loadDepartments = async () => {
  try {
    const response = await departmentApi.getAllDepartments()
    departmentOptions.value = response.data || []
  } catch (error) {
    console.error('获取部门数据失败:', error)
  }
}

// 增强的表单提交
const handleEnhancedSubmit = async () => {
  const success = await enhancedSubmit(
    formRef.value,
    async () => {
      submitLoading.value = true
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('提交的数据:', formData)
      // 这里应该调用真实的API
      // await userApi.createUser(formData)
    },
    {
      loadingMessage: '正在创建用户...',
      successMessage: '用户创建成功！',
      errorMessage: '用户创建失败，请重试',
      showSuccessToast: true,
      showErrorToast: true
    }
  )
  
  submitLoading.value = false
  return success
}

// 传统表单提交（对比用）
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('表单提交成功:', formData)
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 验证特定字段
const handleValidateFields = async () => {
  const fieldsToValidate = ['username', 'email']
  const isValid = await validateFields(formRef.value, fieldsToValidate)
  console.log('特定字段验证结果:', isValid)
}

// 重置表单
const handleReset = () => {
  resetForm(formRef.value)
}

// 组件挂载时加载数据
onMounted(() => {
  loadDepartments()
})

// 暴露方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => resetForm(formRef.value),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped>
.el-form {
  max-width: 600px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__inner) {
  transition: border-color 0.3s;
}

:deep(.el-input__inner:focus) {
  border-color: #409eff;
}
</style>