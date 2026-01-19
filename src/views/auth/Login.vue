<template>

  <div class="login-container">

    <div class="login-content">

      <div class="login-header">

        <img src="@/assets/login/logo.png" alt="logo" class="login-logo" />

        <div class="login-title">高校毕业设计管理系统</div>

      </div>



      <el-form ref="formRef" :model="loginForm" :rules="loginRules" size="large">

        <el-form-item prop="username">

          <el-input

            v-model="loginForm.username"

            :prefix-icon="User"

            placeholder="用户名"

            autocomplete="off"

          />

        </el-form-item>



        <el-form-item prop="password">

          <el-input

            v-model="loginForm.password"

            :prefix-icon="Lock"

            type="password"

            placeholder="密码"

            show-password

            autocomplete="off"

          />

        </el-form-item>



        <el-form-item prop="captchaCode">

          <div class="captcha-group">

            <el-input

              v-model="loginForm.captchaCode"

              :prefix-icon="Key"

              placeholder="请输入验证码"

              maxlength="4"

              style="flex: 1; margin-right: 10px"

            />

            <div class="captcha-image" @click="getCaptcha">

              <img v-if="captchaImage" :src="captchaImage" alt="验证码" />

              <div v-else class="captcha-placeholder">加载中...</div>

            </div>

          </div>

        </el-form-item>



        <el-form-item>

          <el-button

            type="primary"

            size="large"

            :loading="loading"

            @click="handleLogin"

            style="width: 100%"

          >

            登录

          </el-button>

        </el-form-item>

      </el-form>



      <div class="login-footer">

        <p>© 2025 高校毕业设计管理系统</p>

      </div>

    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores'
import { MESSAGE } from '@/constants/user'
import type { FormInstance, FormRules } from 'element-plus'

interface LoginForm {
  username: string
  password: string
  captchaCode: string
  captchaKey: string
}

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()

const { loading, captchaImage, captchaKey, getCaptcha, login } = useAuth()

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  captchaCode: '',
  captchaKey: '',
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    await login(loginForm.username, loginForm.password, loginForm.captchaCode)

    ElMessage.success(MESSAGE.LOGIN_SUCCESS)
    router.push({ path: '/' })
  } catch (error: any) {
    console.error('登录失败:', error)
    let message = MESSAGE.OPERATION_FAILED
    if (error.message) {
      message = error.message
    } else if (error.response?.data?.message) {
      // 如果响应拦截器已处理，数据在data字段中
      message = error.response.data.message
    } else if (error.response?.message) {
      // 如果是原始错误响应
      message = error.response.message
    }
    ElMessage.error(message)
    getCaptcha() // 登录失败时刷新验证码
  }
}

onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
/* 使用 src/assets/styles/login.less 中的样式 */
</style>