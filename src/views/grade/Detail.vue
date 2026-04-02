<template>
  <el-dialog
    v-model="visible"
    title="成绩详情"
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
        <!-- 学生姓名 -->
        <el-form-item label="学生姓名">
          <el-input v-model="formData.studentName" readonly />
        </el-form-item>

        <!-- 学号 -->
        <el-form-item label="学号">
          <el-input v-model="formData.studentNumber" readonly />
        </el-form-item>

        <!-- 课题标题 -->
        <el-form-item label="课题标题" class="full-width">
          <el-input v-model="formData.topicTitle" readonly />
        </el-form-item>

        <!-- 成绩类型 -->
        <el-form-item label="成绩类型">
          <el-input v-model="gradeTypeLabel" readonly />
        </el-form-item>

        <!-- 成绩分数（已评分时显示） -->
        <el-form-item v-if="isGraded" label="成绩分数">
          <el-input v-model="scoreDisplay" readonly />
        </el-form-item>

        <!-- 成绩等级（已评分时显示） -->
        <el-form-item v-if="isGraded" label="成绩等级">
          <el-input v-model="gradeLevelLabel" readonly />
        </el-form-item>

        <!-- 绩点（已评分时显示） -->
        <el-form-item v-if="isGraded" label="绩点">
          <el-input v-model="gpaDisplay" readonly />
        </el-form-item>

        <!-- 评分教师姓名（仅院系管理员和系统管理员显示） -->
        <el-form-item 
          v-if="canSeeGraderInfo" 
          label="评分教师"
        >
          <el-input v-model="graderDisplay" readonly />
        </el-form-item>

        <!-- 评分时间（已评分时显示） -->
        <el-form-item v-if="isGraded" label="评分时间">
          <el-input v-model="formData.gradedAt" readonly />
        </el-form-item>

        <!-- 评语（已评分时显示） -->
        <el-form-item v-if="isGraded" label="评语" class="full-width">
          <el-input
            v-model="formData.comment"
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

<script lang="ts" setup name="GradeDetail">
import { ref, reactive, computed } from 'vue'
import type { GradeResponse } from '@/types/api/grade'
import { GRADE_TYPE_LABELS, USER_TYPE_ENUM } from '@/constants/enums'
import { useAuthStore } from '@/stores/modules/auth'

// 控制对话框显示与否
const visible = ref(false)

// 获取用户信息
const authStore = useAuthStore()
const userType = computed(() => authStore.userInfo?.userType || '')
const canSeeGraderInfo = computed(() => 
  userType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN || 
  userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN
)

// 表单数据
const formData = reactive<GradeResponse>({
  id: '',
  studentId: '',
  studentName: '',
  studentNumber: '',
  topicId: '',
  topicTitle: '',
  graderId: '',
  graderName: '',
  gradeType: undefined,
  gradeTypeDesc: '',
  score: undefined,
  gradeLevel: '',
  gpa: undefined,
  comment: '',
  passing: false,
  excellent: false,
  gradedAt: '',
  createdAt: '',
  updatedAt: '',
})

// 计算属性：是否已评分（判断是否显示评分相关字段）
const isGraded = computed(() => {
  // 判断标准：分数存在且大于 0，同时有评语，说明已经评分
  // 注意：后端 score 可以为 null/undefined，需要同时判断
  return formData.score !== null && 
         formData.score !== undefined && 
         formData.comment !== null && 
         formData.comment !== undefined &&
         formData.comment.trim() !== ''
})

// 计算属性：成绩类型标签
const gradeTypeLabel = computed(() => {
  if (formData.gradeType === undefined || formData.gradeType === null) return '-'
  return GRADE_TYPE_LABELS[formData.gradeType as keyof typeof GRADE_TYPE_LABELS] || '-'
})

// 计算属性：成绩分数显示
const scoreDisplay = computed(() => {
  if (formData.score === null || formData.score === undefined) return '-'
  return typeof formData.score === 'number' ? formData.score.toFixed(2) : String(formData.score)
})

// 计算属性：成绩等级标签
const gradeLevelLabel = computed(() => {
  if (!formData.gradeLevel) return '-'
  return formData.gradeLevel
})

// 计算属性：绩点显示
const gpaDisplay = computed(() => {
  if (formData.gpa === null || formData.gpa === undefined) return '-'
  return typeof formData.gpa === 'number' ? formData.gpa.toFixed(2) : formData.gpa
})

// 计算属性：评分教师显示（格式：姓名 - 工号）
const graderDisplay = computed(() => {
  if (!formData.graderName && !formData.graderWorkNumber) return '-'
  // 优先显示姓名，如果没有姓名则显示工号
  if (formData.graderName && formData.graderWorkNumber) {
    return `${formData.graderName} - ${formData.graderWorkNumber}`
  }
  if (formData.graderName) {
    return formData.graderName
  }
  return formData.graderWorkNumber || '-'
})

// 显示详情
function showModel(row: GradeResponse) {
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    studentId: '',
    studentName: '',
    studentNumber: '',
    topicId: '',
    topicTitle: '',
    graderId: '',
    graderName: '',
    gradeType: undefined,
    gradeTypeDesc: '',
    score: undefined,
    gradeLevel: '',
    gpa: undefined,
    comment: '',
    passing: false,
    excellent: false,
    gradedAt: '',
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
