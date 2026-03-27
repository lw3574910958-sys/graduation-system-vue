<template>
  <div class="list-container">
    <base-list
      :get-list-api="topicApi.getList"
      :delete-api="getDeleteApi()"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-add-button="showAddButton"
      :show-delete-button="canBatchDelete"
      :delete-button-text="getBatchDeleteButtonText()"
      add-button-text="申请课题"
      @add="add"
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
        
        <!-- 学生角色：申请选题 -->
        <el-button 
          @click="applyTopic(scope.row)" 
          type="success" 
          size="small"
          v-if="showApplyButton(scope.row)"
        >
          申请选题
        </el-button>
        
        <!-- 教师角色：申请题目、编辑、撤销 -->
        <el-button 
          @click="submitForReview(scope.row)" 
          type="success" 
          size="small"
          v-if="showSubmitButton(scope.row)"
        >
          申请题目
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
          @click="confirmRevoke(scope.row.id)" 
          type="warning" 
          size="small"
          v-if="showRevokeButton(scope.row)"
        >
          撤销
        </el-button>
        
        <!-- 院系管理员角色：审核、删除 -->
        <el-button 
          @click="reviewTopic(scope.row)" 
          type="warning" 
          size="small"
          v-if="showReviewButton(scope.row)"
        >
          审核
        </el-button>
        <el-button 
          @click="confirmDel(scope.row.id)" 
          type="danger" 
          size="small"
          v-if="showDeleteButton(scope.row)"
        >
          删除
        </el-button>
        
        <!-- 教师和管理员角色：显示审核信息按钮（有审核结果时） -->
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
        <add-or-update @refresh-list="getList" ref="operateRef" />
        <topic-detail ref="detailRef" />
        <topic-review-form 
          v-if="reviewDialogVisible" 
          :topic-data="currentTopic"
          @close="reviewDialogVisible = false"
          @success="handleReviewSuccess"
        />
        <topic-review-info ref="reviewInfoRef" />
        <selection-apply-form 
          ref="applyFormRef"
          @success="handleApplySuccess"
        />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts" name="TopicList">
import { ref, computed, h, onMounted } from 'vue'
import { topicApi } from '@/api/topic'
import { selectionApi } from '@/api/selection'
import AddOrUpdate from '@/views/topic/AddOrUpdate.vue'
import TopicDetail from '@/views/topic/Detail.vue'
import TopicReviewForm from '@/views/topic/TopicReviewForm.vue'
import TopicReviewInfo from '@/views/topic/TopicReviewInfo.vue'
import SelectionApplyForm from '@/views/selection/SelectionApplyForm.vue'
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

// 是否显示批量操作按钮（教师可批量撤销，院系管理员可批量删除）
const canBatchDelete = computed(() => {
  const userType = authStore.userInfo?.userType
  return userType === USER_TYPE_ENUM.TEACHER || userType === USER_TYPE_ENUM.DEPARTMENT_ADMIN
})

// 判断当前是否为教师或管理员（可以编辑/删除）
const canEditOrDelete = computed(() => {
  const userType = authStore.userInfo?.userType
  return userType === USER_TYPE_ENUM.TEACHER || 
         userType === USER_TYPE_ENUM.SYSTEM_ADMIN || 
         userType === USER_TYPE_ENUM.DEPARTMENT_ADMIN
})

// 获取删除 API（根据用户类型返回不同的 API）
const getDeleteApi = () => {
  // 院系管理员使用批量删除（删除审核通过的题目）
  if (currentUserType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN) {
    return topicApi.deleteTopic
  }
  // 教师使用批量撤销（撤销草稿状态的题目）
  if (currentUserType.value === USER_TYPE_ENUM.TEACHER) {
    return topicApi.revokeTopic
  }
  return undefined
}

// 获取批量删除按钮文字（根据用户类型显示不同的文字）
const getBatchDeleteButtonText = () => {
  // 教师显示“批量撤销”
  if (currentUserType.value === USER_TYPE_ENUM.TEACHER) {
    return '批量撤销'
  }
  // 院系管理员显示“批量删除”
  if (currentUserType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN) {
    return '批量删除'
  }
  return '批量删除'
}

// 验证选中的题目是否符合批量操作条件
const validateBatchOperation = (selections: TopicRow[]) => {
  if (selections.length === 0) {
    return { valid: false, message: '请选择要操作的题目' }
  }
  
  const userType = authStore.userInfo?.userType
  
  if (userType === USER_TYPE_ENUM.DEPARTMENT_ADMIN) {
    // 院系管理员批量删除：只能删除开放或关闭状态的题目（审核通过）
    const invalidItems = selections.filter(row => 
      row.status !== TOPIC_STATUS.OPEN && row.status !== TOPIC_STATUS.CLOSED
    )
    if (invalidItems.length > 0) {
      return { 
        valid: false, 
        message: `只能删除审核通过的题目（开放或关闭状态），请取消选择 ${invalidItems.length} 道不符合条件的题目` 
      }
    }
    return { valid: true, message: '' }
  }
  
  if (userType === USER_TYPE_ENUM.TEACHER) {
    // 教师批量撤销：只能撤销草稿状态的题目
    const invalidItems = selections.filter(row => 
      row.status !== TOPIC_STATUS.DRAFT
    )
    if (invalidItems.length > 0) {
      return { 
        valid: false, 
        message: `只能撤销草稿状态的题目，请取消选择 ${invalidItems.length} 道不符合条件的题目` 
      }
    }
    return { valid: true, message: '' }
  }
  
  return { valid: false, message: '无权限操作' }
}

// 是否显示审核按钮（仅院系管理员可见，且题目状态为审核中）
const showReviewButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN && 
         row.status === TOPIC_STATUS.REVIEWING
}

// 是否显示审核信息按钮（仅教师和管理员可见，且有审核记录）
const showReviewInfoButton = (row: TopicResponse) => {
  // 学生角色不显示审核信息按钮
  if (currentUserType.value === USER_TYPE_ENUM.STUDENT) {
    return false
  }
  // 教师和管理员角色：有审核结果时显示
  return row.lastReviewOutcome !== undefined && row.lastReviewOutcome !== null
}

/**
 * 获取审核状态标签（根据用户类型动态显示）
 * - 院系管理员：未审核（草稿）、已审核（包括审核通过和审核驳回）、-（审核中）
 * - 教师：审核通过、审核驳回、-（草稿和审核中）
 */
const getReviewStatusLabel = (row: TopicRow): string => {
  const userType = authStore.userInfo?.userType
  
  // 管理员视角
  if (userType === USER_TYPE_ENUM.DEPARTMENT_ADMIN || userType === USER_TYPE_ENUM.SYSTEM_ADMIN) {
    // 判断是否已审核：只要有审核结果（通过或驳回）都算已审核
    if (row.lastReviewOutcome !== null && row.lastReviewOutcome !== undefined) {
      return '已审核'
    } else if (row.status === TOPIC_STATUS.REVIEWING) {
      return '未审核'
    } else {
      return '-'
    }
    
  }
  
  // 教师视角
  if (userType === USER_TYPE_ENUM.TEACHER) {
    if (row.status === TOPIC_STATUS.OPEN || row.status === TOPIC_STATUS.CLOSED) {
      return '审核通过'
    } else if (row.status === TOPIC_STATUS.DRAFT && row.lastReviewOutcome === 2) {
      return '审核驳回'
    } else {
      return '-' // 草稿（未提交或驳回后修改）和审核中
    }
  }
  
  // 其他角色显示原始审核结果
  return getTopicReviewOutcomeLabel(row.lastReviewOutcome)
}

// 是否显示申请题目按钮（教师 + 草稿状态）
const showSubmitButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 是否显示撤销按钮（仅教师可撤销草稿状态的题目）
const showRevokeButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 是否显示编辑按钮（教师 + 草稿状态）
const showEditButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.TEACHER && 
         row.status === TOPIC_STATUS.DRAFT
}

// 是否显示删除按钮（仅院系管理员可删除审核通过的题目）
const showDeleteButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN && 
         (row.status === TOPIC_STATUS.OPEN || row.status === TOPIC_STATUS.CLOSED)
}

// ========== 学生角色相关方法 ==========

// 检查学生是否已申请选题（通过后端 API 查询）
const hasAppliedTopic = ref(false)

// 查询学生是否已申请选题
const checkHasAppliedTopic = async () => {
  if (currentUserType.value !== USER_TYPE_ENUM.STUDENT) {
    hasAppliedTopic.value = false
    return
  }
  
  try {
    // 调用选题 API 查询该学生的选题记录
    const res = await selectionApi.getSelectionPage({
      current: 1,
      size: 1 // 只查一条记录即可
    })
    
    // 如果有返回数据，说明学生已申请选题
    hasAppliedTopic.value = res.data?.records && res.data.records.length > 0
  } catch (error) {
    console.error('查询学生选题记录失败:', error)
    hasAppliedTopic.value = false
  }
}

// 在组件挂载时检查
onMounted(() => {
  if (currentUserType.value === USER_TYPE_ENUM.STUDENT) {
    checkHasAppliedTopic()
  }
})

// 是否显示申请选题按钮（学生 + 开放状态 + 未申请选题）
const showApplyButton = (row: TopicResponse) => {
  return currentUserType.value === USER_TYPE_ENUM.STUDENT && 
         row.status === TOPIC_STATUS.OPEN &&
         !hasAppliedTopic.value
}

// 引用 SelectionApplyForm 组件
const applyFormRef = ref()

// 学生申请选题
const applyTopic = (row: TopicResponse) => {
  // 使用 SelectionApplyForm 组件进行申请
  applyFormRef.value?.show(
    row.id.toString(),
    row.title
  )
}

// 处理申请选题成功
const handleApplySuccess = () => {
  ElMessage.success('申请选题成功')
  // 重新检查学生是否已申请选题
  checkHasAppliedTopic()
  // 刷新列表
  getList()
}

// 当前选中的题目和审核弹窗状态
const currentTopic = ref<TopicResponse | null>(null)
const reviewDialogVisible = ref(false)
const reviewInfoRef = ref<InstanceType<typeof TopicReviewInfo>>()

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
        { label: '草稿', value: TOPIC_STATUS.DRAFT },
        { label: '审核中', value: TOPIC_STATUS.REVIEWING },
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

// 表格列配置（计算属性）
const tableColumns = computed(() => {
  const userType = authStore.userInfo?.userType
  const isTeacher = userType === USER_TYPE_ENUM.TEACHER
  const isDepartmentAdmin = userType === USER_TYPE_ENUM.DEPARTMENT_ADMIN
  const isSystemAdmin = userType === USER_TYPE_ENUM.SYSTEM_ADMIN
  const isStudent = userType === USER_TYPE_ENUM.STUDENT
  
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
    { prop: 'title', label: '课题标题', headerAlign: 'center', align: 'center', minWidth: 150, ellipsisMaxLength: 30 },
    { prop: 'description', label: '课题描述', headerAlign: 'center', align: 'center', minWidth: 200, ellipsisMaxLength: 30 },
    // 教师用户不显示发布教师（其他角色可见）
    {
      prop: 'teacherId' as const,
      label: '发布教师',
      headerAlign: 'center' as const,
      align: 'center' as const,
      minWidth: 120,
      render: (row: TopicRow) => {
        // 院系管理员和系统管理员显示：真实姓名 + 工号
        if (row.teacherName) {
          return `${row.teacherName}（${row.teacherNumber || row.teacherId}）`
        }
        // 如果没有姓名，显示工号
        return row.teacherNumber || row.teacherId || ''
      },
      vIf: !isTeacher
    },
    // 教师用户和院系管理员不显示所属院系（仅系统管理员可见）
    {
      prop: 'departmentId' as const,
      label: '所属院系',
      headerAlign: 'center' as const,
      align: 'center' as const,
      width: 120,
      render: (row: TopicRow) => {
        // 系统管理员显示院系编码
        return row.departmentCode || row.departmentId || ''
      },
      vIf: isSystemAdmin
    },
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
    { 
      prop: 'selectedCount', 
      label: '已选人数', 
      headerAlign: 'center', 
      align: 'center', 
      width: 90,
      render: (row: TopicRow) => String(row.selectedCount ?? 0)
    },
    {
      prop: 'lastReviewOutcome',
      label: '审核状态',
      headerAlign: 'center',
      align: 'center',
      width: 120,
      render: (row: TopicRow) => getReviewStatusLabel(row),
      vIf: !isStudent
    },
    // 教师和系统管理员能够看到状态列（教师可编辑，系统管理员只读）
    {
      prop: 'status',
      label: '状态',
      headerAlign: 'center',
      align: 'center',
      width: 120,
      component: isTeacher ? StatusSwitch : undefined,  // 仅教师显示开关
      props: (row: TopicRow) => {
        if (!isTeacher) {
          return null  // 系统管理员不需要开关 props
        }
        const isReviewPassed = row.status === TOPIC_STATUS.OPEN || row.status === TOPIC_STATUS.CLOSED
        
        if (isReviewPassed) {
          return {
            row: row,
            activeValue: TOPIC_STATUS.OPEN,      // 开放状态值 = 2（启用）
            inactiveValue: TOPIC_STATUS.CLOSED,  // 关闭状态值 = 3（禁用）
            onToggle: () => toggleTopicStatus(row) // 直接返回 Promise
          }
        } else {
          return null
        }
      },
      render: (row: TopicRow) => {
        const isReviewPassed = row.status === TOPIC_STATUS.OPEN || row.status === TOPIC_STATUS.CLOSED
        if (!isReviewPassed) {
          return getStatusLabel(row.status)
        }
        // 如果是教师且是审核通过状态，显示开关（由 StatusSwitch 组件渲染）
        // 如果是系统管理员，显示状态标签
        if (isTeacher) {
          return '' // 渲染开关时不显示文本
        } else {
          return getStatusLabel(row.status) // 系统管理员显示状态文本
        }
      },
      vIf: isTeacher || isSystemAdmin
    }
  ]
})

/**
 * 查看课题详情
 */
function viewDetail(row: TopicRow) {
  detailRef.value?.showModel(row)
}

/**
 * 查看审核信息
 */
function viewReviewInfo(row: TopicRow) {
  reviewInfoRef.value?.showModel(row)
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
 * 删除确认（院系管理员批量删除审核通过的题目）
 */
function confirmDel(id?: number | string) {
  const userType = authStore.userInfo?.userType
  if (userType !== USER_TYPE_ENUM.DEPARTMENT_ADMIN) {
    ElMessage.warning('无权限操作')
    return
  }
  
  // 如果是单个删除，先验证题目状态
  if (id !== undefined) {
    // 获取选中的题目（单个删除时，selections 应该只有一条）
    const selections = listRef.value?.multipeSelection || []
    const targetRow = selections.find((row: TopicRow) => row.id === id)
    
    if (targetRow) {
      // 验证单个题目是否符合删除条件
      const validation = validateBatchOperation([targetRow])
      if (!validation.valid) {
        ElMessage.warning(validation.message)
        return
      }
    }
    
    // 验证通过，调用 BaseList 的删除方法
    listRef.value?.confirmDel && listRef.value.confirmDel(id)
    return
  }
  
  // 如果是批量删除，先验证选中的题目
  const selections = listRef.value?.multipeSelection || []
  const validation = validateBatchOperation(selections)
  
  if (!validation.valid) {
    ElMessage.warning(validation.message)
    return
  }
  
  // 验证通过，执行批量删除
  ElMessageBox.confirm(`确定要批量删除选中的 ${selections.length} 道题目吗？删除后无法恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    listRef.value?.confirmDel && listRef.value.confirmDel()
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 撤销确认（教师批量撤销草稿状态的题目）
 */
function confirmRevoke(id?: number | string) {
  const userType = authStore.userInfo?.userType
  if (userType !== USER_TYPE_ENUM.TEACHER) {
    ElMessage.warning('无权限操作')
    return
  }
  
  // 如果是单个撤销，直接调用 BaseList 的方法
  if (id !== undefined) {
    listRef.value?.confirmDel && listRef.value.confirmDel(id)
    return
  }
  
  // 如果是批量撤销，先验证选中的题目
  const selections = listRef.value?.multipeSelection || []
  const validation = validateBatchOperation(selections)
  
  if (!validation.valid) {
    ElMessage.warning(validation.message)
    return
  }
  
  // 验证通过，执行批量撤销
  ElMessageBox.confirm(`确定要批量撤销选中的 ${selections.length} 道题目吗？撤销后无法恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    listRef.value?.confirmDel && listRef.value.confirmDel()
  }).catch(() => {
    // 用户取消
  })
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
