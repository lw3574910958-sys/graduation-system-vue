<template>
  <div class="login-contaioner">
    <div class="login-contaioner-content">
      <div class="login-contaioner-content-bg">
        <div class="login-contaioner-content-top">
          <div>
            <div style="text-align: center; padding-bottom: 25px">
              <img src="@/assets/login/logo.png" alt="logo" class="login-logo" />
            </div>
            <div style="text-align: center; padding-bottom: 25px">
              <span class="login-title">MyApp Admin</span>
            </div>
          </div>

          <div class="login-contaioner-content-main">
            <el-form ref="formRef" :model="formData" :rules="rules" size="large">
              <el-form-item prop="userName" height="80px">
                <el-input
                  :prefix-icon="User"
                  v-model="formData.userName"
                  placeholder="用户名"
                  style="width: 368px; height: 40px"
                />
              </el-form-item>

              <el-form-item prop="userPwd" height="80px">
                <el-input
                  :prefix-icon="Lock"
                  v-model="formData.userPwd"
                  placeholder="密码"
                  show-password
                  type="password"
                  style="width: 368px; height: 40px"
                />
              </el-form-item>

              <el-form-item prop="captchaCode">
                <div style="display: flex; justify-items: center; align-items: flex-start">
                  <el-input
                    v-model="formData.captchaCode"
                    style="width: 268px; height: 40px; font-size: 16px"
                    placeholder="验证码"
                  />
                  <img :src="captchaImg" @click="getCaptcha()" />
                </div>
              </el-form-item>

              <el-form-item>
                <el-button
                  :loading="btnLoading"
                  @click="onSubmit()"
                  type="primary"
                  style="width: 368px; height: 40px; font-size: 16px"
                  >登录</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { captchaApi } from '@/api/captcha-api'
import { adminApi } from '@/api/admin-api'
import router from '@/router'

const captchaImg = ref('')
const formRef = ref()
const btnLoading = ref(false)

async function getCaptcha() {
  try {
    let captchaResult = await captchaApi.get()
    captchaImg.value = captchaResult.data.captchaImg
    formData.captchaId = captchaResult.data.captchaId
  } catch (e) {}
}

const formData = reactive({
  userName: undefined,
  userPwd: undefined,
  captchaId: undefined,
  captchaCode: undefined,
})

onMounted(() => {
  getCaptcha()
})

function onSubmit() {
  formRef.value.validate().then(async () => {
    try {
      btnLoading.value = true
      let result = await adminApi.login(formData)

      router.push('/index')
    } catch (e: any) {
      if (e.data && e.data.code != 200) {
        getCaptcha()
      }
    } finally {
      btnLoading.value = false
    }
  })
}

//表单校验规则
const rules = reactive({
  userName: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  userPwd: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
  ],
  captchaCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'blur',
    },
  ],
})
</script>

<style scoped lang="less">
@import '@/styles/login.less';
</style>
