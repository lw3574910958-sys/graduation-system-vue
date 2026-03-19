<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="formData.oldPassword"
          type="password"
          show-password
          placeholder="请输入旧密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <PasswordWithGenerator
          v-model="formData.newPassword"
          placeholder="至少包含字母和数字，长度≥6 位"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { userApi } from '@/api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PasswordWithGenerator from '@/components/common/PasswordWithGenerator.vue'

interface Emits {
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 对话框可见性
const visible = ref(false)

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证规则
const formRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, 
      message: '密码必须至少包含一个字母和一个数字，长度至少为 6 位', 
      trigger: 'blur' 
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 显示对话框
const showDialog = () => {
  visible.value = true
  // 重置表单
  formData.oldPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
  formRef.value?.clearValidate()
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userApi.changeOwnPassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })
      ElMessage.success('密码修改成功')
      visible.value = false
      emit('success')
    } catch (error: any) {
      console.error('修改密码失败:', error)
      ElMessage.error(error?.message || '修改密码失败')
    } finally {
      loading.value = false
    }
  })
}

// 关闭对话框后的清理
const handleClosed = () => {
  formRef.value?.clearValidate()
}

// 暴露方法给父组件
defineExpose({
  showDialog,
})
</script>
