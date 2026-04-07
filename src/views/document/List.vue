<template>
  <div class="list-container">
    <base-list
      :get-list-api="fileTypeFromRoute !== null ? getDocumentListWithFilter : documentApi.getList"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-add-button="showUploadButton"
      :show-delete-button="false"
      add-button-text="上传"
      @add="uploadDocument"
      @edit="update"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <!-- 所有角色都可以查看详情 -->
        <el-button 
          @click="viewDetail(scope.row)" 
          type="info" 
          size="small"
        >
          详情
        </el-button>
        <el-button 
          @click="viewReviewInfo(scope.row)" 
          type="info" 
          size="small"
          v-if="showReviewInfoButton(scope.row)"
        >
          审核信息
        </el-button>
        
        <el-button 
          @click="previewDocument(scope.row)" 
          type="primary" 
          size="small"
        >
          预览
        </el-button>
        <el-button 
          @click="handleDownloadDocument(scope.row.id)"
          type="success" 
          size="small"
        >
          下载
        </el-button>
        
        <!-- 学生角色：重新上传（仅驳回状态的文档可以重新上传） -->
        <el-button 
          @click="reuploadDocument(scope.row)" 
          type="primary" 
          size="small"
          v-if="showReuploadButton(scope.row)"
        >
          重新上传
        </el-button>
        
        <!-- 学生角色：撤销申请（仅待审核状态的文档可以撤销） -->
        <el-button 
          @click="handleCancel(scope.row.id)" 
          type="warning" 
          size="small"
          v-if="showCancelButton(scope.row)"
          :loading="cancelLoading"
        >
          撤销申请
        </el-button>
        
        <el-button 
          @click="handleReview(scope.row)" 
          type="warning" 
          size="small"
          v-if="showReviewButton(scope.row)"
        >
          审核
        </el-button>
      </template>
      
      <template #dialogs>
        <document-detail ref="detailRef" />
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
          @download="handleDownloadDocument"
          ref="filePreviewRef"
        />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { documentApi } from '@/api/document'
import { selectionApi } from '@/api/selection'
import DocumentDetail from '@/views/document/Detail.vue'
import DocumentUploadDialog from '@/views/document/DocumentUploadDialog.vue'
import DocumentReviewForm from '@/views/document/DocumentReviewForm.vue'
import FilePreview from '@/components/common/FilePreview.vue'
import ReviewInfoDialog from '@/components/common/ReviewInfoDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { downloadDocument } from '@/utils/download'
import { REVIEW_STATUS_LABELS, FILE_TYPE_LABELS, MESSAGE } from '@/constants/user'
import { USER_TYPE_ENUM, REVIEW_STATUS } from '@/constants/enums'
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

// 定义操作组件引用--上传
const uploadDialogRef = ref()
const listRef = ref()
const detailRef = ref()

// 审核对话框相关
const reviewDialogVisible = ref(false)
const currentDocumentId = ref<number | null>(null)

// 预览对话框相关
const previewDialogVisible = ref(false)
const currentFileInfo = ref<any>({})

// 撤销加载状态
const cancelLoading = ref(false)

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

// 搜索字段配置（使用 computed 实现动态显示）
const searchFields = computed(() => {
  const fields: any[] = []
  
  // 上传人（真实姓名）- 仅教师和管理员可见
  if (userType.value !== USER_TYPE_ENUM.STUDENT) {
    fields.push({
      prop: 'userName',
      label: '上传人：',
      component: 'el-input',
      props: { placeholder: '请输入上传人姓名' }
    })
  }
  
  // 学号（学生学号）- 仅教师和管理员可见
  if (userType.value !== USER_TYPE_ENUM.STUDENT) {
    fields.push({
      prop: 'studentNumber',
      label: '学号：',
      component: 'el-input',
      props: { placeholder: '请输入学号' }
    })
  }
  
  // 审核人（真实姓名）- 仅院系管理员和系统管理员可见
  if (userType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN || userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN) {
    fields.push({
      prop: 'reviewerName',
      label: '审核人：',
      component: 'el-input',
      props: { placeholder: '请输入审核人姓名' }
    })
  }
  
  // 工号 - 仅院系管理员和系统管理员可见
  if (userType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN || userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN) {
    fields.push({
      prop: 'reviewerWorkNumber',
      label: '工号：',
      component: 'el-input',
      props: { placeholder: '请输入工号' }
    })
  }
  
  // 如果没有路由指定的文件类型，显示文件类型筛选器
  if (fileTypeFromRoute.value === null) {
    fields.push({
      prop: 'fileType',
      label: '文件类型：',
      component: 'el-select',
      props: { 
        placeholder: '请选择文件类型',
        options: [
          { label: '开题报告', value: 0 },
          { label: '中期报告', value: 1 },
          { label: '毕业论文', value: 2 }
        ]
      }
    })
  }
  
  // 始终显示审核状态筛选器
  fields.push({
    prop: 'reviewStatus',
    label: '审核状态：',
    component: 'el-select',
    props: { 
      placeholder: '请选择审核状态',
      options: [
        { label: '待审核', value: REVIEW_STATUS.PENDING },
        { label: '审核通过', value: REVIEW_STATUS.APPROVED },
        { label: '审核驳回', value: REVIEW_STATUS.REJECTED }
      ]
    }
  })
  
  return fields
})

// 表格列配置（使用 computed 实现动态显示）
const tableColumns = computed(() => {
  const isSystemAdmin = userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
  
  return [
    // 仅系统管理员显示 ID 列
    {
      prop: 'id' as const,
      label: 'ID',
      headerAlign: 'center' as const,
      align: 'center' as const,
      minWidth: 60,
      ellipsisMaxLength: 30,
      vIf: isSystemAdmin
    },
    { 
      prop: 'originalFilename', 
      label: '文件名称', 
      headerAlign: 'center', 
      align: 'center', 
      ellipsisMaxLength: 30 
    },
    {
      prop: 'fileType',
      label: '文件类型',
      headerAlign: 'center',
      align: 'center',
      render: (row: DocumentRow) => getFileTypeLabel(row.fileType),
    },
    { prop: 'fileSizeDisplay', label: '文件大小', headerAlign: 'center', align: 'center' },
    
    // 学生用户不显示课题标题（其他角色可见）
    {
      prop: 'topicTitle' as const,
      label: '课题标题',
      headerAlign: 'center' as const,
      align: 'center' as const,
      ellipsisMaxLength: 30,
      vIf: userType.value !== USER_TYPE_ENUM.STUDENT
    },
    {
      prop: 'description',
      label: '文档描述',
      headerAlign: 'center',
      align: 'center',
      minWidth: 200,
      ellipsisMaxLength: 30,
    },
    // 学生用户不显示上传人（其他角色可见）- 显示格式：真实姓名 - 学号
    {
      prop: 'userName' as const,
      label: '上传人',
      headerAlign: 'center' as const,
      align: 'center' as const,
      minWidth: 150,
      render: (row: DocumentRow) => {
        if (!row.userName) return '-';
        if (row.studentNumber) {
          return `${row.userName}-${row.studentNumber}`;
        }
        return row.userName;
      },
      vIf: userType.value !== USER_TYPE_ENUM.STUDENT
    },
    // 仅院系管理员和系统管理员显示审核人 - 显示格式：真实姓名 - 工号
    {
      prop: 'reviewerName' as const,
      label: '审核人',
      headerAlign: 'center' as const,
      align: 'center' as const,
      minWidth: 150,
      render: (row: DocumentRow) => {
        if (!row.reviewerName) return '-';
        if (row.reviewerWorkNumber) {
          return `${row.reviewerName}-${row.reviewerWorkNumber}`;
        }
        return row.reviewerName;
      },
      vIf: userType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN || userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
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
})

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

// 监听路由参数变化，当文件类型改变时重新加载列表
watch(
  () => route.query.type,
  () => {
    // 路由参数变化时，重新加载列表
    getList()
  }
)

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
 * 下载文档（使用通用下载工具）
 */
async function handleDownloadDocument(id: number) {
  await downloadDocument(id)
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

// 是否显示审核按钮（仅教师角色，且文档状态为待审核）
function showReviewButton(row: DocumentRow): boolean {
  return userType.value === USER_TYPE_ENUM.TEACHER && row.reviewStatus === 0
}

// 是否显示审核信息按钮（有审核记录时显示，即通过或驳回）
function showReviewInfoButton(row: DocumentRow): boolean {
  return row.reviewStatus === 1 || row.reviewStatus === 2
}

// 是否显示重新上传按钮（仅学生角色，且文档状态为驳回）
function showReuploadButton(row: DocumentRow): boolean {
  if (userType.value !== USER_TYPE_ENUM.STUDENT) {
    return false
  }
  return row.reviewStatus === 2 // 驳回状态
}

// 是否显示撤销按钮（仅学生角色，且文档状态为待审核）
function showCancelButton(row: DocumentRow): boolean {
  if (userType.value !== USER_TYPE_ENUM.STUDENT) {
    return false
  }
  return row.reviewStatus === 0 // 待审核状态
}

/**
 * 重新上传文档（驳回后）
 */
function reuploadDocument(row: DocumentRow) {
  // 打开上传对话框，传递原文档 ID 用于重新上传
  uploadDialogRef.value?.show(row.id.toString(), row.fileType)
}

/**
 * 查看文档详情
 */
function viewDetail(row: DocumentRow) {
  detailRef.value?.showModel(row)
}

/**
 * 处理撤销申请
 */
async function handleCancel(id: number) {
  try {
    await ElMessageBox.confirm('确定要撤销此文档申请吗？撤销后无法恢复。', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    cancelLoading.value = true
    await documentApi.cancelDocument(id)
    ElMessage.success('撤销申请成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('撤销失败:', error)
      ElMessage.error(error.message || '撤销失败')
    }
  } finally {
    cancelLoading.value = false
  }
}
</script>
