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
import { uploadFileApi } from '@/api/uploadFile-api'

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
})

// 图片类型后缀名
const imgFileType = ['jpg', 'jpeg', 'png', 'gif']

// 上传前检查
const beforeUpload = (file: any) => {
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`上传文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  // 检查文件类型
  const fileName = file.name.toLowerCase()
  const fileType = fileName.split('.').pop()
  if (!imgFileType.includes(fileType)) {
    ElMessage.error('仅支持 jpg、jpeg、png、gif 格式的图片！')
    return false
  }

  return true
}

// 处理文件变化
const handleChange = (file: any, fileListParam: any) => {
  fileList.value = fileListParam
}

// 处理文件移除
const handleRemove = (file: any, fileListParam: any) => {
  fileList.value = fileListParam
  updateValue()
}

// 更新值方法
const updateValue = () => {
  const urls = fileList.value
    .filter((file) => file.url && !file.url.startsWith('blob:'))
    .map((file) => file.url)
    .join(',')
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
const handlePictureCardPreview = (file: any) => {
  previewUrl.value = file.url
  previewVisible.value = true
}

// 取消预览
const handleCancel = () => {
  previewVisible.value = false
}

// 处理上传
const handleUpload = async (options: any) => {
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

    const response: any = await uploadFileApi.uploadFile(formData)

    loadingInstance.close()

    // 检查响应数据结构
    if (response && response.code === 200 && response.data) {
      // 使用后端返回的真实URL，而不是使用file.raw等本地URL
      const newFile = {
        uid: file.uid,
        name: file.name,
        url: response.data.name, // 使用相对路径
        status: 'success',
      }
      fileList.value.push(newFile)
      updateValue()
      onSuccess(response)
      ElMessage.success('上传成功')
    } else {
      onError()
      ElMessage.error(response?.msg || response?.message || '上传失败')
    }
  } catch (error: any) {
    if (loadingInstance) {
      loadingInstance.close()
    }
    onError(error)
    ElMessage.error(error?.msg || error?.message || '上传失败')
  }
}

defineExpose({
  clear,
  getValidFiles() {
    return fileList.value.filter((file) => file.url && !file.url.startsWith('blob:'))
  },
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

// 监听value变化
watch(
  () => props.value,
  (newVal) => {
    if (!newVal) {
      fileList.value = []
    }
  },
)
</script>

<style scoped>
::v-deep(.disabled .el-upload--picture-card) {
  display: none;
}
</style>
