<template>
  <div class="list-container">
    <base-list
      :get-list-api="documentApi.getList"
      :delete-api="documentApi.delete"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      @add="add"
      @edit="update"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <el-button 
          @click="previewDocument(scope.row)" 
          type="primary" 
          size="small"
          v-permission="'student'"
        >
          预览
        </el-button>
        <el-button 
          @click="downloadDocument(scope.row.id)" 
          type="success" 
          size="small"
          v-permission="'student'"
        >
          下载
        </el-button>
        <el-button 
          @click="handleReview(scope.row)" 
          type="warning" 
          size="small"
          v-permission="'teacher'"
          :disabled="!canReview(scope.row)"
        >
          审核
        </el-button>
      </template>
      
      <template #dialogs>
        <document-review-form @success="handleReviewSuccess" ref="reviewFormRef" />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { documentApi } from '@/api/document'
import AddOrUpdate from '@/views/document/AddOrUpdate.vue'
import DocumentReviewForm from '@/views/document/DocumentReviewForm.vue'
import FilePreview from '@/components/common/FilePreview.vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import storageUtil from '@/utils/storage'
import { SYSTEM_CONSTANTS } from '@/constants'
import { REVIEW_STATUS_LABELS, FILE_TYPE_LABELS, MESSAGE } from '@/constants/user'
import type { DocumentResponse, DocumentReviewRequest } from '@/types/api/document'
import BaseList from '@/components/common/BaseList.vue'

// 使用统一的类型定义
type DocumentRow = DocumentResponse

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 审核对话框相关
const reviewDialogVisible = ref(false)
const currentDocumentId = ref<number | null>(null)

// 预览对话框相关
const previewDialogVisible = ref(false)
const currentFileInfo = ref<any>({})

// 组件引用
const reviewFormRef = ref()

// 对话框可见性
const reviewVisible = ref(false)

// 搜索字段配置
const searchFields = [
  {
    prop: 'fileType',
    label: '文件类型：',
    component: 'el-select',
    props: { placeholder: '请选择文件类型' },
    options: [
      { label: '开题报告', value: 0 },
      { label: '中期报告', value: 1 },
      { label: '毕业论文', value: 2 },
      { label: '外文翻译', value: 3 },
      { label: '其他文档', value: 4 },
    ],
  },
  {
    prop: 'reviewStatus',
    label: '审核状态：',
    component: 'el-select',
    props: { placeholder: '请选择审核状态' },
    options: [
      { label: '待审', value: 0 },
      { label: '通过', value: 1 },
      { label: '驳回', value: 2 },
    ],
  },
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', headerAlign: 'center', align: 'center' },
  { prop: 'originalFilename', label: '原始文件名', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
  {
    prop: 'fileType',
    label: '文件类型',
    headerAlign: 'center',
    align: 'center',
    render: (row: DocumentRow) => getFileTypeLabel(row.fileType),
  },
  { prop: 'fileSizeDisplay', label: '文件大小', headerAlign: 'center', align: 'center' },
  { prop: 'userName', label: '上传人', headerAlign: 'center', align: 'center', ellipsisMaxLength: 15 },
  { prop: 'topicTitle', label: '课题标题', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
  {
    prop: 'reviewStatus',
    label: '审核状态',
    headerAlign: 'center',
    align: 'center',
    render: (row: DocumentRow) => getReviewStatusLabel(row.reviewStatus),
  },
  { prop: 'uploadedAt', label: '上传时间', headerAlign: 'center', align: 'center' },
]

/**
 * 新增文档
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑文档
 */
function update(row: DocumentRow) {
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: any) {
  // 由BaseList组件处理删除逻辑
}

/**
 * 获取文件类型标签
 * 使用常量映射，便于维护和国际化
 */
function getFileTypeLabel(fileType: number) {
  return FILE_TYPE_LABELS[fileType as keyof typeof FILE_TYPE_LABELS] || '未知'
}

/**
 * 获取审核状态标签
 * 使用常量映射，便于维护和国际化
 */
function getReviewStatusLabel(reviewStatus: number) {
  return REVIEW_STATUS_LABELS[reviewStatus as keyof typeof REVIEW_STATUS_LABELS] || '未知'
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}

/**
 * 预览文档
 */
function previewDocument(row: DocumentRow) {
  currentFileInfo.value = {
    id: row.id,
    filename: row.originalFilename,
    fileExtension: row.fileExtension
  }
  previewDialogVisible.value = true
}

/**
 * 下载文档
 */
async function downloadDocument(id: number) {
  try {
    // 显示加载状态
    const loadingInstance = ElLoading.service({
      text: '正在下载文档...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 调用后端下载接口
    const token = storageUtil.get(SYSTEM_CONSTANTS.TOKEN_NAME)
    const response = await fetch(`/api/documents/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `${SYSTEM_CONSTANTS.TOKEN_PREFIX}${token.replace(/^Bearer\s*/i, '').trim()}` : ''
      }
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'document.pdf'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
      }
    }
    
    // 获取文件内容
    const blob = await response.blob()
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    loadingInstance.close()
    ElMessage.success('文档下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('文档下载失败')
  }
}

/**
 * 处理文档审核
 */
function handleReview(row: DocumentRow) {
  reviewFormRef.value?.show(row)
}

/**
 * 审核成功回调
 */
function handleReviewSuccess() {
  getList()
}

// 判断是否可以审核文档
function canReview(row: DocumentRow): boolean {
  return row.reviewStatus === 0 // 只有待审核的文档可以审核
}
</script>
