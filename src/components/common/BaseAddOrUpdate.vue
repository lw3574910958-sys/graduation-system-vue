<template>
  <el-dialog
    v-model="visible"
    :title="!formData.id ? dialogTitle.add : dialogTitle.edit"
    :width="dialogWidth"
  >
    <el-form :rules="formRules" :model="formData" ref="formRef" :label-width="labelWidth">
      <el-form-item
        v-for="(field, index) in formFields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
      >
        <!-- 特殊处理 FileUpload 组件 -->
        <template v-if="field.component === 'FileUpload'">
          <FileUpload
            :ref="`fileUpload_${index}`"
            v-model:value="formData[field.prop]"
            v-bind="field.props || {}"
            :components="dynamicComponents"
          />
        </template>
        <!-- 其他组件 -->
        <template v-else>
          <component
            :is="field.component || 'el-input'"
            v-model:model-value="formData[field.prop]"
            v-bind="field.props || {}"
            :readonly="field.readonly || (formData.id && field.readonlyWhenUpdate)"
            :components="dynamicComponents"
          >
            <template v-for="option in field.options || []" :key="option.value" #default>
              <component
                :is="field.optionComponent || 'el-option'"
                :label="option.label"
                :value="option.value"
              />
            </template>
          </component>
        </template>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="d-flex justify-end">
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
import FileUpload from '@/components/common/FileUpload.vue'
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
  // API 相关
  saveApi: (data: T) => Promise<any>
  updateApi?: (id: string, data: Partial<T>) => Promise<any>

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
  formRules: () => ({}),
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
const formData = ref<T>(structuredClone(props.formDefault))

// 计算属性：判断是否正在上传（如果有文件上传组件）
const isUploading = computed(() => {
  // 这里可以根据实际情况调整
  return false
})

// 显示对话框
function showModel(row?: Partial<T>) {
  console.log('🔍 showModel 接收到的 row:', row)
  if (row) {
    // 复制默认值
    formData.value = structuredClone(props.formDefault)
    console.log('🔍 复制默认值后的 formData:', formData.value)
    // 覆盖行数据
    Object.assign(formData.value, row)
    console.log('🔍 Object.assign 后的 formData:', formData.value)
  } else {
    // 使用默认值
    formData.value = structuredClone(props.formDefault)
  }
  visible.value = true
}

// 提交表单
async function onSubmit() {
  await formRef.value
    .validate()
    .then(async () => {
      try {
        btnLoading.value = true

        // 先处理文件上传（如果有 FileUpload 组件）
        const fileUploadFields: { prop: string; ref: any }[] = []
        props.formFields.forEach((field: FormField, index: number) => {
          if (field.component === 'FileUpload') {
            const fileUploadRef = (formRef.value as any)?.$refs[`fileUpload_${index}`]
            if (fileUploadRef && fileUploadRef[0]) {
              fileUploadFields.push({ prop: field.prop, ref: fileUploadRef[0] })
            }
          }
        })

        // 上传所有文件
        for (const fileUpload of fileUploadFields) {
          const uploadComponent = fileUpload.ref
          const files = uploadComponent.getValidFiles()
          
          // 如果有未上传的文件，执行上传
          if (files && files.length > 0) {
            for (const file of files) {
              if (!file.url || file.url.startsWith('blob:')) {
                // 手动触发上传
                await uploadComponent.handleUpload({
                  file: file.raw,
                  onError: () => {
                    throw new Error('文件上传失败')
                  },
                  onSuccess: (response: any) => {
                    if (response && response.data) {
                      file.url = response.data.url || response.data.name
                    }
                  }
                })
              }
            }
          }
        }

        // 调试：打印 formData
        console.log('🔍 提交表单数据:', formData.value)
        console.log('🔍 formData.id:', formData.value.id)

        if (formData.value.id) {
          // 更新操作
          if (props.updateApi) {
            // 只传递需要更新的字段（排除 ID）
            const { id, ...updateData } = formData.value
            console.log('🔍 更新操作 - ID:', formData.value.id)
            console.log('🔍 更新操作 - updateData:', updateData)
            await props.updateApi(formData.value.id, updateData)
          } else {
            ElMessage.warning('未提供更新 API')
            return
          }
        } else {
          // 新增操作
          console.log('🔍 新增操作 - formData:', formData.value)
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
    .catch(() => {
      // 表单验证失败，el-form 已显示错误提示
    })
}

// 取消按钮
function onCancel() {
  formRef.value?.clearValidate()
  // 清空所有 FileUpload 组件的文件列表
  props.formFields.forEach((field: FormField, index: number) => {
    if (field.component === 'FileUpload') {
      // 获取 FileUpload 组件实例并调用 clear 方法
      const fileUploadRef = (formRef.value as any)?.$refs[`fileUpload_${index}`]
      if (fileUploadRef && fileUploadRef[0]) {
        fileUploadRef[0].clear()
      }
      // 重置该字段的值为空
      formData.value[field.prop as keyof T] = '' as unknown as T[keyof T]
    }
  })
  // 重置表单数据为默认值
  formData.value = structuredClone(props.formDefault)
  visible.value = false
}

// 注册动态组件
const dynamicComponents = {
  FileUpload,
}

// 暴露方法给父组件
defineExpose({
  showModel,
  onCancel,
})
</script>

<style scoped></style>
