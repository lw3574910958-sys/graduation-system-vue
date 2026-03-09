<template>
  <div class="password-with-generator">
    <el-input
      ref="inputRef"
      v-model="inputValue"
      :type="showPassword ? 'password' : 'text'"
      :placeholder="placeholder"
      :show-password="showPassword"
      :readonly="readonly"
      :disabled="disabled"
    >
      <template #suffix>
        <el-tooltip content="生成随机密码" placement="top">
          <el-button 
            @click="handleGenerate" 
            type="primary"
            :disabled="disabled"
            :icon="Refresh"
            size="small"
            circle
          />
        </el-tooltip>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts" name="PasswordWithGenerator">
import { ref, watch } from 'vue'
import { generateRandomPassword } from '@/utils/passwordGenerator'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 定义属性
interface Props {
  modelValue?: string
  placeholder?: string
  showPassword?: boolean
  readonly?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入密码',
  showPassword: true,
  readonly: false,
  disabled: false
})

// 定义内部输入值
const inputValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newVal: string) => {
  inputValue.value = newVal
})

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 监听内部值变化并通知父组件
watch(inputValue, (newVal: string) => {
  emit('update:modelValue', newVal)
})

// 生成随机密码
const handleGenerate = () => {
  const newPassword = generateRandomPassword({
    length: 10,      // 默认生成 10 位密码
    includeSpecial: true  // 包含特殊字符
  })
  
  // 触发更新事件
  emit('update:modelValue', newPassword)
  
  // 显示成功提示
  ElMessage.success('已生成随机密码')
}
</script>

<style scoped>
.password-with-generator {
  width: 100%;
}

/* 输入框样式 */
.password-with-generator :deep(.el-input) {
  width: 100%;
}

/* 优化输入框高度 */
.password-with-generator :deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
}

/* 后缀按钮样式 */
.password-with-generator :deep(.el-input__suffix) {
  right: 8px;
}

.password-with-generator :deep(.el-input__suffix .el-button) {
  padding: 6px;
  width: 28px;
  height: 28px;
}

.password-with-generator :deep(.el-input__suffix .el-button .el-icon) {
  font-size: 14px;
}
</style>
