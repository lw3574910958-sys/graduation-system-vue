<template>
  <div class="list-container">
    <base-list
      :get-list-api="gradeApi.getList"
      :delete-api="gradeApi.delete"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      @add="add"
      @edit="update"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <el-button @click="update(scope.row)" type="primary" size="small">编辑</el-button>
        <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
      </template>
      <template #dialogs>
        <add-or-update @refresh-list="getList" ref="operateRef" />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { gradeApi } from '@/api/grade'
import AddOrUpdate from '@/views/grade/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 成绩数据结构
type GradeRow = {
  id: number | string
  studentId: number
  studentName: string
  topicId: number
  topicTitle: string
  graderId: number
  score: number
  comment: string
  gradedAt?: string | Date
  createdAt?: string | Date
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'studentId',
    label: '学生ID：',
    component: 'el-input',
    props: { placeholder: '请输入学生ID' }
  },
  {
    prop: 'topicId',
    label: '课题ID：',
    component: 'el-input',
    props: { placeholder: '请输入课题ID' }
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentName', label: '学生姓名', headerAlign: 'center', align: 'center' },
  { prop: 'topicTitle', label: '课题标题', headerAlign: 'center', align: 'center' },
  { prop: 'graderId', label: '评分教师ID', headerAlign: 'center', align: 'center' },
  { prop: 'score', label: '成绩', headerAlign: 'center', align: 'center' },
  { prop: 'comment', label: '评语', headerAlign: 'center', align: 'center' },
  { prop: 'gradedAt', label: '评分时间', headerAlign: 'center', align: 'center' },
]

/**
 * 新增成绩
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑成绩
 */
function update(row: GradeRow) {
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: any) {
  // 由BaseList组件处理删除逻辑
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>