<template>
  <div class="list-container">
    <base-list
      :get-list-api="gradeTypeFromRoute !== null ? getGradeListWithFilter : gradeApi.getList"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-add-button="false"
      @edit="update"
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
          v-if="isTeacher" 
          @click="update(scope.row)" 
          type="primary" 
          size="small"
          :disabled="scope.row.score !== null && scope.row.score !== undefined || scope.row.gradeType === 3"
        >
          评分
        </el-button>
      </template>
      <template #dialogs>
        <add-or-update @refresh-list="getList" ref="operateRef" />
        <grade-detail ref="detailRef" />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { gradeApi } from '@/api/grade'
import AddOrUpdate from '@/views/grade/AddOrUpdate.vue'
import GradeDetail from '@/views/grade/Detail.vue'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'
import { GRADE_TYPE_LABELS } from '@/constants/enums'
import { useAuthStore } from '@/stores/modules/auth'
import { USER_TYPE_ENUM } from '@/constants/enums'

// 获取用户信息
const authStore = useAuthStore()
const userType = computed(() => authStore.userInfo?.userType || '')
const isTeacher = computed(() => userType.value === USER_TYPE_ENUM.TEACHER)

// 获取路由参数
const route = useRoute()
// 从路由参数中获取成绩类型，用于过滤列表
const gradeTypeFromRoute = computed(() => {
  const type = route.query.type as string
  if (type !== undefined && type !== null) {
    return parseInt(type)
  }
  return null
})

// 带过滤条件的成绩列表查询方法
const getGradeListWithFilter = (params: any) => {
  // 如果有路由指定的成绩类型，添加到查询参数中
  if (gradeTypeFromRoute.value !== null) {
    params.gradeType = gradeTypeFromRoute.value
  }
  return gradeApi.getList(params)
}

// 成绩数据结构
type GradeRow = {
  id: string
  studentId: string
  studentName: string
  studentNumber?: string
  topicId: string
  topicTitle: string
  graderId: string
  graderName?: string
  graderWorkNumber?: string
  gradeType?: number
  gradeTypeDesc?: string
  score: number
  gradeLevel?: string
  gpa?: number
  comment: string
  gradedAt?: string | Date
  createdAt?: string | Date
}

// 定义操作组件引用--编辑
const operateRef = ref()
const listRef = ref()
const detailRef = ref()

// 搜索字段配置（使用 computed 实现动态显示）
const searchFields = computed(() => {
  const fields: any[] = []
  
  // 如果没有路由参数，显示成绩类型搜索框
  if (gradeTypeFromRoute.value === null) {
    fields.push({
      prop: 'gradeType',
      label: '成绩类型:',
      component: 'el-select',
      props: { 
        placeholder: '请选择成绩类型',
        options: [
          { label: '开题报告', value: 0 },
          { label: '中期报告', value: 1 },
          { label: '毕业论文', value: 2 },
          { label: '综合成绩', value: 3, disabled: true }, // 综合成绩不允许手动查询（会自动显示）
        ],
      },
    })
  }
  
  // 添加其他搜索字段
  fields.push(
    {
      prop: 'studentId',
      label: '学生 ID：',
      component: 'el-input',
      props: { placeholder: '请输入学生 ID' }
    },
    {
      prop: 'topicId',
      label: '课题 ID：',
      component: 'el-input',
      props: { placeholder: '请输入课题 ID' }
    }
  )
  
  return fields
})

// 表格列配置（使用 computed 实现动态显示）
const tableColumns = computed(() => {
  const isDepartmentAdmin = userType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN
  const isSystemAdmin = userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
  const showGraderInfo = isDepartmentAdmin || isSystemAdmin
  
  const columns: any[] = [
    { 
      prop: 'studentName', 
      label: '学生姓名', 
      headerAlign: 'center', 
      align: 'center', 
      ellipsisMaxLength: 15,
      render: (row: GradeRow) => {
        if (!row.studentName) return '-';
        if (row.studentNumber) {
          return `${row.studentName} - ${row.studentNumber}`;
        }
        return row.studentName;
      },
    },
    { prop: 'topicTitle', label: '课题标题', headerAlign: 'center', align: 'center', ellipsisMaxLength: 30 },
    // 成绩类型字段：仅当未传入 type 参数时才显示
    {
      prop: 'gradeType',
      label: '成绩类型',
      headerAlign: 'center',
      align: 'center',
      vIf: gradeTypeFromRoute.value === null, // 只有未传入成绩类型时才显示
      render: (row: GradeRow) => {
        return GRADE_TYPE_LABELS[row.gradeType as keyof typeof GRADE_TYPE_LABELS] || '未知类型';
      },
    },
    { prop: 'score', label: '成绩', headerAlign: 'center', align: 'center' },
    // 新增：成绩等级字段（所有用户可见）
    { prop: 'gradeLevel', label: '成绩等级', headerAlign: 'center', align: 'center' },
    // 新增：绩点字段（所有用户可见）
    { prop: 'gpa', label: '绩点', headerAlign: 'center', align: 'center' },
    // 评分教师 - 使用 vIf 控制显示，仅院系管理员和系统管理员可见
    {
      prop: 'graderName',
      label: '评分教师',
      headerAlign: 'center',
      align: 'center',
      ellipsisMaxLength: 15,
      vIf: showGraderInfo, // 使用 vIf 控制显示
      render: (row: GradeRow) => {
        if (!row.graderName) return '-';
        if (row.graderWorkNumber) {
          return `${row.graderName} - ${row.graderWorkNumber}`;
        }
        return row.graderName;
      },
    },
    { prop: 'comment', label: '评语', headerAlign: 'center', align: 'center', ellipsisMaxLength: 50 },
    { prop: 'gradedAt', label: '评分时间', headerAlign: 'center', align: 'center' },
  ]
  
  return columns
})

/**
 * 查看成绩详情
 */
function viewDetail(row: GradeRow) {
  detailRef.value?.showModel(row)
}

/**
 * 编辑成绩
 */
function update(row: GradeRow) {
  operateRef.value.showModel(row)
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>