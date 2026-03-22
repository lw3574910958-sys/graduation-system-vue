<template>
  <div class="list-container">
    <base-list
      :get-list-api="topicApi.getList"
      :search-fields="searchFields"
      :table-columns="tableColumns"
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
          v-permission="'teacher'"
        >
          编辑
        </el-button>
        <el-button 
          @click="confirmDel(scope.row.id)" 
          type="danger" 
          size="small"
          v-permission="'teacher'"
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
import { USER_TYPE_ENUM, TOPIC_STATUS } from '@/constants/enums'

// 获取当前用户信息
const authStore = useAuthStore()
const currentUserType = computed(() => authStore.userInfo?.userType)

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
    prop: 'status',
    label: '状态：',
    component: 'el-select',
    props: { placeholder: '请选择状态' },
    options: [
      { label: '开放', value: 1 },
      { label: '已选', value: 2 },
      { label: '关闭', value: 3 }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', headerAlign: 'center', align: 'center', width: 60 },
  { prop: 'title', label: '课题标题', headerAlign: 'center', align: 'center', minWidth: 150, ellipsis: true },
  { prop: 'description', label: '课题描述', headerAlign: 'center', align: 'center', minWidth: 200, ellipsis: true, ellipsisMaxLength: 30 },
  { prop: 'teacherId', label: '发布教师 ID', headerAlign: 'center', align: 'center', width: 100 },
  { prop: 'departmentId', label: '所属院系 ID', headerAlign: 'center', align: 'center', width: 100 },
  { prop: 'source', label: '题目来源', headerAlign: 'center', align: 'center', width: 120 },
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
    prop: 'status', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    width: 80,
    render: (row: TopicRow) => getStatusLabel(row.status)
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
  if (!canEditOrDelete.value) {
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
 * 删除确认
 */
function confirmDel(id?: number | string) {
  // 由BaseList组件处理删除逻辑
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
  const labels: Record<number, string> = {
    1: '很少',
    2: '较少',
    3: '适中',
    4: '较多',
    5: '很多'
  }
  return labels[workload] || '-'
}

/**
 * 获取状态标签 (对应后端状态：1-开放，2-审核中，3-已选，4-关闭)
 */
function getStatusLabel(status: number) {
  switch(status) {
    case 1: return '开放'
    case 2: return '审核中'
    case 3: return '已选'
    case 4: return '关闭'
    default: return '未知'
  }
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>
