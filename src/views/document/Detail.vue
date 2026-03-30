<template>
  <el-dialog
    v-model="visible"
    title="文档详情"
    width="700px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
      class="unified-form"
    >
      <div class="form-grid">
        <!-- 文件名称 -->
        <el-form-item label="文件名称" class="full-width">
          <el-input v-model="formData.originalFilename" readonly />
        </el-form-item>

        <!-- 文件类型 -->
        <el-form-item label="文件类型">
          <el-input v-model="fileTypeLabel" readonly />
        </el-form-item>

        <!-- 文件大小 -->
        <el-form-item label="文件大小">
          <el-input v-model="formData.fileSizeDisplay" readonly />
        </el-form-item>

        <!-- 上传人 -->
        <el-form-item label="上传人">
          <el-input v-model="formData.userName" readonly />
        </el-form-item>

        <!-- 学号 -->
        <el-form-item label="学号">
          <el-input v-model="formData.studentNumber" readonly />
        </el-form-item>

        <!-- 上传时间 -->
        <el-form-item label="上传时间">
          <el-input v-model="formData.uploadedAt" readonly />
        </el-form-item>

        <!-- 文档描述 -->
        <el-form-item label="文档描述" class="full-width">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            readonly
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="DocumentDetail">
import { ref, reactive, computed } from 'vue'
import type { DocumentResponse } from '@/types/api/document'
import { FILE_TYPE_LABELS } from '@/constants/user'

// 控制对话框显示与否
const visible = ref(false)

// 表单数据
const formData = reactive<DocumentResponse>({
  id: '',
  userId: '',
  userName: '',
  studentNumber: '',
  topicId: '',
  topicTitle: '',
  fileType: 0,
  fileTypeDesc: '',
  originalFilename: '',
  fileSize: 0,
  fileSizeDisplay: '',
  fileExtension: '',
  reviewStatus: 0,
  reviewStatusDesc: '',
  reviewedAt: '',
  reviewerId: '',
  reviewerName: '',
  feedback: '',
  description: '',
  uploadedAt: '',
  createdAt: '',
  updatedAt: '',
})

// 计算属性：文件类型标签
const fileTypeLabel = computed(() => {
  // 注意：fileType 可能为 0，需要明确判断 undefined 或 null
  if (formData.fileType === undefined || formData.fileType === null) return '-'
  return FILE_TYPE_LABELS[formData.fileType as keyof typeof FILE_TYPE_LABELS] || '-'
})

// 显示详情
function showModel(row: DocumentResponse) {
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    userId: '',
    userName: '',
    studentNumber: '',
    topicId: '',
    topicTitle: '',
    fileType: 0,
    fileTypeDesc: '',
    originalFilename: '',
    fileSize: 0,
    fileSizeDisplay: '',
    fileExtension: '',
    reviewStatus: 0,
    reviewStatusDesc: '',
    reviewedAt: '',
    reviewerId: '',
    reviewerName: '',
    feedback: '',
    description: '',
    uploadedAt: '',
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
