<template>
  <div class="list-container">
    <base-list
      :get-list-api="selectionApi.getList"
      :search-fields="searchFields"
      :show-add-button="false"
      :show-delete-button="false"
      :table-columns="tableColumns"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <!-- 所有角色都可以查看详情 -->
        <el-button 
          @click="viewSelectionDetail(scope.row)" 
          type="info" 
          size="small"
        >
          详情
        </el-button>

        <!-- 已审核状态（通过、驳回、已确认）：查看审核信息 -->
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.APPROVED || scope.row.status === SELECTION_STATUS.REJECTED || scope.row.status === SELECTION_STATUS.CONFIRMED" 
            @click="viewReviewInfo(scope.row)" 
            type="info" 
            size="small"
          >
            审核信息
          </el-button>
        
        <!-- 学生角色操作 -->
        <template v-if="userType === 'student'">
          
          <!-- 待审核状态：可以撤销申请 -->
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.PENDING_REVIEW" 
            @click="handleCancel(scope.row.id)" 
            type="warning" 
            size="small"
            :loading="cancelLoading"
          >
            撤销申请
          </el-button>
          
          <!-- 审核通过状态：可以确认选题 -->
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.APPROVED" 
            @click="showConfirmDialog(scope.row)" 
            type="success" 
            size="small"
          >
            确认选题
          </el-button>
          
          <!-- 审核驳回状态：可以重新申请 -->
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.REJECTED" 
            @click="reapplyTopic(scope.row)" 
            type="primary" 
            size="small"
          >
            重新申请
          </el-button>
          
          <!-- 已确认状态 -->
          <el-tag v-if="scope.row.status === SELECTION_STATUS.CONFIRMED" type="success" size="small">已确认</el-tag>
        </template>
        
        <!-- 教师角色操作 -->
        <template v-if="userType === 'teacher'">
          <!-- 待审核状态：可以审核 -->
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.PENDING_REVIEW" 
            @click="handleReview(scope.row)" 
            type="primary" 
            size="small"
          >
            审核申请
          </el-button>
          
          <!-- 状态标签 -->
          <el-tag v-if="scope.row.status === SELECTION_STATUS.APPROVED" type="success" size="small">已通过</el-tag>
          <el-tag v-if="scope.row.status === SELECTION_STATUS.REJECTED" type="danger" size="small">已驳回</el-tag>
          <el-tag v-if="scope.row.status === SELECTION_STATUS.CONFIRMED" type="info" size="small">已确认</el-tag>
        </template>
        
        <!-- 管理员角色操作 -->
        <template v-if="userType === 'system_admin' || userType === 'department_admin'">
          <!-- 管理员其他功能通过其他方式实现 -->
        </template>
      </template>
      <template #dialogs>
        <!-- 选题申请表单（仅用于重新申请功能） -->
        <selection-apply-form 
          v-model:visible="applyVisible" 
          @success="handleApplySuccess" 
          ref="applyFormRef" 
        />
        <selection-review-form 
          v-model:visible="reviewVisible" 
          @success="handleReviewSuccess" 
          ref="reviewFormRef" 
        />
        <confirm-selection-dialog
          v-if="confirmDialogVisible"
          :selection-data="currentSelection"
          @close="confirmDialogVisible = false"
          @success="handleConfirmSuccess"
        />
        <review-info-dialog 
          v-model:visible="reviewInfoVisible"
          :title="reviewInfoData.title"
          :entity-title="reviewInfoData.entityTitle"
          :review-outcome="reviewInfoData.reviewOutcome"
          :reviewer-name="reviewInfoData.reviewerName"
          :reviewer-number="reviewInfoData.reviewerNumber"
          :reviewed-at="reviewInfoData.reviewedAt"
          :feedback="reviewInfoData.feedback"
        />
        <!-- 选题详情对话框 -->
        <selection-detail-dialog
          v-model:visible="detailVisible"
          :selection-data="currentSelectionForDetail"
          @close="detailVisible = false"
        />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { selectionApi } from '@/api/selection'
import SelectionApplyForm from '@/views/selection/SelectionApplyForm.vue' // 仅用于重新申请功能
import SelectionReviewForm from '@/views/selection/SelectionReviewForm.vue'
import ConfirmSelectionDialog from '@/views/selection/ConfirmSelectionDialog.vue'
import SelectionDetailDialog from '@/views/selection/SelectionDetailDialog.vue'
import ReviewInfoDialog from '@/components/common/ReviewInfoDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'
import { useAuthStore } from '@/stores'
import { SELECTION_STATUS, SELECTION_STATUS_LABELS } from '@/constants'
import type { SelectionResponse } from '@/types/api/selection'

// 获取认证信息
const authStore = useAuthStore()
const userType = computed(() => authStore.userInfo?.userType || '')

// 选题数据结构
type SelectionRow = {
  id: string
  topicId: string
  topicTitle: string
  studentId: string
  studentName: string
  studentNumber?: string
  status: number
  statusDesc: string
  applyReason?: string
  studentAbility?: string
  expectedGoal?: string
  reviewerId?: string
  reviewerName?: string
  reviewerNumber?: string
  reviewComment?: string // 审核意见
  reviewedAt?: string | Date
  confirmedAt?: string | Date  // 学生确认时间
  createdAt?: string | Date
  updatedAt?: string | Date
}

// 组件引用
const listRef = ref()
const applyFormRef = ref()
const reviewFormRef = ref()

// 对话框可见性
const applyVisible = ref(false) // 用于重新申请功能
const reviewVisible = ref(false)
const confirmDialogVisible = ref(false)
const reviewInfoVisible = ref(false)
const detailVisible = ref(false)

// 审核信息数据
const reviewInfoData = reactive({
  title: '审核信息',
  entityTitle: '' as string,
  reviewOutcome: null as number | null,
  reviewerName: null as string | null,
  reviewerNumber: null as string | null,
  reviewedAt: null as string | null,
  feedback: '' as string,
})

// 当前选中的选题记录（使用 SelectionResponse 类型）
const currentSelection = ref<SelectionResponse | null>(null)
const currentSelectionForDetail = ref<SelectionResponse | null>(null)

// 加载状态
const cancelLoading = ref(false)

// 搜索字段配置（使用 computed 实现动态显示）
const searchFields = computed(() => {
  return [
    {
      prop: 'studentNumber',
      label: '学号：',
      component: 'el-input',
      props: { placeholder: '请输入学号' }
    },
    {
      prop: 'studentName',
      label: '学生姓名：',
      component: 'el-input',
      props: { placeholder: '请输入学生姓名' }
    },
    {
      prop: 'topicTitle',
      label: '课题标题：',
      component: 'el-input',
      props: { placeholder: '请输入课题标题' }
    },
    {
      prop: 'status',
      label: '状态：',
      component: 'el-select',
      props: { 
        placeholder: '请选择状态',
        options: [
          { label: '待审核', value: SELECTION_STATUS.PENDING_REVIEW },
          { label: '审核通过', value: SELECTION_STATUS.APPROVED },
          { label: '审核驳回', value: SELECTION_STATUS.REJECTED },
          { label: '已确认', value: SELECTION_STATUS.CONFIRMED }
        ]
      }
    }
  ]
})

// 表格列配置（使用 computed 实现动态显示）
const tableColumns = computed(() => {
  const isSystemAdmin = userType.value === 'system_admin'
  
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
    { prop: 'studentName', label: '学生姓名', headerAlign: 'center', align: 'center', ellipsisMaxLength: 10 },
    { prop: 'studentNumber', label: '学号', headerAlign: 'center', align: 'center' },
    { prop: 'topicTitle', label: '课题标题', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
    { prop: 'applyReason', label: '申请理由', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
    { prop: 'studentAbility', label: '学生能力说明', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
    { prop: 'expectedGoal', label: '预期目标', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
    { prop: 'createdAt', label: '申请时间', headerAlign: 'center', align: 'center' },
    { prop: 'reviewedAt', label: '审核时间', headerAlign: 'center', align: 'center' },
    { 
      prop: 'statusDesc', 
      label: '状态', 
      headerAlign: 'center', 
      align: 'center',
      render: (row: SelectionRow) => row.statusDesc || getStatusLabel(row.status)
    },
  ]
})

/**
 * 处理确认选题（使用对话框）
 */
function showConfirmDialog(row: SelectionRow) {
  // 将 SelectionRow 转换为 SelectionResponse 格式
  currentSelection.value = {
    id: row.id,
    studentId: row.studentId,
    studentName: row.studentName,
    studentNumber: row.studentNumber,
    topicId: row.topicId,
    topicTitle: row.topicTitle,
    status: row.status,
    statusDesc: row.statusDesc,
    applyReason: row.applyReason,
    studentAbility: row.studentAbility,
    expectedGoal: row.expectedGoal,
    reviewerId: row.reviewerId,
    reviewerName: row.reviewerName,
    reviewerNumber: row.reviewerNumber,
    reviewComment: row.reviewComment,
    reviewedAt: row.reviewedAt instanceof Date ? row.reviewedAt.toISOString() : (row.reviewedAt || ''),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt || ''),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt || '')
  }
  confirmDialogVisible.value = true
}

/**
 * 处理确认成功后的操作
 */
function handleConfirmSuccess() {
  confirmDialogVisible.value = false
  currentSelection.value = null
  getList()
  ElMessage.success('选题确认成功，列表已刷新')
}

/**
 * 处理撤销申请
 */
async function handleCancel(id: number) {
  try {
    await ElMessageBox.confirm('确定要撤销此选题申请吗？撤销后无法恢复。', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    cancelLoading.value = true
    await selectionApi.cancelSelection(id)
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

/**
 * 处理审核申请
 */
function handleReview(row: SelectionRow) {
  reviewFormRef.value?.show(row)
}

/**
 * 学生重新申请选题（审核驳回后）
 */
function reapplyTopic(row: SelectionRow) {
  // 打开申请表单，复用 SelectionApplyForm 组件，并传递审核意见和原选题 ID
  applyFormRef.value?.show(
    row.topicId.toString(), 
    row.topicTitle,
    row.reviewComment || undefined, // 传递审核意见（驳回原因）
    row.id.toString() // 传递原选题 ID，用于重新申请
  )
}

/**
 * 查看审核信息
 */
function viewReviewInfo(row: SelectionRow) {
  const rowData = row as any
  if (rowData.status === SELECTION_STATUS.APPROVED || rowData.status === SELECTION_STATUS.REJECTED || rowData.status === SELECTION_STATUS.CONFIRMED) {
    reviewInfoData.title = '选题审核信息'
    reviewInfoData.entityTitle = `课题：${row.topicTitle}`
    // 审核结果：审核通过或已确认状态显示为审核通过，审核驳回状态显示为审核驳回
    reviewInfoData.reviewOutcome = (rowData.status === SELECTION_STATUS.APPROVED || rowData.status === SELECTION_STATUS.CONFIRMED) ? 1 : 2
    reviewInfoData.reviewerName = rowData.reviewerName || null
    reviewInfoData.reviewerNumber = rowData.reviewerNumber || null
    reviewInfoData.reviewedAt = rowData.reviewedAt || null
    reviewInfoData.feedback = rowData.reviewComment || ''
    reviewInfoVisible.value = true
  }
}

/**
 * 查看详情
 */
function viewDetails(row: SelectionRow) {
  ElMessage.info('查看详情功能待实现')
}

/**
 * 查看选题详情（所有角色可用）
 */
function viewSelectionDetail(row: SelectionRow) {
  // 将 SelectionRow 转换为 SelectionResponse 格式
  currentSelectionForDetail.value = {
    id: row.id,
    studentId: row.studentId,
    studentName: row.studentName,
    studentNumber: row.studentNumber,
    topicId: row.topicId,
    topicTitle: row.topicTitle,
    status: row.status,
    statusDesc: row.statusDesc,
    applyReason: row.applyReason,
    studentAbility: row.studentAbility,
    expectedGoal: row.expectedGoal,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt || ''),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt || ''),
    // 确认时间（只有学生确认选题后才显示）
    confirmedAt: row.confirmedAt instanceof Date ? row.confirmedAt.toISOString() : (row.confirmedAt || '')
  }
  detailVisible.value = true
}

/**
 * 获取状态标签
 */
function getStatusLabel(status: number) {
  switch(status) {
    case 0: return '待审核'
    case 1: return '审核通过'
    case 2: return '审核驳回'
    case 3: return '已确认'
    default: return '未知'
  }
}

/**
 * 获取选题状态标签
 * 使用常量映射，便于维护和国际化
 */
function getSelectionStatusLabel(status: number) {
  return SELECTION_STATUS_LABELS[status as keyof typeof SELECTION_STATUS_LABELS] || '未知状态'
}

/**
 * 申请成功回调
 */
function handleApplySuccess() {
  getList()
}

/**
 * 审核成功回调
 */
function handleReviewSuccess() {
  getList()
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}

// 暴露方法给父组件
defineExpose({
  getList
})
</script>