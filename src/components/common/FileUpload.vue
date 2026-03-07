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
      :auto-upload="autoUpload"
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
  // 是否为头像上传
  isAvatarUpload: {
    type: Boolean,
    default: false,
  },
  // 是否自动上传
  autoUpload: {
    type: Boolean,
    default: true,
  },
})

// 允许上传的文件类型
const allowedFileTypes = computed(() => {
  if (props.accept) {
    return props.accept.split(',').map((ext) => ext.trim().toLowerCase())
  }
  // 默认只允许图片格式
  return ['jpg', 'jpeg', 'png', 'gif']
})

// 检查文件类型是否允许
const isFileTypeAllowed = (file: File): boolean => {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase() // 获取文件的 MIME 类型
  
  // 如果 accept 是 image/*，检查是否为图片类型
  if (props.accept === 'image/*') {
    return fileType.startsWith('image/')
  }
  
  // 如果 accept 包含多个类型（如 image/*, .pdf 等）
  if (props.accept && props.accept.includes('image/*')) {
    return fileType.startsWith('image/')
  }
  
  // 否则检查文件扩展名
  const allowedTypes = allowedFileTypes.value
  if (allowedTypes.length > 0) {
    return allowedTypes.some((type) => 
      fileName.endsWith(type) || 
      (type.startsWith('.') && fileName.endsWith(type))
    )
  }
  
  return true
}

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
  if (!isFileTypeAllowed(file)) {
    ElMessage.error(`仅支持 ${props.accept || '图片'} 格式的文件！`)
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

// ✅ 借鉴 my-admin：监听 defaultFileList 而不是 value
// 这样可以避免上传成功后 updateValue() 触发 watch 导致重复
watch(
  () => props.defaultFileList,
  (newVal) => {
    if (Array.isArray(newVal)) {
      fileList.value = newVal.map((item: any) => ({
        name: item.name || '',
        url: item.url || item,
        status: item.status || 'success',
      }))
    }
  },
  { immediate: true },
)

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
const handleUpload = async (options: { file: any; onError: Function; onSuccess: Function }) => {
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

    // 根据是否为头像上传选择不同的 API
    const response: any = props.isAvatarUpload
      ? await commonApi.uploadAvatar(formData)
      : await commonApi.uploadFile(formData)

    loadingInstance.close()

    if (response && response.code === 200 && response.data) {
      // 在 fileList 中找到 uid 相同的文件项
      const existingFile = fileList.value.find((item) => item.uid === file.uid)
      if (existingFile) {
        // ✅ 关键修复：使用响应数据中的完整 URL，而不是相对路径
        // 这样 updateValue() emit 的也是完整 URL，避免 urls2FileList 重复拼接
        const fileUrl = response.data.url || response.data.storedPath || response.data.name
        existingFile.url = fileUrl
        existingFile.status = 'success'
        existingFile.response = response // 保存完整响应以便后续使用
      }
      updateValue() // 触发父组件更新
      onSuccess(response)
      ElMessage.success(MESSAGE.UPLOAD_SUCCESS)
    } else {
      // 服务器返回失败信息
      onError()
      const errorMsg = response?.msg || response?.message || MESSAGE.UPLOAD_FAILED
      ElMessage.error(errorMsg)
      throw new Error(errorMsg)
    }
  } catch (error: any) {
    if (loadingInstance) {
      loadingInstance.close()
    }
    
    // 详细的错误处理
    let errorMessage: string = MESSAGE.UPLOAD_FAILED
    if (error?.response?.status === 401) {
      errorMessage = '未授权访问，请重新登录'
    } else if (error?.response?.status === 403) {
      errorMessage = '没有权限上传文件'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    onError(error)
    console.error('文件上传失败:', error)
    ElMessage.error(errorMessage)
    throw error // 重新抛出错误以便调用方处理
  } finally {
    uploadingCount.value--
  }
}

defineExpose({
  clear,
  handleUpload, // 暴露手动上传方法
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
