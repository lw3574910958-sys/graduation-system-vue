<template>
  <el-dialog
    v-model="visible"
    :title="fileInfo.filename"
    width="80%"
    :before-close="handleClose"
    class="file-preview-dialog"
  >
    <div class="preview-container">
      <!-- PDF文件预览 -->
      <div v-if="isPDF" class="pdf-preview">
        <iframe 
          :src="fileUrl" 
          width="100%" 
          height="600px" 
          frameborder="0"
          v-show="loaded"
        ></iframe>
        <div v-if="!loaded" class="loading-placeholder">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" style="width: 100%; height: 600px" />
            </template>
          </el-skeleton>
        </div>
      </div>
      
      <!-- 图片文件预览 -->
      <div v-else-if="isImage" class="image-preview">
        <el-image
          :src="fileUrl"
          :preview-src-list="[fileUrl]"
          fit="contain"
          @load="onImageLoad"
        >
          <template #placeholder>
            <div class="image-slot">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="rect" style="width: 100%; height: 400px" />
                </template>
              </el-skeleton>
            </div>
          </template>
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      
      <!-- 文本文件预览 -->
      <div v-else-if="isText" class="text-preview">
        <pre class="text-content">{{ textContent }}</pre>
        <div v-if="loadingText" class="loading-placeholder">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 100%" v-for="i in 10" :key="i" />
            </template>
          </el-skeleton>
        </div>
      </div>
      
      <!-- 不支持预览的文件类型 -->
      <div v-else class="unsupported-preview">
        <el-empty description="该文件类型暂不支持在线预览">
          <el-button type="primary" @click="downloadFile">下载文件</el-button>
        </el-empty>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="downloadFile">下载</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import storageUtil from '@/utils/storage'
import { SYSTEM_CONSTANTS } from '@/constants'

// 定义 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fileInfo: {
    type: Object,
    default: () => ({})
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const fileUrl = ref('')
const loaded = ref(false)
const textContent = ref('')
const loadingText = ref(false)

// 计算属性
const isPDF = computed(() => {
  return props.fileInfo?.fileExtension?.toLowerCase() === 'pdf'
})

const isImage = computed(() => {
  // 与后端 FileFormatType.Category.IMAGE 保持一致
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif']
  return imageExtensions.includes(props.fileInfo?.fileExtension?.toLowerCase())
})

const isText = computed(() => {
  // 与后端 FileFormatType.Category.DOCUMENT 中的文本文件保持一致
  const textExtensions = ['txt', 'md']
  return textExtensions.includes(props.fileInfo?.fileExtension?.toLowerCase())
})

// 监听 visible 变化，当对话框打开时加载文件
watch(visible, (val) => {
  if (val) {
    loadFile()
  } else {
    reset()
  }
}, { immediate: true })

// 加载文件
async function loadFile() {
  try {
    if (!props.fileInfo?.id) return
    
    // 构造文件URL（这里需要根据实际API调整）
    fileUrl.value = `/api/documents/${props.fileInfo.id}/preview`
    
    if (isText.value) {
      await loadTextFile()
    } else if (isPDF.value) {
      // PDF文件在iframe加载时会触发
      setTimeout(() => {
        loaded.value = true
      }, 1000)
    }
  } catch (error) {
    console.error('文件加载失败:', error)
    ElMessage.error('文件加载失败')
  }
}

// 加载文本文件
async function loadTextFile() {
  loadingText.value = true
  try {
    const token = storageUtil.get(SYSTEM_CONSTANTS.TOKEN_NAME)
    const response = await fetch(fileUrl.value, {
      headers: {
        'Authorization': token ? `${SYSTEM_CONSTANTS.TOKEN_PREFIX}${token.replace(/^Bearer\s*/i, '').trim()}` : ''
      }
    })
    
    if (response.ok) {
      textContent.value = await response.text()
    } else {
      throw new Error('文件加载失败')
    }
  } catch (error) {
    console.error('文本文件加载失败:', error)
    ElMessage.error('文本文件加载失败')
  } finally {
    loadingText.value = false
  }
}

// 图片加载完成
function onImageLoad() {
  loaded.value = true
}

// 下载文件
function downloadFile() {
  // 调用父组件的下载方法或直接跳转到下载链接
  window.open(`/api/documents/${props.fileInfo.id}/download`, '_blank')
}

// 关闭对话框
function handleClose() {
  visible.value = false
}

// 重置状态
function reset() {
  fileUrl.value = ''
  loaded.value = false
  textContent.value = ''
  loadingText.value = false
}

// 暴露方法
defineExpose({
  loadFile
})
</script>

<style scoped>
.preview-container {
  min-height: 400px;
}

.pdf-preview {
  position: relative;
}

.image-preview {
  text-align: center;
}

.text-preview {
  max-height: 600px;
  overflow-y: auto;
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.unsupported-preview {
  text-align: center;
  padding: 50px 0;
}

.loading-placeholder {
  width: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 400px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.image-slot .el-icon {
  font-size: 30px;
  margin-bottom: 10px;
}

.dialog-footer {
  text-align: right;
}

.file-preview-dialog {
  min-width: 800px;
}

@media (max-width: 768px) {
  .file-preview-dialog {
    width: 95% !important;
    min-width: auto;
  }
}
</style>