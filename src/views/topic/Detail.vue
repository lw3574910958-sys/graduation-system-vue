<template>
  <el-dialog
    v-model="visible"
    title="课题详情"
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
        <!-- 题目标题 -->
        <el-form-item label="题目标题">
          <el-input v-model="formData.title" readonly />
        </el-form-item>

        <!-- 题目描述 -->
        <el-form-item label="题目描述" class="full-width">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            readonly
          />
        </el-form-item>

        <!-- 发布教师工号 -->
        <el-form-item label="发布教师工号">
          <el-input v-model="formData.teacherNumber" readonly />
        </el-form-item>

        <!-- 院系名称 -->
        <el-form-item label="院系名称">
          <el-input v-model="formData.departmentName" readonly />
        </el-form-item>

        <!-- 题目来源 -->
        <el-form-item label="题目来源">
          <el-input v-model="sourceLabel" readonly />
        </el-form-item>

        <!-- 题目类型 -->
        <el-form-item label="题目类型">
          <el-input v-model="typeLabel" readonly />
        </el-form-item>

        <!-- 题目性质 -->
        <el-form-item label="题目性质">
          <el-input v-model="natureLabel" readonly />
        </el-form-item>

        <!-- 人数限制 -->
        <el-form-item label="人数限制">
          <el-input v-model="formData.maxSelections" readonly />
        </el-form-item>

        <!-- 已选人数 -->
        <el-form-item label="已选人数">
          <el-input v-model="formData.selectedCount" readonly />
        </el-form-item>

        <!-- 预计难度 -->
        <el-form-item label="预计难度">
          <el-input v-model="difficultyLabel" readonly />
        </el-form-item>

        <!-- 预计工作量 -->
        <el-form-item label="预计工作量">
          <el-input v-model="workloadLabel" readonly />
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

<script lang="ts" setup name="TopicDetail">
import { ref, reactive, computed } from 'vue'
import type { TopicResponse } from '@/types/api/topic'
import {
  TOPIC_SOURCE_LABELS,
  TOPIC_TYPE_LABELS,
  TOPIC_NATURE_LABELS
} from '@/constants'

// 控制对话框显示与否
const visible = ref(false)

// 表单数据
const formData = reactive<TopicResponse>({
  id: 0,
  title: '',
  description: '',
  teacherId: 0,
  status: 0,
  departmentId: 0,
  source: '',
  type: '',
  nature: '',
  difficulty: 1,
  workload: 1,
  maxSelections: 1,
  selectedCount: 0,
  teacherNumber: '',
  departmentName: '',
})

// 计算属性：获取标签
const sourceLabel = computed(() => {
  if (!formData.source) return '-'
  // 如果后端返回的是中文，直接使用；如果是枚举值，需要转换
  return Object.values(TOPIC_SOURCE_LABELS).includes(formData.source as any)
    ? formData.source
    : TOPIC_SOURCE_LABELS[formData.source as keyof typeof TOPIC_SOURCE_LABELS] || '-'
})

const typeLabel = computed(() => {
  if (!formData.type) return '-'
  return Object.values(TOPIC_TYPE_LABELS).includes(formData.type as any)
    ? formData.type
    : TOPIC_TYPE_LABELS[formData.type as keyof typeof TOPIC_TYPE_LABELS] || '-'
})

const natureLabel = computed(() => {
  if (!formData.nature) return '-'
  return Object.values(TOPIC_NATURE_LABELS).includes(formData.nature as any)
    ? formData.nature
    : TOPIC_NATURE_LABELS[formData.nature as keyof typeof TOPIC_NATURE_LABELS] || '-'
})

// 计算属性：难度标签
const difficultyLabel = computed(() => {
  if (!formData.difficulty) return '-'
  const labels: Record<number, string> = {
    1: '简单',
    2: '适中',
    3: '困难',
    4: '很难',
    5: '极难'
  }
  return labels[formData.difficulty] || '-'
})

// 计算属性：工作量标签
const workloadLabel = computed(() => {
  if (!formData.workload) return '-'
  const labels: Record<number, string> = {
    1: '很少',
    2: '较少',
    3: '适中',
    4: '较多',
    5: '很多'
  }
  return labels[formData.workload] || '-'
})

// 显示详情
function showModel(row: TopicResponse) {
  // 重置表单数据
  Object.assign(formData, {
    id: 0,
    title: '',
    description: '',
    teacherId: 0,
    status: 0,
    departmentId: 0,
    source: '',
    type: '',
    nature: '',
    difficulty: 1,
    workload: 1,
    maxSelections: 1,
    selectedCount: 0,
    teacherNumber: '',
    departmentName: '',
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
