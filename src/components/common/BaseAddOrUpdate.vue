<template>
  <el-dialog
    v-model="visible"
    :title="!formData.id ? dialogTitle.add : dialogTitle.edit"
    :width="dialogWidth"
  >
    <el-form :rules="formRules" :model="formData" ref="formRef" :label-width="labelWidth">
      <el-form-item
        v-for="field in formFields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
      >
        <component
          :is="field.component || 'el-input'"
          v-model:model-value="formData[field.prop]"
          v-bind="field.props || {}"
          :readonly="field.readonly || (formData.id && field.readonlyWhenUpdate)"
        >
          <template v-for="option in field.options || []" :key="option.value" #default>
            <component
              :is="field.optionComponent || 'el-option'"
              :label="option.label"
              :value="option.value"
            />
          </template>
        </component>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button
          type="primary"
          @click="onSubmit()"
          :loading="btnLoading || isUploading"
          :disabled="isUploading"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" generic="T = any">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'

// 表单项类型定义
interface FormField {
  prop: string
  label: string
  component?: string
  props?: Record<string, any>
  options?: Array<{ label: string; value: any }>
  optionComponent?: string
  readonly?: boolean
  readonlyWhenUpdate?: boolean // 更新时只读
}

// 对话框标题配置
interface DialogTitle {
  add: string
  edit: string
}

// 组件属性
interface Props {
  // API相关
  saveApi: (data: T) => Promise<any>
  updateApi?: (id: number | string, data: Partial<T>) => Promise<any>
  
  // 表单配置
  formFields: FormField[]
  formDefault: T
  dialogTitle: DialogTitle
  dialogWidth?: string
  labelWidth?: string
  
  // 验证规则
  formRules?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  dialogWidth: '40%',
  labelWidth: '100px',
  formRules: () => ({})
})

// 定义事件
const emit = defineEmits<{
  refreshList: []
}>()

// 响应式数据
const visible = ref(false)
const btnLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = ref<T>(JSON.parse(JSON.stringify(props.formDefault)))

// 计算属性：判断是否正在上传（如果有文件上传组件）
const isUploading = computed(() => {
  // 这里可以根据实际情况调整
  return false
})

// 显示对话框
function showModel(row?: Partial<T>) {
  if (row) {
    // 复制默认值
    Object.assign(formData.value, JSON.parse(JSON.stringify(props.formDefault)))
    // 覆盖行数据
    Object.assign(formData.value, row)
  } else {
    // 使用默认值
    Object.assign(formData.value, JSON.parse(JSON.stringify(props.formDefault)))
  }
  visible.value = true
}

// 提交表单
async function onSubmit() {
  await formRef.value.validate()
    .then(async () => {
      try {
        btnLoading.value = true
        
        if (formData.value.id) {
          // 更新操作
          if (props.updateApi) {
            // 只传递需要更新的字段（排除ID）
            const { id, ...updateData } = formData.value
            await props.updateApi(formData.value.id, updateData)
          } else {
            ElMessage.warning('未提供更新API')
            return
          }
        } else {
          // 新增操作
          await props.saveApi(formData.value)
        }
        
        ElMessage.success(`${!formData.value.id ? '新增' : '修改'}成功`)
        visible.value = false
        emit('refreshList')
      } catch (e: any) {
        console.error('提交表单失败:', e)
        ElMessage.error(MESSAGE.SUBMIT_FAILED)
      } finally {
        btnLoading.value = false
      }
    })
    .catch((err: any) => {
      console.log('表单验证失败:', err)
    })
}

// 取消按钮
function onCancel() {
  formRef.value?.clearValidate()
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  showModel,
  onCancel
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>