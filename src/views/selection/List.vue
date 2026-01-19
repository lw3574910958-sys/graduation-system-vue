<template>
  <div class="list-container">
    <base-list
      :get-list-api="selectionApi.getList"
      :delete-api="selectionApi.delete"
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
import { selectionApi } from '@/api/selection'
import AddOrUpdate from '@/views/selection/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 选题数据结构
type SelectionRow = {
  id: number | string
  topicId: number
  topicTitle: string
  studentId: number
  studentName: string
  teacherId: number
  teacherName: string
  status: string
  createdAt?: string | Date
  updatedAt?: string | Date
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
      { label: '待确认', value: '0' },
      { label: '已确认', value: '1' }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentId', label: '学生ID', headerAlign: 'center', align: 'center' },
  { prop: 'topicId', label: '课题ID', headerAlign: 'center', align: 'center' },
  { prop: 'topicTitle', label: '选题标题', headerAlign: 'center', align: 'center' },
  { 
    prop: 'status', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: SelectionRow) => getStatusLabel(row.status)
  },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center' },
  { prop: 'updatedAt', label: '更新时间', headerAlign: 'center', align: 'center' },
]

/**
 * 新增选题
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑选题
 */
function update(row: SelectionRow) {
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: any) {
  // 由BaseList组件处理删除逻辑
}

/**
 * 获取状态标签
 */
function getStatusLabel(status: string) {
  switch(status) {
    case '0': return '待确认'
    case '1': return '已确认'
    default: return '未知'
  }
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>