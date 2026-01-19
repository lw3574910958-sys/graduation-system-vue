<template>
  <div class="statistics-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据统计管理</span>
        </div>
      </template>
      
      <base-list
        :get-list-api="statisticsApi.getStats"
        :delete-api="statisticsApi.delete"
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
import { statisticsApi } from '@/api/statistics'
import AddOrUpdate from '@/views/statistics/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 统计数据结构
type StatisticsRow = {
  id: number | string
  name: string
  type: string
  value: number
  description: string
  updatedAt?: string | Date
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'name',
    label: '统计名称',
    component: 'el-input',
    props: { placeholder: '请输入统计名称' }
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 100 },
  { prop: 'name', label: '统计名称' },
  { prop: 'type', label: '类型' },
  { prop: 'value', label: '数值' },
  { prop: 'description', label: '描述' },
  { prop: 'updatedAt', label: '更新时间' },
]

// 处理新增
function handleAdd() {
  operateRef.value.showModel()
}

// 处理编辑
function handleEdit(row: StatisticsRow) {
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

.statistics-list {
  padding: 20px;
}
</style>