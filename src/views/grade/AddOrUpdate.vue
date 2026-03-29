<template>
  <el-dialog v-model="visible" :title="!formData.id ? '新增成绩信息' : '修改成绩信息'" width="60%">
    <el-form :rules="rules" :model="formData" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学生学号" prop="studentNumber">
            <el-input v-model="formData.studentNumber" placeholder="请输入学生学号" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="学生姓名" prop="studentName">
            <el-input v-model="formData.studentName" placeholder="请输入学生姓名" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课题标题" prop="topicTitle">
            <el-input v-model="formData.topicTitle" placeholder="请输入课题标题" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="成绩类型" prop="gradeType">
            <el-select v-model="formData.gradeType" placeholder="请选择成绩类型" style="width: 100%">
              <el-option label="开题报告教师评分" :value="1" />
              <el-option label="中期报告教师评分" :value="2" />
              <el-option label="毕业论文教师评分" :value="3" />
              <el-option label="综合成绩" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="成绩分数" prop="score">
            <el-input-number
              v-model="formData.score"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.5"
              placeholder="请输入成绩 (0-100)"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="评语" prop="comment">
            <el-input v-model="formData.comment" placeholder="请输入评语" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-alert
        title="注意事项"
        type="info"
        :closable="false"
        style="margin-top: 10px"
      >
        <ul style="padding-left: 20px; margin: 5px 0">
          <li>综合成绩会根据已录入的单项成绩自动计算</li>
          <li>成绩类型一旦录入后不可修改</li>
          <li>每个学生的每个课题每种成绩类型只能录入一次</li>
        </ul>
      </el-alert>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button type="primary" @click="onSubmit()" :loading="btnLoading"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { gradeApi } from '@/api/grade'
import { ElMessage } from 'element-plus'
import { MESSAGE } from '@/constants/user'

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
function showModel(row?: any) {
  if (row) {
    Object.assign(formData, row)
  } else {
    Object.assign(formData, formDefault)
  }
  visible.value = true
}

// 提交表单
async function onSubmit() {
  formRef.value
    .validate()
    .then(async () => {
      try {
        btnLoading.value = true
        // 实际应该调用后端 API 录入成绩，这里仅作演示
        // 真实场景需要传递 studentId, topicId, gradeType, score 等关键信息
        const submitData: any = {
          studentId: formData.studentId || undefined,
          topicId: formData.topicId || undefined,
          gradeType: formData.gradeType,
          score: formData.score,
          comment: formData.comment,
        }
        if (formData.id) {
          await gradeApi.update(formData.id, submitData)
        } else {
          await gradeApi.inputGrade(submitData)
        }
        ElMessage.success(`${!formData.id ? '新增' : '修改'}成绩信息成功`)
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
  studentNumber: [
    {
      required: true,
      message: '请输入学生学号',
      trigger: 'blur',
    },
  ],
  studentName: [
    {
      required: true,
      message: '请输入学生姓名',
      trigger: 'blur',
    },
  ],
  topicTitle: [
    {
      required: true,
      message: '请输入课题标题',
      trigger: 'blur',
    },
  ],
  gradeType: [
    {
      required: true,
      message: '请选择成绩类型',
      trigger: 'change',
    },
  ],
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
