<template>
  <div class="list-container">
    <base-list
      :get-list-api="topicApi.getList"
      :delete-api="topicApi.deleteTopic"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-add-button="showAddButton"
      :show-delete-button="canEditOrDelete"
      add-button-text="申请课题"
      @add="add"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <el-button 
          @click="viewDetail(scope.row)" 
          type="info" 
          size="small"
        >
          详情
        </el-button>
        <el-button 
          @click="submitForReview(scope.row)" 
          type="success" 
          size="small"
          v-if="showSubmitButton(scope.row)"
        >
          申请题目
        </el-button>
        <el-button 
          @click="revokeTopic(scope.row)" 
          type="warning" 
          size="small"
          v-if="showRevokeButton(scope.row)"
        >
          撤销
        </el-button>
        <el-button 
          @click="reviewTopic(scope.row)" 
          type="warning" 
          size="small"
          v-if="showReviewButton(scope.row)"
        >
          审核
        </el-button>
        <el-button 
          @click="update(scope.row)" 
          type="primary" 
          size="small"
          v-if="showEditButton(scope.row)"
        >
          编辑
        </el-button>
        <el-button 
          @click="confirmDel(scope.row.id)" 
          type="danger" 
          size="small"
          v-if="showDeleteButton(scope.row)"
        >
          删除
        </el-button>
      </template>
      <template #dialogs>
        <add-or-update @refresh-list="getList" ref="operateRef" />
        <topic-detail ref="detailRef" />
        <topic-review-form 
          v-if="reviewDialogVisible" 
          :topic-data="currentTopic"
          @close="reviewDialogVisible = false"
          @success="handleReviewSuccess"
        />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts" name="TopicList">
import { ref, computed } from 'vue'
import { topicApi } from '@/api/topic'
import AddOrUpdate from '@/views/topic/AddOrUpdate.vue'
import TopicDetail from '@/views/topic/Detail.vue'
import TopicReviewForm from '@/views/topic/TopicReviewForm.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import type { TopicResponse } from '@/types/api/topic'
import BaseList from '@/components/common/BaseList.vue'
import { useAuthStore } from '@/stores'
import { USER_TYPE_ENUM, TOPIC_STATUS, TOPIC_STATUS_LABELS, TOPIC_WORKLOAD_LABELS, TOPIC_SOURCE, TOPIC_TYPE, TOPIC_NATURE, TOPIC_DIFFICULTY, TOPIC_WORKLOAD, TOPIC_DIFFICULTY_LABELS, getTopicReviewOutcomeLabel } from '@/constants/enums'
import StatusSwitch from '@/components/common/StatusSwitch.vue'

// 获取当前用户信息
const authStore = useAuthStore()
const currentUserType = computed(() => authStore.userInfo?.userType)

// 判断当前是否为教师（可以申请课题）
const showAddButton = computed(() => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER
})

// 判断当前是否为教师或管理员（可以编辑/删除）
const canEditOrDelete = computed(() => {
  const userType = authStore.userInfo?.userType
  return userType === USER_TYPE_ENUM.TEACHER || 
         userType === USER_TYPE_ENUM.SYSTEM_ADMIN || 
         userType === USER_TYPE_ENUM.DEPARTMENT_ADMIN
})

// 是否显示审核按钮（仅院系管理员可见，且题目状态为审核中）
const showReviewButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN && 
         row.status === TOPIC_STATUS.REVIEWING
}

// 是否显示申请题目按钮（教师 + 草稿状态）
const showSubmitButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 是否显示撤销按钮（教师 + 草稿状态）
const showRevokeButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 是否显示编辑按钮（教师 + 草稿状态）
const showEditButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 是否显示删除按钮（教师 + 草稿状态）
const showDeleteButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 当前选中的题目和审核弹窗状态
const currentTopic = ref<TopicResponse | null>(null)
const reviewDialogVisible = ref(false)

// 使用统一的类型定义
type TopicRow = TopicResponse

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const detailRef = ref()
const listRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'title',
    label: '课题标题：',
    component: 'el-input',
    props: { placeholder: '请输入课题标题' }
  },
  {
    prop: 'source',
    label: '题目来源：',
    component: 'el-select',
    props: { 
      placeholder: '请选择题目来源',
      options: Object.entries(TOPIC_SOURCE).map(([key, value]) => ({
        label: value,
        value: value
      }))
    }
  },
  {
    prop: 'type',
    label: '题目类型：',
    component: 'el-select',
    props: { 
      placeholder: '请选择题目类型',
      options: Object.entries(TOPIC_TYPE).map(([key, value]) => ({
        label: value,
        value: value
      }))
    }
  },
  {
    prop: 'nature',
    label: '题目性质：',
    component: 'el-select',
    props: { 
      placeholder: '请选择题目性质',
      options: Object.entries(TOPIC_NATURE).map(([key, value]) => ({
        label: value,
        value: value
      }))
    }
  },
  {
    prop: 'status',
    label: '状态：',
    component: 'el-select',
    props: { 
      placeholder: '请选择状态',
      options: [
        { label: '开放', value: TOPIC_STATUS.OPEN },
        { label: '关闭', value: TOPIC_STATUS.CLOSED }
      ]
    }
  },
  {
    prop: 'difficulty',
    label: '预计难度：',
    component: 'el-select',
    props: { 
      placeholder: '请选择预计难度',
      options: Object.entries(TOPIC_DIFFICULTY).map(([key, value]) => ({
        label: TOPIC_DIFFICULTY_LABELS[value as keyof typeof TOPIC_DIFFICULTY_LABELS],
        value: value
      }))
    }
  },
  {
    prop: 'workload',
    label: '预计工作量：',
    component: 'el-select',
    props: { 
      placeholder: '请选择预计工作量',
      options: Object.entries(TOPIC_WORKLOAD).map(([key, value]) => ({
        label: TOPIC_WORKLOAD_LABELS[value as keyof typeof TOPIC_WORKLOAD_LABELS],
        value: value
      }))
    }
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', headerAlign: 'center', align: 'center', minWidth: 60, ellipsisMaxLength: 30 },
  { prop: 'title', label: '课题标题', headerAlign: 'center', align: 'center', minWidth: 150, ellipsisMaxLength: 30 },
  { prop: 'description', label: '课题描述', headerAlign: 'center', align: 'center', minWidth: 200, ellipsisMaxLength: 30 },
  { prop: 'teacherId', label: '发布教师 ID', headerAlign: 'center', align: 'center',  minWidth: 60, ellipsisMaxLength: 30 },
  { prop: 'departmentId', label: '所属院系 ID', headerAlign: 'center', align: 'center', width: 100 },
  { prop: 'source', label: '题目来源', headerAlign: 'center', align: 'center', width: 120, ellipsisMaxLength: 20 },
  { prop: 'type', label: '题目类型', headerAlign: 'center', align: 'center', width: 100 },
  { prop: 'nature', label: '题目性质', headerAlign: 'center', align: 'center', width: 100 },
  { 
    prop: 'difficulty', 
    label: '预计难度', 
    headerAlign: 'center', 
    align: 'center',
    width: 90,
    render: (row: TopicRow) => getDifficultyLabel(row.difficulty)
  },
  { 
    prop: 'workload', 
    label: '预计工作量', 
    headerAlign: 'center', 
    align: 'center',
    width: 100,
    render: (row: TopicRow) => getWorkloadLabel(row.workload)
  },
  { prop: 'maxSelections', label: '人数限制', headerAlign: 'center', align: 'center', width: 100 },
  { prop: 'selectedCount', label: '已选人数', headerAlign: 'center', align: 'center', width: 90 },
  {
    prop: 'lastReviewOutcome',
    label: '审核状态',
    headerAlign: 'center',
    align: 'center',
    width: 120,
    render: (row: TopicRow) => getTopicReviewOutcomeLabel(row.lastReviewOutcome)
  },
  {
    prop: 'status',
    label: '状态',
    headerAlign: 'center',
    align: 'center',
    width: 120,
    component: canEditOrDelete.value ? StatusSwitch : undefined,
    props: canEditOrDelete.value ? {
      row: (row: TopicRow) => row,
      onToggle: (row: TopicRow) => () => toggleTopicStatus(row),
    } : undefined,
    render: !canEditOrDelete.value ? (row: TopicRow) => getStatusLabel(row.status) : undefined,
  },
]

/**
 * 查看课题详情
 */
function viewDetail(row: TopicRow) {
  detailRef.value?.showModel(row)
}

/**
 * 审核题目（仅院系管理员）
 */
function reviewTopic(row: TopicRow) {
  if (!showReviewButton(row)) {
    ElMessage.warning('无权限审核该题目')
    return
  }
  currentTopic.value = row
  reviewDialogVisible.value = true
}

/**
 * 教师提交题目审核
 */
async function submitForReview(row: TopicRow) {
  if (!showSubmitButton(row)) {
    ElMessage.warning('无权限操作')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要提交审核吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await topicApi.submitForReview(String(row.id))
    ElMessage.success('提交审核成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交审核失败:', error)
      ElMessage.error(error?.message || '提交失败')
    }
  }
}

/**
 * 撤销题目（删除草稿）
 */
async function revokeTopic(row: TopicRow) {
  if (!showRevokeButton(row)) {
    ElMessage.warning('无权限操作')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要撤销该题目吗？撤销后无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await topicApi.deleteTopic(String(row.id))
    ElMessage.success('撤销成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('撤销失败:', error)
      ElMessage.error(error?.message || '撤销失败')
    }
  }
}

/**
 * 处理审核成功后的操作
 */
function handleReviewSuccess() {
  reviewDialogVisible.value = false
  currentTopic.value = null
  getList()
  ElMessage.success('审核成功，列表已刷新')
}

/**
 * 新增课题（仅教师可用）
 */
function add() {
  if (!showAddButton.value) {
    ElMessage.warning('无权限操作')
    return
  }
  operateRef.value.showModel()
}

/**
 * 编辑课题（仅教师或管理员可用）
 */
function update(row: TopicRow) {
  if (!canEditOrDelete.value) {
    ElMessage.warning('无权限操作')
    return
  }
  operateRef.value.showModel(row)
}

/**
 * 删除确认（仅教师可用）
 */
function confirmDel(id?: number | string) {
  if (!canEditOrDelete.value) {
    ElMessage.warning('无权限操作')
    return
  }
  // 由于使用 BaseList，删除逻辑已在 BaseList 中处理
  // 这里需要手动触发 BaseList 的 confirmDel 方法
  listRef.value?.confirmDel && listRef.value.confirmDel(id)
}

/**
 * 切换课题状态
 * @param row 课题行数据
 * @returns Promise<void>
 */
async function toggleTopicStatus(row: TopicRow): Promise<void> {
  const isOpen = row.status === TOPIC_STATUS.OPEN
  const action = isOpen ? '关闭' : '开放'

  try {
    await ElMessageBox.confirm(`确定要${action}该课题吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: isOpen ? 'warning' : 'success',
    })

    // 调用 API
    if (isOpen) {
      await topicApi.closeTopic(String(row.id))
    } else {
      await topicApi.openTopic(String(row.id))
    }

    ElMessage.success(`${action}成功`)

    // 刷新列表
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error)
      ElMessage.error(error?.message || `${action}失败`)
      throw error // 抛出错误，让组件知道操作失败
    }
    throw error // 用户取消时也抛出错误
  }
}

/**
 * 获取难度标签
 */
function getDifficultyLabel(difficulty?: number) {
  if (!difficulty) return '-'
  const labels: Record<number, string> = {
    1: '简单',
    2: '适中',
    3: '困难',
    4: '很难',
    5: '极难'
  }
  return labels[difficulty] || '-'
}

/**
 * 获取工作量标签
 */
function getWorkloadLabel(workload?: number) {
  if (!workload) return '-'
  return TOPIC_WORKLOAD_LABELS[workload as keyof typeof TOPIC_WORKLOAD_LABELS] || '-'
}

/**
 * 获取状态标签 (对应后端状态：0-草稿，1-审核中，2-开放，3-关闭)
 */
function getStatusLabel(status: number) {
  if (!status && status !== 0) return '-'
  return TOPIC_STATUS_LABELS[status as keyof typeof TOPIC_STATUS_LABELS] || '未知'
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>
