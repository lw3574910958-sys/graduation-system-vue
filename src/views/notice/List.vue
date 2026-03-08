<template>
  <div class="list-container">
    <BaseList
      ref="listRef"
      :get-list-api="noticeApi.getNoticePage"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #operations="{ scope }">
        <el-button @click="handlePublish(scope.row)" type="success" size="small" v-if="scope.row.status === 0">发布</el-button>
        <el-button @click="handleRecall(scope.row)" type="warning" size="small" v-if="scope.row.status === 1">撤回</el-button>
      </template>
    </BaseList>
    
    <!-- 通知表单对话框 -->
    <NoticeForm
      v-model="dialogVisible"
      :notice="currentNotice"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { noticeApi } from '@/api/notice'
import type { NoticeResponse } from '@/types'
import NoticeForm from './NoticeForm.vue'
import BaseList from '@/components/common/BaseList.vue'

// 组件引用
const listRef = ref()
const dialogVisible = ref(false)
const currentNotice = ref<NoticeResponse | null>(null)

// 枚举映射
const noticeTypeMap = {
  1: '系统通知',
  2: '公告',
  3: '提醒'
}

const noticePriorityMap = {
  1: '低',
  2: '中',
  3: '高'
}

const noticeStatusMap = {
  0: '草稿',
  1: '已发布',
  2: '已撤回'
}

const targetScopeMap = {
  0: '全体',
  1: '学生',
  2: '教师',
  3: '管理员'
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'title',
    label: '标题：',
    component: 'el-input',
    props: { placeholder: '请输入标题' }
  },
  {
    prop: 'type',
    label: '类型：',
    component: 'el-select',
    props: { placeholder: '请选择类型' },
    options: [
      { label: '系统通知', value: 1 },
      { label: '公告', value: 2 },
      { label: '提醒', value: 3 }
    ]
  },
  {
    prop: 'status',
    label: '状态：',
    component: 'el-select',
    props: { placeholder: '请选择状态' },
    options: [
      { label: '草稿', value: 0 },
      { label: '已发布', value: 1 },
      { label: '已撤回', value: 2 }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'title', label: '标题', headerAlign: 'center', align: 'center', width: 200 },
  { 
    prop: 'type', 
    label: '类型', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: NoticeResponse) => String(noticeTypeMap[row.type as keyof typeof noticeTypeMap] || row.type)
  },
  { 
    prop: 'priority', 
    label: '优先级', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: NoticeResponse) => {
      const priority = noticePriorityMap[row.priority as keyof typeof noticePriorityMap] || row.priority
      const color = row.priority === 3 ? 'danger' : row.priority === 2 ? 'warning' : 'info'
      return `<el-tag type="${color}" size="small">${String(priority)}</el-tag>`
    }
  },
  { 
    prop: 'status', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: NoticeResponse) => String(noticeStatusMap[row.status as keyof typeof noticeStatusMap] || row.status)
  },
  { 
    prop: 'targetScope', 
    label: '目标范围', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: NoticeResponse) => String(targetScopeMap[row.targetScope as keyof typeof targetScopeMap] || row.targetScope)
  },
  { prop: 'publisherName', label: '发布人', headerAlign: 'center', align: 'center' },
  { prop: 'publishTime', label: '发布时间', headerAlign: 'center', align: 'center' },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center' }
]

// 添加操作
function handleAdd() {
  currentNotice.value = null
  dialogVisible.value = true
}

// 编辑操作
function handleEdit(row: NoticeResponse) {
  currentNotice.value = row
  dialogVisible.value = true
}

// 删除操作
function handleDelete(id: string | number) {
  console.log('删除通知:', id)
}

// 发布操作
function handlePublish(row: NoticeResponse) {
  ElMessage.info('发布功能待实现')
}

// 撤回操作
function handleRecall(row: NoticeResponse) {
  ElMessage.info('撤回功能待实现')
}

// 成功回调
function handleSuccess() {
  listRef.value?.getList && listRef.value.getList()
  dialogVisible.value = false
}
</script>

<style scoped>
.list-container {
  padding: 20px;
}
</style>