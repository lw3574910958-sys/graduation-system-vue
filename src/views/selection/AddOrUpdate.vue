<template>
  <el-dialog
    v-model="visible"
    :title="!formData.id ? '新增选题信息' : '修改选题信息'"
    width="50%"
  >
    <el-form :rules="rules" :model="formData" ref="formRef" label-width="100px">
      <el-form-item label="学生ID" prop="studentId">
        <el-input-number 
          v-model.number="formData.studentId" 
          :min="1" 
          style="width: 60%" 
          placeholder="请输入学生ID" 
        />
      </el-form-item>

      <el-form-item label="学生姓名" prop="studentName">
        <el-input v-model="formData.studentName" style="width: 60%" placeholder="请输入学生姓名" />
      </el-form-item>



      <el-form-item label="课题ID" prop="topicId">
        <el-input-number 
          v-model="formData.topicId" 
          :min="1" 
          style="width: 60%" 
          placeholder="请输入课题ID" 
        />
      </el-form-item>

      <el-form-item label="选题标题" prop="topicTitle">
        <el-input v-model="formData.topicTitle" style="width: 60%" placeholder="请输入选题标题" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 60%">
          <el-option label="待确认" :value="0" />
          <el-option label="已确认" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button
          type="primary"
          @click="onSubmit()"
          :loading="btnLoading"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { selectionApi } from '@/api/selection'
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
  studentId: 0,
  studentName: '',
  topicId: 0,
  topicTitle: '',

  status: 0,
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
        if (formData.id) {
          await selectionApi.update(formData.id, formData)
        } else {
          await selectionApi.create(formData)
        }
        ElMessage.success(`${!formData.id ? '新增' : '修改'}选题信息成功`)
        visible.value = false
        emit('refreshList')
      } catch (e) {
        console.error('Failed to submit form:', e)
        ElMessage.error(MESSAGE.SUBMIT_FAILED)
      } finally {
        btnLoading.value = false
      }
    })
    .catch((err: any) => {
      console.log('Form validation failed:', err)
    })
}

// 取消按钮
function onCancel() {
  formRef.value?.clearValidate()
  visible.value = false
}

// 表单校验规则
const rules = reactive({
  studentId: [
    {
      required: true,
      message: '请输入学生ID',
      trigger: 'blur',
    },
  ],
  topicId: [
    {
      required: true,
      message: '请输入课题ID',
      trigger: 'blur',
    },
  ],
  topicTitle: [
    {
      required: true,
      message: '请输入选题标题',
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
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'blur',
    },
  ],
})
</script>