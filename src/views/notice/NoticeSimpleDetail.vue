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

        <!-- 发布者 -->
        <el-form-item label="发布者">
          <el-input v-model="publisherDisplay" readonly />
        </el-form-item>

        <!-- 发布时间 -->
        <el-form-item label="发布时间">
          <el-input v-model="formData.publishedAt" readonly />
        </el-form-item>

        <!-- 结束时间 -->
        <el-form-item label="结束时间">
          <el-input v-model="endTimeDisplay" readonly />
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
        <el-button type="primary" @click="handleConfirmReceived">确认收到</el-button>
      </div>
    </template>
  </el-dialog>
  
  <!-- 文件预览对话框 -->
  <FilePreview
    v-model="previewVisible"
    :file-info="previewFileInfo"
  />
</template>

<script lang="ts" setup name="NoticeSimpleDetail">
import { ref, reactive, computed } from 'vue'
import type { NoticeResponse } from '@/types'
import { Download, View } from '@element-plus/icons-vue'
import FilePreview from '@/components/common/FilePreview.vue'
import { downloadNoticeAttachment } from '@/utils/download'
import { noticeApi } from '@/api/notice'
import { ElMessage } from 'element-plus'

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
  publisherAdminId: '',
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

// 计算属性：结束时间显示
const endTimeDisplay = computed(() => {
  return formData.endTime || '-'
})

// 计算属性：附件列表（支持多个附件，用逗号分隔）
const attachmentList = computed(() => {
  if (!formData.attachmentUrl) return []
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

// 确认收到
const handleConfirmReceived = async () => {
  if (!formData.id) {
    return
  }
  try {
    const res = await noticeApi.increaseReadCount(formData.id)
    formData.readCount = res.data || (formData.readCount + 1)
    ElMessage.success('已确认收到')
    visible.value = false
  } catch (error: any) {
    console.error('确认收到失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 显示详情
function showModel(row: NoticeResponse) {
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
    publisherAdminId: '',
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
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  padding: 0 12px;
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

.form-grid .el-form-item {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.unified-form :deep(.el-input[readonly]) {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

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
