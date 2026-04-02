<template>
  <el-dialog v-model="visible" title="录入成绩" width="700px">
    <el-form :rules="rules" :model="formData" ref="formRef" label-width="100px" class="unified-form">
      <!-- 只读信息区域 -->
      <div class="info-section">
        <div class="section-title">
          <el-icon><InfoFilled /></el-icon>
          <span>基本信息</span>
        </div>
        <el-descriptions :column="2" border size="default" class="info-descriptions">
          <el-descriptions-item label="学生学号">
            {{ formData.studentNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="学生姓名">
            {{ formData.studentName }}{{ formData.studentNumber ? ' - ' + formData.studentNumber : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="课题标题" :span="2">
            {{ formData.topicTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="成绩类型" :span="2">
            <el-tag :type="getGradeTypeTag(formData.gradeType)" size="default">
              {{ GRADE_TYPE_LABELS[formData.gradeType as keyof typeof GRADE_TYPE_LABELS] || '未知类型' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 可编辑区域：仅成绩和评语 -->
      <div class="form-section">
        <div class="section-title">
          <el-icon><Edit /></el-icon>
          <span>成绩录入</span>
        </div>
        <div class="form-grid">
          <el-form-item label="成绩分数" prop="score">
            <el-input-number
              v-model="formData.score"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.5"
              placeholder="请输入成绩 (0-100)"
              style="width: 100%"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="评语" class="full-width">
            <el-input
              v-model="formData.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入评语（可选）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>
      </div>

      <!-- 注意事项 -->
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="notice-alert"
      >
        <ul class="notice-list">
          <li>首次录入成绩，录入后不允许修改</li>
          <li>成绩类型一旦录入后不可修改</li>
          <li>每个学生的每个课题每种成绩类型只能录入一次</li>
        </ul>
      </el-alert>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button type="primary" @click="onSubmit()" :loading="btnLoading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { gradeApi } from '@/api/grade'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import { InfoFilled, Edit } from '@element-plus/icons-vue'
import { GRADE_TYPE_LABELS } from '@/constants/enums'

// 获取成绩类型对应的 Tag 类型
function getGradeTypeTag(gradeType: number | undefined): 'success' | 'warning' | 'primary' | 'danger' | 'info' {
  if (gradeType === undefined || gradeType === null) return 'info'
  // 成绩类型枚举值：0-开题报告，1-中期报告，2-毕业论文，3-综合成绩
  const tagMap: Record<number, 'success' | 'warning' | 'primary' | 'danger' | 'info'> = {
    0: 'success',    // 开题报告
    1: 'warning',    // 中期报告
    2: 'primary',    // 毕业论文
    3: 'danger',     // 综合成绩
  }
  return tagMap[gradeType] || 'info'
}

// 暴露方法给父组件调用
defineExpose({
  showModel,
  onCancel,
})

// 控制对话框显示与否
const visible = ref(false)
// 按钮加载状态
const btnLoading = ref(false)
// 触发自定义事件
const emit = defineEmits(['refreshList'])

// 表单组件
const formRef = ref()

// 表单初始值
const formDefault = {
  id: undefined,
  studentId: undefined,
  studentNumber: '',
  studentName: '',
  topicId: undefined,
  topicTitle: '',
  gradeType: 1, // 默认指导教师评分
  score: 0,
  comment: '',
}

// 表单数据
const formData = reactive({ ...formDefault })

// 显示对话框
function showModel(row: any) {
  Object.assign(formData, row)
  visible.value = true
}

// 提交表单
async function onSubmit() {
  // 禁止录入综合成绩
  if (formData.gradeType === 3) {
    ElMessage.error('综合成绩由系统自动计算生成，不允许手动录入')
    return
  }
  
  formRef.value
    .validate()
    .then(async () => {
      try {
        btnLoading.value = true
        // 首次录入成绩（使用 inputGrade 接口）
        // 需要传递 studentId, topicId, score, comment, gradeType
        const submitData: any = {
          studentId: formData.studentId,
          topicId: formData.topicId,
          score: formData.score,
          comment: formData.comment,
          gradeType: formData.gradeType,
        }
        await gradeApi.inputGrade(submitData)
        ElMessage.success('录入成绩信息成功')
        visible.value = false
        emit('refreshList')
      } catch (e) {
        console.error('Failed to submit form:', e)
        ElMessage.error(MESSAGE.SUBMIT_FAILED)
      } finally {
        btnLoading.value = false
      }
    })
    .catch(() => {
      // 表单验证失败，el-form 已显示错误提示
    })
}

// 取消按钮
function onCancel() {
  formRef.value?.clearValidate()
  visible.value = false
}

// 表单校验规则
const rules = reactive({
  score: [
    {
      required: true,
      message: '请输入成绩',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 100,
      message: '成绩必须在 0-100 之间',
      trigger: 'blur',
    },
  ],
})
</script>

<style scoped>
/* 统一表单样式 */
.unified-form :deep(.el-input),
.unified-form :deep(.el-select),
.unified-form :deep(.el-textarea),
.unified-form :deep(.el-input-number) {
  width: 100%;
}

.unified-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

/* 信息展示区域样式 */
.info-section {
  margin-bottom: 24px;
}

/* 表单分区样式 */
.form-section {
  margin-bottom: 24px;
}

/* 分区标题样式 */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409EFF;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

/* 全宽字段独占一行 */
.form-grid .full-width {
  grid-column: 1 / -1;
}

/* 响应式：小屏幕时变为单列 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 优化 descriptions 组件样式 */
.info-descriptions :deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 500;
  color: #606266;
}

.info-descriptions :deep(.el-descriptions__content) {
  color: #303133;
}

/* 注意事项样式优化 */
.notice-alert {
  margin-top: 20px;
  background-color: #fdf6ec;
}

.notice-list {
  padding-left: 20px;
  margin: 8px 0;
}

.notice-list li {
  margin-bottom: 6px;
  line-height: 1.6;
  color: #e6a23c;
}

.notice-list li:last-child {
  margin-bottom: 0;
}

/* 页脚按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
