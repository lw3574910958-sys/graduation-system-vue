<template>
  <div class="list-container">
    <BaseList
      ref="listRef"
      :get-list-api="noticeApi.getNoticePage"
      :delete-api="noticeApi.deleteNotice"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      @add="handleAdd"
      @edit="handleEdit"
      @refresh="getList"
    >
      <template #operations="{ scope }">
        <el-button @click="handlePublish(scope.row)" type="success" size="small" v-if="scope.row.status === 0">发布</el-button>
        <el-button @click="handleRecall(scope.row)" type="warning" size="small" v-if="scope.row.status === 1">撤回</el-button>
        <el-button @click="handleEdit(scope.row)" type="primary" size="small">编辑</el-button>
        <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
      </template>
      <template #dialogs>
        <NoticeForm
          v-model="dialogVisible"
          :notice="currentNotice"
          @success="handleSuccess"
        />
      </template>
    </BaseList>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
  { prop: 'title', label: '标题', headerAlign: 'center', align: 'center', minWidth: 180 },
  { 
    prop: 'type', 
    label: '类型', 
    headerAlign: 'center', 
    align: 'center',
    minWidth: 80,
    render: (row: NoticeResponse) => String(noticeTypeMap[row.type as keyof typeof noticeTypeMap] || row.type)
  },
  { 
    prop: 'priority', 
    label: '优先级', 
    headerAlign: 'center', 
    align: 'center',
    minWidth: 70,
    render: (row: NoticeResponse) => {
      const priority = noticePriorityMap[row.priority as keyof typeof noticePriorityMap] || row.priority
      return String(priority)
    }
  },
  { 
    prop: 'status', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    minWidth: 80,
    render: (row: NoticeResponse) => String(noticeStatusMap[row.status as keyof typeof noticeStatusMap] || row.status)
  },
  { 
    prop: 'targetScope', 
    label: '目标范围', 
    headerAlign: 'center', 
    align: 'center',
    minWidth: 90,
    render: (row: NoticeResponse) => String(targetScopeMap[row.targetScope as keyof typeof targetScopeMap] || row.targetScope)
  },
  { prop: 'publisherName', label: '发布人', headerAlign: 'center', align: 'center', minWidth: 90 },
  { prop: 'publishedAt', label: '发布时间', headerAlign: 'center', align: 'center', minWidth: 160 },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center', minWidth: 160 }
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

// 确认删除
async function confirmDel(id?: any) {
  console.log('🔍 List.vue confirmDel 方法接收到的 id:', id)
  // 由于使用 BaseList，删除逻辑已在 BaseList 中处理
  // 这里需要手动触发 BaseList 的 confirmDel 方法
  listRef.value?.confirmDel && listRef.value.confirmDel(id)
}

// 发布操作
async function handlePublish(row: NoticeResponse) {
  try {
    await ElMessageBox.confirm('确定要发布该通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const response = await noticeApi.publishNotice(row.id)
    if (response?.code === 200) {
      ElMessage.success('发布成功')
      // 重新获取列表
      listRef.value?.getList && listRef.value.getList()
    } else {
      ElMessage.error(response?.message || '发布失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布通知失败:', error)
      ElMessage.error('发布失败')
    }
  }
}

// 撤回操作
async function handleRecall(row: NoticeResponse) {
  try {
    await ElMessageBox.confirm('确定要撤回该通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const response = await noticeApi.withdrawNotice(row.id)
    if (response?.code === 200) {
      ElMessage.success('撤回成功')
      // 重新获取列表
      listRef.value?.getList && listRef.value.getList()
    } else {
      ElMessage.error(response?.message || '撤回失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤回通知失败:', error)
      ElMessage.error('撤回失败')
    }
  }
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}

// 成功回调
function handleSuccess() {
  getList()
  dialogVisible.value = false
}
</script>

<style scoped>
/* 样式已由 BaseList 组件统一处理 */
</style>