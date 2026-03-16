<template>
  <div class="list-container">
    <base-list
      :get-list-api="selectionApi.getList"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <!-- 学生角色操作 -->
        <template v-if="userType === 'student'">
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.PENDING_REVIEW" 
            @click="handleApply(scope.row)" 
            type="primary" 
            size="small"
          >
            申请选题
          </el-button>
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.APPROVED" 
            @click="handleConfirm(scope.row.id)" 
            type="success" 
            size="small"
            :loading="confirmLoading"
          >
            确认选题
          </el-button>
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.PENDING_REVIEW" 
            @click="handleCancel(scope.row.id)" 
            type="warning" 
            size="small"
            :loading="cancelLoading"
          >
            撤销申请
          </el-button>
        </template>
        
        <!-- 教师角色操作 -->
        <template v-if="userType === 'teacher'">
          <el-button 
            v-if="scope.row.status === SELECTION_STATUS.PENDING_REVIEW" 
            @click="handleReview(scope.row)" 
            type="primary" 
            size="small"
          >
            审核申请
          </el-button>
          <el-tag v-if="scope.row.status === 1" type="success" size="small">已通过</el-tag>
          <el-tag v-if="scope.row.status === 2" type="danger" size="small">已驳回</el-tag>
          <el-tag v-if="scope.row.status === 3" type="info" size="small">已确认</el-tag>
        </template>
        
        <!-- 管理员角色操作 -->
        <template v-if="userType === 'system_admin' || userType === 'department_admin'">
          <el-button @click="viewDetails(scope.row)" type="info" size="small">查看详情</el-button>
        </template>
      </template>
      <template #dialogs>
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
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { selectionApi } from '@/api/selection'
import SelectionApplyForm from '@/views/selection/SelectionApplyForm.vue'
import SelectionReviewForm from '@/views/selection/SelectionReviewForm.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'
import { useAuthStore } from '@/stores'
import { SELECTION_STATUS, SELECTION_STATUS_LABELS } from '@/constants'

// 获取认证信息
const authStore = useAuthStore()
const userType = computed(() => authStore.userInfo?.userType || '')

// 选题数据结构
type SelectionRow = {
  id: number | string
  topicId: number
  topicTitle: string
  studentId: number
  studentName: string
  studentNumber?: string
  status: number
  statusDesc: string
  applyReason?: string
  studentAbility?: string
  expectedGoal?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

// 组件引用
const listRef = ref()
const applyFormRef = ref()
const reviewFormRef = ref()

// 对话框可见性
const applyVisible = ref(false)
const reviewVisible = ref(false)

// 加载状态
const confirmLoading = ref(false)
const cancelLoading = ref(false)

// 搜索字段配置
const searchFields = [
  {
    prop: 'studentId',
    label: '学生ID：',
    component: 'el-input',
    props: { placeholder: '请输入学生ID' }
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
    props: { placeholder: '请选择状态' },
    options: [
      { label: '待审核', value: SELECTION_STATUS.PENDING_REVIEW },
      { label: '审核通过', value: SELECTION_STATUS.APPROVED },
      { label: '审核驳回', value: SELECTION_STATUS.REJECTED },
      { label: '已确认', value: SELECTION_STATUS.CONFIRMED }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentName', label: '学生姓名', headerAlign: 'center', align: 'center' },
  { prop: 'studentNumber', label: '学号', headerAlign: 'center', align: 'center' },
  { prop: 'topicTitle', label: '课题标题', headerAlign: 'center', align: 'center' },
  { 
    prop: 'statusDesc', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: SelectionRow) => row.statusDesc || getStatusLabel(row.status)
  },
  { prop: 'createdAt', label: '申请时间', headerAlign: 'center', align: 'center' },
  { prop: 'reviewedAt', label: '审核时间', headerAlign: 'center', align: 'center' }
]

/**
 * 处理选题申请
 */
function handleApply(row: SelectionRow) {
  applyFormRef.value?.show(row.topicId, row.topicTitle)
}

/**
 * 处理确认选题
 */
async function handleConfirm(id: number) {
  try {
    confirmLoading.value = true
    await selectionApi.confirmSelection(id)
    ElMessage.success('选题确认成功')
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '确认失败')
  } finally {
    confirmLoading.value = false
  }
}

/**
 * 处理撤销申请
 */
async function handleCancel(id: number) {
  try {
    await ElMessageBox.confirm('确定要撤销此选题申请吗？', '提示', {
      type: 'warning'
    })
    
    cancelLoading.value = true
    await selectionApi.cancelSelection(id)
    ElMessage.success('撤销申请成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
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
 * 查看详情
 */
function viewDetails(row: SelectionRow) {
  ElMessage.info('查看详情功能待实现')
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