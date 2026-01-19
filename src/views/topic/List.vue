<template>
  <div class="list-container">
    <base-list
      :get-list-api="topicApi.getList"
      :delete-api="topicApi.delete"
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
import { topicApi } from '@/api/topic'
import AddOrUpdate from '@/views/topic/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 课题数据结构
type TopicRow = {
  id: number | string
  title: string
  description: string
  teacherId: number
  status: number
  createdAt?: string | Date
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
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
      { label: '开放', value: 0 },
      { label: '已选', value: 1 },
      { label: '关闭', value: 2 }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'title', label: '课题标题', headerAlign: 'center', align: 'center' },
  { prop: 'description', label: '课题描述', headerAlign: 'center', align: 'center' },
  { prop: 'teacherId', label: '发布教师ID', headerAlign: 'center', align: 'center' },
  { 
    prop: 'status', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: TopicRow) => getStatusLabel(row.status)
  },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center' },
]

/**
 * 新增课题
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑课题
 */
function update(row: TopicRow) {
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: number | string) {
  // 由BaseList组件处理删除逻辑
}

/**
 * 获取状态标签
 */
function getStatusLabel(status: number) {
  switch(status) {
    case 0: return '开放'
    case 1: return '已选'
    case 2: return '关闭'
    default: return '未知'
  }
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>
