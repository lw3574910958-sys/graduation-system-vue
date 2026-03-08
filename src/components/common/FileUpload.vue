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
import constants from '@/utils/constants'

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
  // Element Plus 的 el-upload 组件管理文件列表，直接使用其提供的列表
  // ✅ 关键：使用 splice 更新而不是直接赋值，保持响应式引用
  // ✅ 修复：保留已上传成功文件的 url，避免被 blob 覆盖
  const uploadedFiles = fileList.value.filter((item) => item.response && item.response.code === 200)
  
  // 过滤掉未上传的文件（这些会在 fileListParam 中）
  const newFiles = fileListParam.filter((paramFile) => 
    !paramFile.response || paramFile.response.code !== 200
  )
  
  // 合并已上传文件和新文件
  const allFiles = [...uploadedFiles, ...newFiles]
  fileList.value.splice(0, fileList.value.length, ...allFiles)
  
  // 在文件状态变化时也更新值
  updateValue()
}

// 处理文件移除
const handleRemove = (file: any, fileListParam: any[]) => {
  // 使用组件更新后的文件列表
  // ✅ 同样使用 splice 更新而不是直接替换
  fileList.value.splice(0, fileList.value.length, ...fileListParam)
  updateValue()
}

// 更新值方法 - 只返回相对路径给父组件
const updateValue = () => {
  // 获取所有有效文件的 URL
  const validFiles = fileList.value.filter((file) => file.url && !file.url.startsWith('blob:'))
  
  // 提取相对路径（去掉 BASE_URL 和 /files 前缀）
  const relativePaths = validFiles.map((file) => {
    let url = file.url
    
    // ✅ 修复：处理多种 URL 格式
    // 情况 1：完整 URL（包含 BASE_URL）
    if (url.startsWith(constants.BASE_URL)) {
      // 去掉 BASE_URL
      url = url.replace(constants.BASE_URL, '')
    }
    
    // 情况 2：以 /files 开头（可能是 /files/... 或 /files/...
    if (url.startsWith('/files')) {
      if (url.startsWith('/files/')) {
        url = url.substring(7) // '/files/'.length = 7
      } else {
        url = url.substring(6) // '/files'.length = 6
      }
    }
    
    return url
  })
  
  // ✅ 关键修复：根据场景返回合适的值
  // 1. 有有效文件：返回文件路径（多个文件用逗号分隔）
  // 2. 没有文件但有原值（编辑场景）：保留原值
  // 3. 没有文件且没有原值（新增场景）：返回空字符串
  const urls = relativePaths.length > 0 
    ? relativePaths.join(',') 
    : (props.value ? props.value : '')
  
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
      // ✅ 关键修复：确保 fileList 中有这个文件
      let existingFile = fileList.value.find((item) => item.uid === file.uid)
      
      // 如果找不到（可能是因为 el-upload 还没更新 fileList），创建新文件项
      if (!existingFile) {
        existingFile = {
          uid: file.uid,
          name: file.name || 'avatar',
          status: 'success',
        }
        // 添加到 fileList
        fileList.value.push(existingFile)
      }
      
      // 使用响应数据中的存储路径（相对路径）更新文件
      const fileUrl = response.data.url || response.data.storedPath || response.data.name
      existingFile.url = fileUrl
      existingFile.status = 'success'
      existingFile.response = response // 保存完整响应以便后续使用
      
      // ✅ 关键：立即触发 updateValue，确保父组件 formData 更新
      updateValue()
      
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
