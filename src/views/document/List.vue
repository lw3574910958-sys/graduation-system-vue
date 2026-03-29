<template>
  <div class="list-container">
    <base-list
      :get-list-api="fileTypeFromRoute !== null ? getDocumentListWithFilter : documentApi.getList"
      :delete-api="documentApi.delete"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-add-button="showUploadButton"
      :show-delete-button="showBatchDeleteButton"
      add-button-text="上传"
      @add="uploadDocument"
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
        <el-button 
          @click="viewReviewInfo(scope.row)" 
          type="info" 
          size="small"
          v-if="showReviewInfoButton(scope.row)"
        >
          审核信息
        </el-button>
      </template>
      
      <template #dialogs>
        <document-upload-dialog @success="handleUploadSuccess" ref="uploadDialogRef" />
        <document-review-form @success="handleReviewSuccess" ref="reviewFormRef" />
        <review-info-dialog 
          v-model:visible="reviewInfoVisible"
          :title="reviewInfoData.title"
          :entity-title="reviewInfoData.entityTitle"
          :review-outcome="reviewInfoData.reviewOutcome"
          :reviewer-name="reviewInfoData.reviewerName"
          :reviewer-id="reviewInfoData.reviewerId"
          :reviewed-at="reviewInfoData.reviewedAt"
          :feedback="reviewInfoData.feedback"
        />
        <file-preview 
          v-model="previewDialogVisible"
          :file-info="currentFileInfo"
          ref="filePreviewRef"
        />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { documentApi } from '@/api/document'
import { selectionApi } from '@/api/selection'
import DocumentUploadDialog from '@/views/document/DocumentUploadDialog.vue'
import DocumentReviewForm from '@/views/document/DocumentReviewForm.vue'
import FilePreview from '@/components/common/FilePreview.vue'
import ReviewInfoDialog from '@/components/common/ReviewInfoDialog.vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import storageUtil from '@/utils/storage'
import { SYSTEM_CONSTANTS } from '@/constants'
import { REVIEW_STATUS_LABELS, FILE_TYPE_LABELS, MESSAGE } from '@/constants/user'
import { USER_TYPE_ENUM } from '@/constants/enums'
import type { DocumentResponse, DocumentReviewRequest } from '@/types/api/document'
import BaseList from '@/components/common/BaseList.vue'
import { useAuthStore } from '@/stores'

// 使用统一的类型定义
type DocumentRow = DocumentResponse

// 获取用户信息
const authStore = useAuthStore()
const userType = computed(() => authStore.userInfo?.userType)

// 获取路由参数
const route = useRoute()
// 从路由参数中获取文件类型，用于过滤列表
const fileTypeFromRoute = computed(() => {
  const type = route.query.type as string
  if (type !== undefined && type !== null) {
    return parseInt(type)
  }
  return null
})

// 是否显示上传按钮（学生 + 有路由指定的文件类型）
const showUploadButton = computed(() => {
  return userType.value === USER_TYPE_ENUM.STUDENT && fileTypeFromRoute.value !== null
})

// 是否显示批量删除按钮（学生不显示批量删除）
const showBatchDeleteButton = computed(() => {
  return userType.value !== USER_TYPE_ENUM.STUDENT
})

// 定义操作组件引用--上传
const uploadDialogRef = ref()
const listRef = ref()

// 审核对话框相关
const reviewDialogVisible = ref(false)
const currentDocumentId = ref<number | null>(null)

// 预览对话框相关
const previewDialogVisible = ref(false)
const currentFileInfo = ref<any>({})

// 组件引用
const reviewFormRef = ref()
const reviewInfoRef = ref()
const filePreviewRef = ref()

// 对话框可见性
const reviewVisible = ref(false)
const reviewInfoVisible = ref(false)

// 审核信息数据
const reviewInfoData = reactive({
  title: '审核信息',
  entityTitle: '' as string,
  reviewOutcome: null as number | null,
  reviewerName: null as string | null,
  reviewerId: null as string | number | null,
  reviewedAt: null as string | null,
  feedback: '' as string,
})

// 搜索字段配置
const searchFields = computed(() => {
  const fields: any[] = []
  
  // 如果没有路由指定的文件类型，显示文件类型筛选器
  if (!fileTypeFromRoute.value) {
    fields.push({
      prop: 'fileType',
      label: '文件类型：',
      component: 'el-select',
      props: { placeholder: '请选择文件类型' },
      options: [
        { label: '开题报告', value: 0 },
        { label: '中期报告', value: 1 },
        { label: '毕业论文', value: 2 }
      ],
    })
  }
  
  // 始终显示审核状态筛选器
  fields.push({
    prop: 'reviewStatus',
    label: '审核状态：',
    component: 'el-select',
    props: { placeholder: '请选择审核状态' },
    options: [
      { label: '待审', value: 0 },
      { label: '通过', value: 1 },
      { label: '驳回', value: 2 },
    ],
  })
  
  return fields
})

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
  { 
    prop: 'userName', 
    label: '上传人', 
    headerAlign: 'center', 
    align: 'center', 
    ellipsisMaxLength: 15,
    showWhen: () => userType.value !== USER_TYPE_ENUM.STUDENT
  },
  { 
    prop: 'topicTitle', 
    label: '课题标题', 
    headerAlign: 'center', 
    align: 'center', 
    ellipsisMaxLength: 30,
    showWhen: () => userType.value !== USER_TYPE_ENUM.STUDENT
  },
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
 * 上传文档
 */
function uploadDocument() {
  // 检查是否已确认选题
  if (!hasConfirmedTopic.value) {
    ElMessageBox.alert(
      '请先确认选题后再上传文档',
      '未确认选题',
      {
        confirmButtonText: '确定',
        type: 'warning'
      }
    )
    return
  }
  
  // 打开上传对话框
  uploadDialogRef.value?.show()
}

/**
 * 检查学生是否已确认选题
 */
const hasConfirmedTopic = ref(false)

const checkConfirmedTopic = async () => {
  if (userType.value !== USER_TYPE_ENUM.STUDENT) {
    hasConfirmedTopic.value = false
    return
  }
  
  try {
    // 查询选题状态
    const res = await selectionApi.getSelectionPage({
      current: 1,
      size: 100
    })
    
    // 检查是否有已确认的选题
    hasConfirmedTopic.value = res.data?.records?.some(
      (record: any) => record.status === 3 // 3 表示已确认
    ) || false
  } catch (error) {
    console.error('查询选题状态失败:', error)
    hasConfirmedTopic.value = false
  }
}

// 在组件挂载时检查
onMounted(() => {
  checkConfirmedTopic()
})

/**
 * 上传成功回调
 */
function handleUploadSuccess() {
  getList()
}

/**
 * 编辑文档
 */
function update(row: DocumentRow) {
  // 文档暂不支持编辑功能
  ElMessage.info('文档不支持编辑功能')
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
 * 获取文档列表（重写，添加文件类型过滤参数）
 */
function getDocumentListWithFilter(params: any) {
  // 如果有路由指定的文件类型，添加到查询参数中
  if (fileTypeFromRoute.value !== null) {
    return documentApi.getDocumentPage({
      ...params,
      fileType: fileTypeFromRoute.value
    })
  }
  return documentApi.getDocumentPage(params)
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
 * 查看审核信息
 */
function viewReviewInfo(row: DocumentRow) {
  const rowData = row as DocumentResponse
  if (rowData.reviewStatus !== undefined && rowData.reviewStatus !== null) {
    reviewInfoData.title = '文档审核信息'
    reviewInfoData.entityTitle = rowData.originalFilename || ''
    reviewInfoData.reviewOutcome = rowData.reviewStatus === 1 ? 1 : rowData.reviewStatus === 2 ? 2 : null
    reviewInfoData.reviewerName = rowData.reviewerName || null
    reviewInfoData.reviewerId = rowData.reviewerId || null
    reviewInfoData.reviewedAt = rowData.reviewedAt || null
    reviewInfoData.feedback = rowData.feedback || ''
    reviewInfoVisible.value = true
  }
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

// 是否显示审核信息按钮（有审核记录时显示，即通过或驳回）
function showReviewInfoButton(row: DocumentRow): boolean {
  return row.reviewStatus === 1 || row.reviewStatus === 2
}
</script>
