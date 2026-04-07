<template>
  <div class="list-container">
    <BaseList
      ref="listRef"
      :get-list-api="noticeApi.getNoticePage"
      :delete-api="noticeApi.deleteNotice"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-add-button="canAddNotice"
      :show-delete-button="canDeleteNotice"
      @add="handleAdd"
      @edit="handleEdit"
      @refresh="getList"
    >
      <template #operations="{ scope }">
        <el-button @click="viewDetail(scope.row)" type="info" size="small">详情</el-button>
        <el-button @click="previewAttachment(scope.row)" type="primary" size="small" v-if="scope.row.attachmentUrl">预览附件</el-button>
        <el-button @click="downloadAttachment(scope.row)" type="success" size="small" v-if="scope.row.attachmentUrl">下载附件</el-button>
        <el-button @click="handlePublish(scope.row)" type="success" size="small" v-if="scope.row.status === 0">发布</el-button>
        <el-button @click="handleRecall(scope.row)" type="warning" size="small" v-if="scope.row.status === 1">撤回</el-button>
        <el-button @click="handleEdit(scope.row)" type="primary" size="small" v-if="scope.row.status === 0">编辑</el-button>
        <el-button @click="confirmDel(scope.row.id)" type="danger" size="small" v-if="scope.row.status === 2">删除</el-button>
      </template>
      <template #dialogs>
        <NoticeForm
          v-model="dialogVisible"
          :notice="currentNotice"
          @success="handleSuccess"
          @update:modelValue="handleDialogClose"
        />
        <NoticeDetail ref="detailRef" />
        <!-- 文件预览对话框 -->
        <FilePreview
          v-model="previewVisible"
          :file-info="previewFileInfo"
        />
      </template>
    </BaseList>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { noticeApi } from '@/api/notice'
import { departmentApi } from '@/api/department'
import type { NoticeResponse } from '@/types'
import NoticeForm from './NoticeForm.vue'
import NoticeDetail from './NoticeDetail.vue'
import FilePreview from '@/components/common/FilePreview.vue'
import BaseList from '@/components/common/BaseList.vue'
import { useAuthStore } from '@/stores'
import { USER_TYPE_ENUM } from '@/constants/enums'
import { downloadNoticeAttachment } from '@/utils/download'
import { showConfirm } from '@/utils/helper'

// Pinia store
const authStore = useAuthStore()

// 当前用户类型
const currentUserType = computed(() => authStore.userInfo?.userType)

// 判断是否有新增公告的权限（系统管理员或院系管理员）
const canAddNotice = computed(() => {
  return currentUserType.value === USER_TYPE_ENUM.SYSTEM_ADMIN || 
         currentUserType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN
})

// 判断是否有删除按钮的权限（仅系统管理员）
const canDeleteNotice = computed(() => {
  return currentUserType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
})

// 组件引用
const listRef = ref()
const detailRef = ref()
const dialogVisible = ref(false)
const currentNotice = ref<NoticeResponse | null>(null)

// 部门列表（用于搜索下拉）
const departmentList = ref<any[]>([])

// 加载部门列表
const loadDepartmentList = async () => {
  try {
    const res = await departmentApi.getDepartmentTree()
    departmentList.value = (res.data || []).map((dept: any) => ({
      label: `${dept.name} - ${dept.code}`,
      value: dept.id
    }))
  } catch (error: any) {
    console.error('加载部门列表失败:', error.message)
    departmentList.value = []
  }
}

// 组件挂载时加载部门列表
onMounted(() => {
  loadDepartmentList()
})

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
  3: '院系管理员'
}

// 判断公告是否已到生效时间
const isNoticeEffective = (row: NoticeResponse): boolean => {
  if (!row.startTime && !row.endTime) {
    return true // 没有时间设置，始终有效
  }
  
  const now = new Date()
  const startTime = row.startTime ? new Date(row.startTime) : null
  const endTime = row.endTime ? new Date(row.endTime) : null
  
  // 如果只有开始时间
  if (startTime && !endTime) {
    return now >= startTime
  }
  
  // 如果只有结束时间
  if (!startTime && endTime) {
    return now <= endTime
  }
  
  // 如果两者都有
  if (startTime && endTime) {
    return now >= startTime && now <= endTime
  }
  
  return true
}

// 获取生效状态文本
const getEffectiveStatusText = (row: NoticeResponse): string => {
  // 草稿和已撤回状态不需要显示生效状态
  if (row.status === 0 || row.status === 2) {
    return '-'
  }
  
  if (isNoticeEffective(row)) {
    return '生效中'
  } else {
    // 判断是未到开始时间还是已过结束时间
    const now = new Date()
    const startTime = row.startTime ? new Date(row.startTime) : null
    const endTime = row.endTime ? new Date(row.endTime) : null
    
    if (startTime && now < startTime) {
      return '待生效'
    } else if (endTime && now > endTime) {
      return '已过期'
    }
    return '未生效'
  }
}

// 获取置顶状态文本和颜色
const getStickyText = (row: NoticeResponse): { text: string, color: string } => {
  if (row.isSticky === 1) {
    return { text: '是', color: '#67C23A' } // 绿色
  } else {
    return { text: '否', color: '#F56C6C' } // 红色
  }
}

// 获取状态文本和颜色
const getStatusText = (row: NoticeResponse): { text: string, color: string } => {
  const status = row.status
  if (status === 0) {
    return { text: '草稿', color: '#909399' } // 灰色 - 未发布状态
  } else if (status === 1) {
    return { text: '已发布', color: '#67C23A' } // 绿色
  } else if (status === 2) {
    return { text: '已撤回', color: '#E6A23C' } // 橙色
  }
  return { text: String(status), color: '#606266' }
}

// 获取优先级文本和颜色
const getPriorityText = (row: NoticeResponse): { text: string, color: string } => {
  const priority = row.priority
  if (priority === 3) {
    return { text: '高', color: '#F56C6C' } // 红色
  } else if (priority === 2) {
    return { text: '中', color: '#E6A23C' } // 橙色
  } else if (priority === 1) {
    return { text: '低', color: '#67C23A' } // 绿色
  }
  return { text: String(priority), color: '#606266' }
}

// 获取目标范围文本和颜色
const getTargetScopeText = (row: NoticeResponse): { text: string, color: string } => {
  const scope = row.targetScope
  const departmentId = row.departmentId
  
  if (scope === 0) {
    // 如果有 departmentId，说明是院系管理员发布的本院系全体公告
    if (departmentId) {
      return { text: '本院系全体', color: '#409EFF' } // 蓝色
    }
    return { text: '全体', color: '#409EFF' } // 蓝色
  } else if (scope === 1) {
    // 如果有 departmentId，说明是本院系学生
    if (departmentId) {
      return { text: '本院系学生', color: '#67C23A' } // 绿色
    }
    return { text: '学生', color: '#67C23A' } // 绿色
  } else if (scope === 2) {
    // 如果有 departmentId，说明是本院系教师
    if (departmentId) {
      return { text: '本院系教师', color: '#E6A23C' } // 橙色
    }
    return { text: '教师', color: '#E6A23C' } // 橙色
  } else if (scope === 3) {
    return { text: '院系管理员', color: '#F56C6C' } // 红色
  }
  return { text: String(scope), color: '#606266' }
}

// 获取类型文本和颜色
const getTypeText = (row: NoticeResponse): { text: string, color: string } => {
  const type = row.type
  if (type === 1) {
    return { text: '系统通知', color: '#409EFF' } // 蓝色
  } else if (type === 2) {
    return { text: '公告', color: '#67C23A' } // 绿色
  } else if (type === 3) {
    return { text: '提醒', color: '#E6A23C' } // 橙色
  }
  return { text: String(type), color: '#606266' }
}

// 搜索字段配置（使用 computed 实现动态显示）
const searchFields = computed(() => {
  const isSystemAdmin = currentUserType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
  
  return [
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
      props: { 
        placeholder: '请选择类型',
        options: [
          { label: '系统通知', value: 1 },
          { label: '公告', value: 2 },
          { label: '提醒', value: 3 }
        ]
      }
    },
    {
      prop: 'status',
      label: '状态：',
      component: 'el-select',
      props: {
        placeholder: '请选择状态',
        options: [
          { label: '草稿', value: 0 },
          { label: '已发布', value: 1 },
          { label: '已撤回', value: 2 }
        ]
      }
    },
    {
      prop: 'isSticky',
      label: '置顶：',
      component: 'el-select',
      props: {
        placeholder: '请选择是否置顶',
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 }
        ]
      }
    },
    {
      prop: 'priority',
      label: '优先级：',
      component: 'el-select',
      props: {
        placeholder: '请选择优先级',
        options: [
          { label: '高', value: 3 },
          { label: '中', value: 2 },
          { label: '低', value: 1 }
        ]
      }
    },
    {
      prop: 'targetScope',
      label: '目标范围：',
      component: 'el-select',
      props: {
        placeholder: '请选择目标范围',
        options: currentUserType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
          ? [
              { label: '全体', value: 0 },
              { label: '院系管理员', value: 3 },
              { label: '教师', value: 2 },
              { label: '学生', value: 1 }
            ]
          : [
              { label: '全体', value: 0 },
              { label: '教师', value: 2 },
              { label: '学生', value: 1 }
            ]
      }
    },
    // 所属院系搜索列：仅系统管理员可见（下拉列表显示）
    ...(isSystemAdmin ? [{
      prop: 'departmentId',
      label: '所属院系：',
      component: 'el-select',
      props: {
        placeholder: '请选择院系',
        options: departmentList.value,
        clearable: true
      }
    }] : []),
    {
      prop: 'effectiveStatus',
      label: '生效状态：',
      component: 'el-select',
      props: {
        placeholder: '请选择生效状态',
        options: [
          { label: '生效中', value: 'effective' },
          { label: '待生效', value: 'pending' },
          { label: '已过期', value: 'expired' }
        ]
      }
    }
  ]
})

// 表格列配置（使用 computed 实现动态显示）
const tableColumns = computed(() => {
  const isSystemAdmin = currentUserType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
  
  const columns: any[] = [
    { prop: 'title', label: '标题', headerAlign: 'center', align: 'center', minWidth: 180, ellipsisMaxLength: 30 },
    { 
      prop: 'content', 
      label: '内容', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 200,
      ellipsisMaxLength: 30
    },
    { 
      prop: 'type', 
      label: '类型', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 80,
      render: (row: NoticeResponse) => {
        const { text, color } = getTypeText(row)
        return `<el-tag type="${color === '#409EFF' ? '' : color === '#67C23A' ? 'success' : color === '#E6A23C' ? 'warning' : 'danger'}">${text}</el-tag>`
      }
    },
    { 
      prop: 'priority', 
      label: '优先级', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 60,
      render: (row: NoticeResponse) => {
        const { text, color } = getPriorityText(row)
        return `<el-tag type="${color === '#67C23A' ? 'success' : color === '#F56C6C' ? 'danger' : color === '#E6A23C' ? 'warning' : ''}">${text}</el-tag>`
      }
    },
    { 
      prop: 'isSticky', 
      label: '置顶', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 60,
      render: (row: NoticeResponse) => {
        const { text, color } = getStickyText(row)
        return `<el-tag type="${color === '#67C23A' ? 'success' : color === '#F56C6C' ? 'danger' : 'warning'}">${text}</el-tag>`
      }
    },
    // 发布者字段：仅系统管理员可见
    ...(isSystemAdmin ? [{ 
      prop: 'publisherName', 
      label: '发布者', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 120,
      render: (row: NoticeResponse) => {
        if (!row.publisherName && !row.publisherAdminId) return '-'
        if (row.publisherName && row.publisherAdminId) {
          return `${row.publisherName} - ${row.publisherAdminId}`
        }
        return row.publisherName || row.publisherAdminId || '-'
      }
    }] : []),
    { 
      prop: 'status', 
      label: '状态', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 80,
      render: (row: NoticeResponse) => {
        const { text, color } = getStatusText(row)
        return `<el-tag type="${color === '#67C23A' ? 'success' : color === '#F56C6C' ? 'danger' : color === '#E6A23C' ? 'warning' : 'info'}">${text}</el-tag>`
      }
    },
    { 
      prop: 'effectiveStatus', 
      label: '生效状态', 
      headerAlign: 'center', 
      align: 'center',
      minWidth: 80,
      render: (row: NoticeResponse) => getEffectiveStatusText(row)
    },
    { prop: 'publishedAt', label: '发布时间', headerAlign: 'center', align: 'center', minWidth: 160 },
    // 创建时间字段：仅系统管理员可见
    ...(isSystemAdmin ? [{ prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center', minWidth: 160 }] : []),
  ]
  
  return columns
})

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

// 查看操作
function viewDetail(row: NoticeResponse) {
  detailRef.value?.showModel(row)
}

// 确认删除
async function confirmDel(id?: any) {
  // 由于使用 BaseList，删除逻辑已在 BaseList 中处理
  // 这里需要手动触发 BaseList 的 confirmDel 方法
  listRef.value?.confirmDel && listRef.value.confirmDel(id)
}

// 发布操作
async function handlePublish(row: NoticeResponse) {
  try {
    await showConfirm({
      message: '确定要发布该通知吗？',
      type: 'warning'
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
    await showConfirm({
      message: '确定要撤回该通知吗？',
      type: 'warning'
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
  currentNotice.value = null // 重置当前通知，避免下次打开时残留旧数据
}

// 对话框关闭处理
function handleDialogClose(value: boolean) {
  dialogVisible.value = value
  // 当对话框关闭时，重置 currentNotice
  if (!value) {
    currentNotice.value = null
  }
}

// 文件预览相关
const previewVisible = ref(false)
const previewFileInfo = ref<any>({})

/**
 * 预览附件
 */
function previewAttachment(row: NoticeResponse) {
  if (!row.attachmentUrl) {
    ElMessage.warning('暂无附件可预览')
    return
  }
  
  // 构造预览文件信息
  const fileName = row.attachmentUrl.split('/').pop() || '附件'
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
  
  previewFileInfo.value = {
    filename: decodeURIComponent(fileName),
    fileExtension: fileExtension,
    url: row.attachmentUrl
  }
  previewVisible.value = true
}

/**
 * 下载附件（使用通用下载工具）
 */
async function downloadAttachment(row: NoticeResponse) {
  if (row.attachmentUrl) {
    await downloadNoticeAttachment(row.attachmentUrl)
  }
}
</script>

<style scoped>
/* 样式已由 BaseList 组件统一处理 */
</style>