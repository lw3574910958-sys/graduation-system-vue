/** * 文件上传组件 */
<template>
  <div class="clearfix">
    <el-upload
      :file-list="fileList"
      :list-type="listType"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-change="handleChange"
      :class="{ disabled: maxLimit }"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      :auto-upload="true"
      multiple
    >
      <template v-if="listType === 'picture-card'">
        <div class="upload-text">
          <el-icon>
            <Plus />
          </el-icon>
          <div>{{ buttonText }}</div>
        </div>
      </template>
      <template v-if="listType === 'text'">
        <el-button link type="primary"> {{ buttonText }} </el-button>
      </template>
    </el-upload>
    <el-dialog :footer="null" v-model="previewVisible" @close="handleCancel">
      <img :src="previewUrl" alt="预览图片" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { commonApi } from '@/api/common'
import { getFileUrl } from '@/utils/utils'
import { MESSAGE } from '@/constants/user'

const props = defineProps({
  value: String,
  //按钮文字
  buttonText: {
    type: String,
    default: '点击上传附件',
  },
  //是否显示按钮
  showUploadBtn: {
    type: Boolean,
    default: true,
  },
  //默认文件列表
  defaultFileList: {
    type: Array,
    default: () => [],
  },
  //是否允许上传多文件
  multiple: {
    type: Boolean,
    default: false,
  },
  //允许上传文件数量
  maxUploadSize: {
    type: Number,
    default: 10,
  },
  //允许上传文件大小
  maxSize: {
    type: Number,
    default: 100,
  },
  //允许上传文件类型
  accept: {
    type: String,
    default: '',
  },
  //上传文件列表 "text" | "picture-card" | "picture"
  listType: {
    type: String,
    default: 'picture-card',
  },
  //是否为头像上传
  isAvatarUpload: {
    type: Boolean,
    default: false,
  },
})

// 允许上传的文件类型
const allowedFileTypes = computed(() => {
  if (props.accept) {
    return props.accept.split(',').map(ext => ext.trim().toLowerCase())
  }
  // 默认只允许图片格式
  return ['jpg', 'jpeg', 'png', 'gif']
})

// 监听上传状态
const uploadingCount = ref(0)
// 上传前检查
const beforeUpload = (file: File) => {
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`上传文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  // 检查文件类型
  const fileName = file.name.toLowerCase()
  const fileType = fileName.split('.').pop()
  
  // 如果accept属性未指定或指定了特定类型，则检查文件扩展名
  if (allowedFileTypes.value.length > 0 && !allowedFileTypes.value.some(type => fileName.endsWith(type))) {
    ElMessage.error(`仅支持 ${allowedFileTypes.value.join(', ')} 格式的文件！`)
    return false
  }

  return true
}

// 处理文件变化
const handleChange = (file: any, fileListParam: any[]) => {
  // Element Plus的el-upload组件管理文件列表，直接使用其提供的列表
  fileList.value = fileListParam
  // 在文件状态变化时也更新值
  updateValue()
}

// 处理文件移除
const handleRemove = (file: any, fileListParam: any[]) => {
  // 使用组件更新后的文件列表
  fileList.value = fileListParam
  updateValue()
}

// 更新值方法
const updateValue = () => {
  // 获取所有有效文件的URL
  const validUrls = fileList.value
    .filter((file) => file.url && !file.url.startsWith('blob:'))
    .map((file) => file.url)
  // 如果没有有效文件，返回空字符串
  const urls = validUrls.length > 0 ? validUrls.join(',') : ''
  emit('update:value', urls)
}
const emit = defineEmits(['update:value'])

const fileList = ref<any[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

// 是否达到最大上传限制
const maxLimit = computed(() => {
  return fileList.value.length >= props.maxUploadSize
})

// 清空上传
function clear() {
  fileList.value = []
}

// 处理图片预览
const handlePictureCardPreview = (file: { url: string }) => {
  previewUrl.value = file.url
  previewVisible.value = true
}

// 取消预览
const handleCancel = () => {
  previewVisible.value = false
}

// 处理上传
const handleUpload = async (options: { file: any, onError: Function, onSuccess: Function }) => {
  uploadingCount.value++
  const { file, onError, onSuccess } = options
  const formData = new FormData()
  formData.append('file', file)

  let loadingInstance: any = null

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '上传中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    const response: any = props.isAvatarUpload ? 
        await commonApi.uploadAvatar(formData) : 
        await commonApi.uploadFile(formData)

    loadingInstance.close()

    if (response && response.code === 200 && response.data) {
      // 在 fileList 中找到 uid 相同的文件项
      const existingFile = fileList.value.find((item) => item.uid === file.uid)
      if (existingFile) {
        existingFile.url = getFileUrl(response.data.url || response.data.name) // 更新为真实路径
        existingFile.status = 'success'
      }
      updateValue() // 触发父组件更新
      onSuccess(response)
      ElMessage.success(MESSAGE.UPLOAD_SUCCESS)
    } else {
      onError()
      ElMessage.error(response?.msg || response?.message || MESSAGE.UPLOAD_FAILED)
    }
  } catch (error: any) {
    if (loadingInstance) {
      loadingInstance.close()
    }
    onError(error)
    ElMessage.error(error?.msg || error?.message || MESSAGE.UPLOAD_FAILED)
  } finally {
    uploadingCount.value--
  }
}

defineExpose({
  clear,
  getValidFiles() {
    return fileList.value.filter((file) => file.url && !file.url.startsWith('blob:'))
  },
  isUploading: computed(() => uploadingCount.value > 0),
})

// 监听默认文件列表变化
watch(
  () => props.defaultFileList,
  (newVal) => {
    if (Array.isArray(newVal)) {
      fileList.value = newVal.map((item: any) => ({
        name: item.name || '',
        url: item.url || item,
      }))
    }
  },
  { immediate: true },
)

/* // 监听value变化
watch(
  () => props.value,
  (newVal) => {
    if (!newVal) {
      fileList.value = []
    }
  },
) */
</script>

<style scoped>
::v-deep(.disabled .el-upload--picture-card) {
  display: none;
}
</style>
