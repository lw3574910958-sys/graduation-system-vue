<template>
  <div class="process-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程记录管理</span>
        </div>
      </template>
      
      <base-list
        :get-list-api="processApi.getList"
        :delete-api="processApi.delete"
        :search-fields="searchFields"
        :table-columns="tableColumns"
        @add="handleAdd"
        @edit="handleEdit"
        @refresh="getList"
        ref="listRef"
      >
        <template #operations="{ scope }">
          <el-button @click="handleEdit(scope.row)" type="primary" size="small">编辑</el-button>
          <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
        </template>
        <template #dialogs>
          <add-or-update @refresh-list="onRefreshList" ref="operateRef" />
        </template>
      </base-list>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { processApi } from '@/api/process'
import AddOrUpdate from '@/views/process/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 过程记录数据结构
type ProcessRow = {
  id: number | string
  title: string
  studentName: string
  topicTitle: string
  status: string
  createdAt?: string | Date
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'title',
    label: '标题',
    component: 'el-input',
    props: { placeholder: '请输入标题' }
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 100 },
  { prop: 'title', label: '标题' },
  { prop: 'studentName', label: '学生姓名' },
  { prop: 'topicTitle', label: '课题' },
  { prop: 'status', label: '状态' },
  { prop: 'createdAt', label: '创建时间' },
]

// 处理新增
function handleAdd() {
  operateRef.value.showModel()
}

// 处理编辑
function handleEdit(row: ProcessRow) {
  operateRef.value.showModel(row)
}

// 确认删除
function confirmDel(id: number | string) {
  // 由BaseList组件处理删除逻辑
}

// 刷新列表（子组件会调用）
function onRefreshList() {
  listRef.value?.getList && listRef.value.getList()
}

// 获取列表
function getList() {
  listRef.value?.getList && listRef.value.getList()
}

// 重置查询
function resetQuery() {
  listRef.value?.resetQuery && listRef.value.resetQuery()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-wrapper {
  margin-bottom: 20px;
}

.process-list {
  padding: 20px;
}
</style>