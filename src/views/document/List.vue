<template>
  <div class="list-container">
    <base-list
      :get-list-api="documentApi.getList"
      :delete-api="documentApi.delete"
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
import { documentApi } from '@/api/document'
import AddOrUpdate from '@/views/document/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入用户类型常量和消息常量
import { REVIEW_STATUS_LABELS, FILE_TYPE_LABELS, MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 文档数据结构
type DocumentRow = {
  id: number | string
  title: string
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  studentId: number
  studentName: string
  topicId: number
  topicTitle: string
  status: string
  uploadTime?: string | Date
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'fileType',
    label: '文件类型：',
    component: 'el-select',
    props: { placeholder: '请选择文件类型' },
    options: [
      { label: '开题报告', value: '0' },
      { label: '中期报告', value: '1' },
      { label: '毕业论文', value: '2' }
    ]
  },
  {
    prop: 'status',
    label: '状态：',
    component: 'el-select',
    props: { placeholder: '请选择状态' },
    options: [
      { label: '待审', value: '0' },
      { label: '通过', value: '1' },
      { label: '驳回', value: '2' }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'title', label: '标题', headerAlign: 'center', align: 'center' },
  { prop: 'fileName', label: '文件名', headerAlign: 'center', align: 'center' },
  { 
    prop: 'fileType', 
    label: '文件类型', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: DocumentRow) => getFileTypeLabel(row.fileType)
  },
  { prop: 'fileSize', label: '文件大小', headerAlign: 'center', align: 'center' },
  { prop: 'studentName', label: '学生姓名', headerAlign: 'center', align: 'center' },
  { prop: 'topicTitle', label: '课题标题', headerAlign: 'center', align: 'center' },
  { 
    prop: 'status', 
    label: '状态', 
    headerAlign: 'center', 
    align: 'center',
    render: (row: DocumentRow) => getReviewStatusLabel(row.status)
  },
  { prop: 'uploadTime', label: '上传时间', headerAlign: 'center', align: 'center' },
]

/**
 * 新增文档
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑文档
 */
function update(row: DocumentRow) {
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: any) {
  // 由BaseList组件处理删除逻辑
}

/**
 * 获取文件类型标签
 * 使用常量映射，便于维护和国际化
 */
function getFileTypeLabel(fileType: string | number) {
  // 将数字转换为字符串并查找对应的标签
  const fileTypeString = String(fileType);
  return FILE_TYPE_LABELS[fileTypeString as keyof typeof FILE_TYPE_LABELS] || '未知';
}

/**
 * 获取审核状态标签
 * 使用常量映射，便于维护和国际化
 */
function getReviewStatusLabel(reviewStatus: string | number) {
  // 将数字转换为字符串并查找对应的标签
  const statusString = String(reviewStatus);
  return REVIEW_STATUS_LABELS[statusString as keyof typeof REVIEW_STATUS_LABELS] || '未知';
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>