<template>
  <el-dialog
    v-model="visible"
    :title="fileInfo.filename"
    width="80%"
    :before-close="handleClose"
    class="file-preview-dialog"
  >
    <div class="preview-container">
      <!-- PDF 文件预览（使用 PDF.js） -->
      <div v-if="isPDF" class="pdf-preview">
        <div ref="pdfContainer" class="pdf-container"></div>
        <div v-if="!loaded" class="loading-placeholder">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" style="width: 100%; height: 600px" />
            </template>
          </el-skeleton>
        </div>
        <div class="pdf-controls" v-if="loaded">
          <el-button 
            @click="prevPage" 
            :disabled="currentPage <= 1" 
            size="small"
          >
            上一页
          </el-button>
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <el-button 
            @click="nextPage" 
            :disabled="currentPage >= totalPages" 
            size="small"
          >
            下一页
          </el-button>
        </div>
      </div>
      
      <!-- Word 文档预览（使用 Mammoth.js） -->
      <div v-else-if="isWord" class="word-preview">
        <div v-html="wordContent" class="word-content" ref="wordContainer"></div>
        <div v-if="!loaded" class="loading-placeholder">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" style="width: 100%; height: 600px" />
            </template>
          </el-skeleton>
        </div>
      </div>
      
      <!-- Excel 文件预览（暂不支持） -->
      <div v-else-if="isExcel" class="unsupported-preview">
        <el-empty description="Excel 文件暂不支持在线预览，请下载后使用 Excel 打开">
          <el-button type="primary" @click="downloadFile">下载文件</el-button>
        </el-empty>
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
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import storageUtil from '@/utils/storage'
import { SYSTEM_CONSTANTS } from '@/constants'
import * as PDFJS from 'pdfjs-dist'
import mammoth from 'mammoth'

// 设置 PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.4/pdf.worker.min.js'

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
const emit = defineEmits(['update:modelValue', 'download'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const fileUrl = ref('')
const loaded = ref(false)
const textContent = ref('')
const loadingText = ref(false)
const wordContent = ref('')
const pdfContainer = ref<HTMLElement | null>(null)
const wordContainer = ref<HTMLElement | null>(null)

// PDF 相关状态
const pdfDoc = ref<any>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = 1.5

// 计算属性
const isPDF = computed(() => {
  return props.fileInfo?.fileExtension?.toLowerCase() === 'pdf'
})

const isWord = computed(() => {
  // 支持 Word 文档预览（.doc 和 .docx）
  const wordExtensions = ['doc', 'docx']
  return wordExtensions.includes(props.fileInfo?.fileExtension?.toLowerCase())
})

const isExcel = computed(() => {
  // Excel 文件（.xls 和 .xlsx）暂不支持预览
  const excelExtensions = ['xls', 'xlsx']
  return excelExtensions.includes(props.fileInfo?.fileExtension?.toLowerCase())
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
    
    // 构造文件 URL（使用预览接口）
    // 使用完整的 API 基础 URL，而不是相对路径
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
    fileUrl.value = `${apiBaseUrl}/api/documents/${props.fileInfo.id}/preview`
    
    if (isPDF.value) {
      await loadPDF()
    } else if (isWord.value) {
      await loadWord()
    } else if (isText.value) {
      await loadTextFile()
    } else if (isImage.value) {
      // 图片不需要额外处理，等待 img 标签加载
      setTimeout(() => {
        loaded.value = true
      }, 500)
    }
    // Excel 文件不处理，直接显示下载提示
  } catch (error) {
    console.error('文件加载失败:', error)
    ElMessage.error('文件加载失败')
  }
}

// 加载 PDF 文件（使用 PDF.js）
async function loadPDF() {
  try {
    const token = storageUtil.get(SYSTEM_CONSTANTS.TOKEN_NAME)
    
    // 获取 PDF 文件流 - 使用 blob 类型，禁用缓存
    const response = await fetch(fileUrl.value, {
      method: 'GET',
      headers: {
        // 使用配置的 TOKEN_NAME 作为 header 名称，与后端 Sa-Token 配置一致
        [SYSTEM_CONSTANTS.TOKEN_NAME]: token ? `${SYSTEM_CONSTANTS.TOKEN_PREFIX}${token.replace(/^Bearer\s*/i, '').trim()}` : ''
      },
      cache: 'no-cache' // 禁用缓存，强制从服务器获取
    })
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('无权预览该文档')
      }
      throw new Error(`PDF 加载失败：${response.status} ${response.statusText}`)
    }
    
    // 检查响应头
    const blob = await response.blob()
    
    if (blob.size === 0) {
      throw new Error('PDF 文件内容为空')
    }
    
    const arrayBuffer = await blob.arrayBuffer()
    
    // 使用 PDF.js 加载文档
    pdfDoc.value = await PDFJS.getDocument({ data: arrayBuffer }).promise
    totalPages.value = pdfDoc.value.numPages
    
    // 渲染第一页
    await renderPDFPage(1)
    
    loaded.value = true
  } catch (error: any) {
    console.error('PDF 加载失败:', error)
    ElMessage.error(error.message || 'PDF 加载失败')
  }
}

// 渲染 PDF 页面
async function renderPDFPage(pageNum: number) {
  if (!pdfDoc.value || !pdfContainer.value) return
  
  try {
    const page = await pdfDoc.value.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    
    // 清空容器
    pdfContainer.value.innerHTML = ''
    
    // 创建 canvas 元素
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return
    
    canvas.height = viewport.height
    canvas.width = viewport.width
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto'
    
    pdfContainer.value.appendChild(canvas)
    
    // 渲染页面
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
    
    currentPage.value = pageNum
  } catch (error) {
    console.error('PDF 页面渲染失败:', error)
    ElMessage.error('PDF 页面渲染失败')
  }
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    renderPDFPage(currentPage.value - 1)
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    renderPDFPage(currentPage.value + 1)
  }
}

// 加载 Word 文档（使用 Mammoth.js）
async function loadWord() {
  try {
    const token = storageUtil.get(SYSTEM_CONSTANTS.TOKEN_NAME)
    
    // 获取 Word 文件流 - 必须使用 blob 类型，禁用缓存
    const response = await fetch(fileUrl.value, {
      method: 'GET',
      headers: {
        // 使用配置的 TOKEN_NAME 作为 header 名称，与后端 Sa-Token 配置一致
        [SYSTEM_CONSTANTS.TOKEN_NAME]: token ? `${SYSTEM_CONSTANTS.TOKEN_PREFIX}${token.replace(/^Bearer\s*/i, '').trim()}` : ''
      },
      cache: 'no-cache' // 禁用缓存，强制从服务器获取
    })
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('无权预览该文档')
      }
      throw new Error(`Word 文档加载失败：${response.status} ${response.statusText}`)
    }
    
    // 获取 Blob 并转换为 ArrayBuffer
    const blob = await response.blob()
    
    if (blob.size === 0) {
      throw new Error('Word 文档内容为空')
    }
    
    const arrayBuffer = await blob.arrayBuffer()
    
    // 使用 Mammoth.js 转换为 HTML
    const result = await mammoth.convertToHtml({ arrayBuffer })
    wordContent.value = result.value
    
    // 显示警告信息（如果有）- 这些通常是格式兼容性提示，不影响内容展示
    if (result.messages && result.messages.length > 0) {
      // 静默处理格式警告，不输出到控制台
    }
    
    loaded.value = true
  } catch (error: any) {
    console.error('Word 文档加载失败:', error)
    ElMessage.error(error.message || 'Word 文档加载失败')
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
      // 使用 text() 方法获取文本内容
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
  // 触发自定义事件，通知父组件执行下载
  emit('download', props.fileInfo.id)
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
  wordContent.value = ''
  pdfDoc.value = null
  currentPage.value = 1
  totalPages.value = 0
  if (pdfContainer.value) {
    pdfContainer.value.innerHTML = ''
  }
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

.pdf-container {
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.page-info {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.word-preview {
  position: relative;
}

.word-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.word-content :deep(h1),
.word-content :deep(h2),
.word-content :deep(h3),
.word-content :deep(h4),
.word-content :deep(h5),
.word-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: var(--el-text-color-primary);
}

.word-content :deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.word-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.word-content :deep(th),
.word-content :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px;
  text-align: left;
}

.word-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
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