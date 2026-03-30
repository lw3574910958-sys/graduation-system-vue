<template>
  <el-dialog
    v-model="visible"
    :title="!formData.id ? dialogTitle.add : dialogTitle.edit"
    :width="dialogWidth"
  >
    <el-form :rules="formRules" :model="formData" ref="formRef" :label-width="labelWidth">
      <div class="form-grid">
        <el-form-item
          v-for="(field, index) in formFields"
          :key="field.prop"
          :label="field.label"
          :prop="field.prop"
          v-show="shouldShowField(field)"
          :required="isFieldRequired(field)"
          :class="{ 
            'full-width': field.component === 'FileUpload',
            'field-full-width': field.fullWidth 
          }"
          :style="field.style || {}"
        >
          <!-- 特殊处理 FileUpload 组件 -->
          <template v-if="field.component === 'FileUpload'">
            <FileUpload
              :ref="`fileUpload_${index}`"
              v-model:value="formData[field.prop]"
              v-bind="field.props || {}"
              :default-file-list="getFileList(field.prop)"
              :components="dynamicComponents"
            />
          </template>
          <!-- 特殊处理 PasswordWithGenerator 组件 -->
          <template v-else-if="field.component === 'PasswordWithGenerator'">
            <PasswordWithGenerator
              v-model="formData[field.prop]"
              v-bind="field.props || {}"
            />
          </template>
          <!-- 其他组件 -->
          <template v-else>
            <!-- 特殊处理 el-select 组件，单独绑定 change 事件 -->
            <template v-if="field.component === 'el-select'">
              <el-select
                v-model:model-value="formData[field.prop]"
                v-bind="field.props || {}"
                :readonly="field.readonly || (formData.id && field.readonlyWhenUpdate)"
                :disabled="field.disabled || (formData.id && field.disabledWhenUpdate)"
                @change="field.props?.onChange ? field.props.onChange(formData[field.prop]) : null"
              >
                <el-option
                  v-for="option in (typeof field.options === 'function' ? field.options() : field.options)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </template>
            <!-- 特殊处理 el-radio-group 组件 -->
            <template v-else-if="field.component === 'el-radio-group'">
              <el-radio-group
                v-model="formData[field.prop]"
                v-bind="field.props || {}"
                :readonly="field.readonly || (formData.id && field.readonlyWhenUpdate)"
                :disabled="field.disabled || (formData.id && field.disabledWhenUpdate)"
              >
                <el-radio
                  v-for="option in (typeof field.options === 'function' ? field.options() : field.options)"
                  :key="option.value"
                  :label="option.value"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>
            </template>
            <!-- 其他组件 -->
            <template v-else>
              <component
                :is="field.component || 'el-input'"
                v-model:model-value="formData[field.prop]"
                v-bind="field.props || {}"
                :readonly="field.readonly || (formData.id && field.readonlyWhenUpdate)"
                :disabled="field.disabled || (formData.id && field.disabledWhenUpdate)"
                :components="dynamicComponents"
              >
                <!-- 特殊处理 el-select 的选项 -->
                <template v-if="field.component === 'el-select' && field.options">
                  <el-option
                    v-for="option in (typeof field.options === 'function' ? field.options() : field.options)"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </template>
              </component>
            </template>
          </template>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="d-flex justify-end">
        <!-- 自定义按钮插槽 -->
        <template v-if="slots.buttons">
          <slot name="buttons" :loading="btnLoading || isUploading"></slot>
        </template>
        <!-- 默认按钮（没有自定义按钮时显示） -->
        <template v-else>
          <el-button @click="onCancel()">取消</el-button>
          <el-button
            type="primary"
            @click="onSubmit()"
            :loading="btnLoading || isUploading"
            :disabled="isUploading"
          >
            确定
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" generic="T = any" name="BaseAddOrUpdate">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import FileUpload from '@/components/common/FileUpload.vue'
import PasswordWithGenerator from '@/components/common/PasswordWithGenerator.vue'
import { MESSAGE } from '@/constants/user'
import { urls2FileList } from '@/utils/utils'

// 表单项类型定义
interface FormField {
  prop: string
  label: string
  component?: string
  props?: Record<string, any>
  options?: Array<{ label: string; value: any }> | (() => Array<{ label: string; value: any }>)
  optionComponent?: string
  readonly?: boolean
  readonlyWhenUpdate?: boolean // 更新时只读
  disabled?: boolean
  disabledWhenUpdate?: boolean // 更新时禁用
  showWhen?: (formData: T) => boolean // 条件显示字段
  vIf?: boolean // 条件显示字段（借鉴 BaseList）
  required?: boolean | ((formData: T) => boolean) // 是否必填，支持函数
  style?: Record<string, any> // 自定义样式
  fullWidth?: boolean // 是否独占一行
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
  updateApi?: (id: string, data: T) => Promise<any>

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

// 定义插槽类型
interface Slots {
  buttons: (props: { loading: boolean }) => any
}

// ✅ 使用 defineSlots 定义插槽（Vue 3.3+）
const slots = defineSlots<Slots>()

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

// ✅ 借鉴 my-admin：获取文件列表用于传递给 FileUpload 组件
const getFileList = (prop: string) => {
  const fieldValue = formData.value[prop as keyof T]
  if (fieldValue && typeof fieldValue === 'string') {
    return urls2FileList(fieldValue)
  }
  return []
}

// ✅ 判断字段是否应该显示
const shouldShowField = (field: FormField): boolean => {
  // 如果配置了 vIf，优先检查 vIf 条件
  if ('vIf' in field && typeof field.vIf === 'boolean') {
    return field.vIf
  }
  
  // 如果没有配置 showWhen，默认显示
  if (!field.showWhen) {
    return true
  }
  
  // 调用 showWhen 函数判断是否显示
  return field.showWhen(formData.value)
}

// ✅ 判断字段是否必填
const isFieldRequired = (field: FormField): boolean => {
  // 如果没有配置 required，默认不显示必填标记
  if (field.required === undefined) {
    return false
  }
  // 如果是函数，调用函数判断
  if (typeof field.required === 'function') {
    return field.required(formData.value)
  }
  // 如果是布尔值，直接返回
  return field.required
}

// 显示对话框
function showModel(row?: Partial<T>) {
  // 重置表单数据为默认值
  formData.value = structuredClone(props.formDefault)
  
  if (row) {
    // 只覆盖非 undefined 的字段，避免覆盖默认值
    Object.keys(row).forEach(key => {
      const typedKey = key as keyof T
      if (row[typedKey] !== undefined) {
        formData.value[typedKey] = row[typedKey]!
      }
    })
  }
  
  // 确保在下一帧再显示对话框，让 Vue 有足够的时间响应式更新
  nextTick(() => {
    visible.value = true
  })
}

// 提交表单
async function onSubmit() {
  await formRef.value
    .validate()
    .then(async () => {
      try {
        btnLoading.value = true

        // ✅ 关键：由于启用了 autoUpload，文件在选择后已自动上传
        // 这里只需要确保 formData 中的值是正确的即可
        // 文件上传组件的 updateValue 会自动更新 formData 中的对应字段

        if (formData.value.id) {
          // 更新操作
          if (props.updateApi) {
            // 只传递需要更新的字段（排除 ID）
            const { id, ...updateData } = formData.value
            await props.updateApi(formData.value.id, updateData)
          } else {
            ElMessage.warning('未提供更新 API')
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
        ElMessage.error(e?.message || MESSAGE.SUBMIT_FAILED)
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
  PasswordWithGenerator,
}

// 暴露方法给父组件
defineExpose({
  showModel,
  onCancel,
  // 暴露表单数据和方法供自定义按钮使用
  formData,
  formRef,
  closeDialog,
})

// 关闭对话框
function closeDialog() {
  visible.value = false
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列等宽布局 */
  gap: 16px 24px; /* 行间距 16px，列间距 24px */
  padding: 0 12px; /* 添加左右内边距，使两侧边距与中间 gap 视觉一致 */
}

/* 头像字段独占一行 */
.form-grid .full-width {
  grid-column: 1 / -1; /* 跨越所有列 */
  margin-top: 8px; /* 上方间距减小 */
}

/* 自定义独占一行标记 */
.form-grid .field-full-width {
  grid-column: 1 / -1; /* 跨越所有列 */
}

/* 优化表单项底部间距 */
.form-grid .el-form-item {
  margin-bottom: 0; /* 移除默认底部间距 */
}

/* 响应式：小屏幕时变为单列 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; /* 单列布局 */
    gap: 16px; /* 统一间距 */
  }
}
</style>
