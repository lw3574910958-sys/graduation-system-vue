<template>
  <el-dialog
    v-model="visible"
    title="公告详情"
    width="800px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="120px"
      class="unified-form"
    >
      <div class="form-grid">
        <!-- 公告标题 -->
        <el-form-item label="公告标题" class="full-width">
          <el-input v-model="formData.title" readonly />
        </el-form-item>

        <!-- 公告内容 -->
        <el-form-item label="公告内容" class="full-width">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            readonly
          />
        </el-form-item>

        <!-- 公告类型 -->
        <el-form-item label="公告类型">
          <el-input v-model="typeLabel" readonly />
        </el-form-item>

        <!-- 优先级 -->
        <el-form-item label="优先级">
          <el-input v-model="priorityLabel" readonly />
        </el-form-item>

        <!-- 目标范围 -->
        <el-form-item label="目标范围">
          <el-input v-model="targetScopeLabel" readonly />
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态">
          <el-input v-model="statusLabel" readonly />
        </el-form-item>

        <!-- 置顶 -->
        <el-form-item label="置顶">
          <el-input v-model="stickyLabel" readonly />
        </el-form-item>

        <!-- 发布者 -->
        <el-form-item label="发布者">
          <el-input v-model="publisherDisplay" readonly />
        </el-form-item>

        <!-- 发布时间 -->
        <el-form-item label="发布时间">
          <el-input v-model="formData.publishedAt" readonly />
        </el-form-item>

        <!-- 生效开始时间 -->
        <el-form-item label="生效开始时间">
          <el-input v-model="startTimeDisplay" readonly />
        </el-form-item>

        <!-- 生效结束时间 -->
        <el-form-item label="生效结束时间">
          <el-input v-model="endTimeDisplay" readonly />
        </el-form-item>

        <!-- 阅读量 -->
        <el-form-item label="阅读量">
          <el-input v-model="readCountDisplay" readonly />
        </el-form-item>

        <!-- 所属院系 -->
        <el-form-item v-if="formData.departmentId" label="所属院系">
          <el-input v-model="departmentDisplay" readonly />
        </el-form-item>

        <!-- 附件 -->
        <el-form-item v-if="formData.attachmentUrl" label="附件" class="full-width">
          <div class="attachment-list">
            <template v-for="(url, index) in attachmentList" :key="index">
              <div class="attachment-item-wrapper">
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click="handleAttachmentDownload(url)"
                  class="download-btn-inline"
                >
                  <el-icon><Download /></el-icon>
                  下载附件 {{ index + 1 }}
                </el-button>
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click="handleAttachmentPreview(url)"
                  class="preview-btn-inline"
                >
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
              </div>
            </template>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  
  <!-- 文件预览对话框 -->
  <FilePreview
    v-model="previewVisible"
    :file-info="previewFileInfo"
  />
</template>

<script lang="ts" setup name="NoticeDetail">
import { ref, reactive, computed } from 'vue'
import type { NoticeResponse } from '@/types'
import { Download, View } from '@element-plus/icons-vue'
import FilePreview from '@/components/common/FilePreview.vue'
import { downloadNoticeAttachment } from '@/utils/download'

// 直接定义枚举值，避免导入问题
const NoticeTypeEnum = {
  SYSTEM_NOTICE: 1,
  ANNOUNCEMENT: 2,
  REMINDER: 3
}

const NoticePriorityEnum = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
}

const NoticeStatusEnum = {
  DRAFT: 0,
  PUBLISHED: 1,
  WITHDRAWN: 2
}

// 控制对话框显示与否
const visible = ref(false)

// 表单数据
const formData = reactive<NoticeResponse>({
  id: '',
  title: '',
  content: '',
  type: 0,
  typeDesc: '',
  priority: 0,
  priorityDesc: '',
  publisherId: '',
  publisherName: '',
  publishedAt: '',
  startTime: '',
  endTime: '',
  status: 0,
  statusDesc: '',
  isSticky: 0,
  readCount: 0,
  targetScope: 0,
  targetScopeDesc: '',
  departmentId: undefined,
  departmentName: undefined,
  departmentCode: undefined,
  attachmentUrl: undefined,
  createdAt: '',
  updatedAt: '',
})

// 计算属性：公告类型标签
const typeLabel = computed(() => {
  if (formData.type === NoticeTypeEnum.SYSTEM_NOTICE) return '系统通知'
  if (formData.type === NoticeTypeEnum.ANNOUNCEMENT) return '公告'
  if (formData.type === NoticeTypeEnum.REMINDER) return '提醒'
  return formData.typeDesc || '-'
})

// 计算属性：优先级标签
const priorityLabel = computed(() => {
  if (formData.priority === NoticePriorityEnum.LOW) return '低'
  if (formData.priority === NoticePriorityEnum.MEDIUM) return '中'
  if (formData.priority === NoticePriorityEnum.HIGH) return '高'
  return formData.priorityDesc || '-'
})

// 计算属性：目标范围标签
const targetScopeLabel = computed(() => {
  const scope = formData.targetScope
  const departmentId = formData.departmentId
  
  if (scope === 0) {
    // 如果有 departmentId，说明是院系管理员发布的本院系全体公告
    if (departmentId) {
      return '本院系全体'
    }
    return '全体'
  } else if (scope === 1) {
    // 如果有 departmentId，说明是本院系学生
    if (departmentId) {
      return '本院系学生'
    }
    return '学生'
  } else if (scope === 2) {
    // 如果有 departmentId，说明是本院系教师
    if (departmentId) {
      return '本院系教师'
    }
    return '教师'
  } else if (scope === 3) {
    return '院系管理员'
  }
  return formData.targetScopeDesc || '-'
})

// 计算属性：状态标签
const statusLabel = computed(() => {
  if (formData.status === NoticeStatusEnum.DRAFT) return '草稿'
  if (formData.status === NoticeStatusEnum.PUBLISHED) return '已发布'
  if (formData.status === NoticeStatusEnum.WITHDRAWN) return '已撤回'
  return formData.statusDesc || '-'
})

// 计算属性：置顶标签
const stickyLabel = computed(() => {
  return formData.isSticky === 1 ? '是' : '否'
})

// 计算属性：开始时间显示
const startTimeDisplay = computed(() => {
  return formData.startTime || '-'
})

// 计算属性：结束时间显示
const endTimeDisplay = computed(() => {
  return formData.endTime || '-'
})

// 计算属性：阅读量显示
const readCountDisplay = computed(() => {
  return formData.readCount?.toString() || '0'
})

// 计算属性：院系显示（格式：院系名称 - 院系编码）
const departmentDisplay = computed(() => {
  if (formData.departmentName && formData.departmentCode) {
    return `${formData.departmentName} - ${formData.departmentCode}`
  }
  if (formData.departmentName) {
    return formData.departmentName
  }
  return formData.departmentId ? `院系 ID: ${formData.departmentId}` : '-'
})

// 计算属性：发布者显示（格式：姓名 - 编号）
const publisherDisplay = computed(() => {
  if (!formData.publisherName && !formData.publisherAdminId) return '-'
  if (formData.publisherName && formData.publisherAdminId) {
    return `${formData.publisherName} - ${formData.publisherAdminId}`
  }
  if (formData.publisherName) {
    return formData.publisherName
  }
  return formData.publisherAdminId || '-'
})

// 计算属性：附件列表（支持多个附件，用逗号分隔）
const attachmentList = computed(() => {
  if (!formData.attachmentUrl) return []
  // 按逗号分割，过滤空值
  return formData.attachmentUrl.split(',').filter(url => url.trim())
})

// 文件预览相关
const previewVisible = ref(false)
const previewFileInfo = ref<any>({})

// 处理附件预览
const handleAttachmentPreview = (url: string) => {
  if (!url) {
    return
  }
  
  // 构造预览文件信息
  const fileName = url.split('/').pop() || '附件'
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
  
  previewFileInfo.value = {
    filename: decodeURIComponent(fileName),
    fileExtension: fileExtension,
    url: url
  }
  previewVisible.value = true
}

// 处理附件下载（使用通用下载工具）
const handleAttachmentDownload = async (url: string) => {
  if (!url) {
    return
  }
  try {
    await downloadNoticeAttachment(url)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

// 显示详情
function showModel(row: NoticeResponse) {
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    title: '',
    content: '',
    type: 0,
    typeDesc: '',
    priority: 0,
    priorityDesc: '',
    publisherId: '',
    publisherName: '',
    publishedAt: '',
    startTime: '',
    endTime: '',
    status: 0,
    statusDesc: '',
    isSticky: 0,
    readCount: 0,
    targetScope: 0,
    targetScopeDesc: '',
    departmentId: undefined,
    departmentName: undefined,
    departmentCode: undefined,
    attachmentUrl: undefined,
    createdAt: '',
    updatedAt: '',
  })

  // 填充数据
  Object.assign(formData, row)

  visible.value = true
}

// 关闭对话框
function handleClose() {
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  showModel,
})
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列等宽布局 */
  gap: 16px 24px; /* 行间距 16px，列间距 24px */
  padding: 0 12px; /* 添加左右内边距，使两侧边距与中间 gap 视觉一致 */
}

/* 全宽字段独占一行 */
.form-grid .full-width {
  grid-column: 1 / -1; /* 跨越所有列 */
}

/* 优化表单项底部间距 */
.form-grid .el-form-item {
  margin-bottom: 0; /* 移除默认底部间距 */
}

/* 响应式：小屏幕时变为单列 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; /* 单列布局 */
    gap: 16px; /* 统一间距 */
  }
}

/* 统一表单样式 */
.unified-form :deep(.el-input[readonly], .el-input-number.is-disabled) {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

/* 附件列表样式 */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  transition: all 0.3s;
}

.attachment-item-wrapper:hover {
  background-color: #ecf5ff;
}

.download-btn-inline,
.preview-btn-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
