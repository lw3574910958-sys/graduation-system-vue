<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑过程记录' : '新增过程记录'"
    width="600px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>
      
      <el-form-item label="学生ID" prop="studentId">
        <el-input-number v-model="form.studentId" :min="1" class="w-100" placeholder="请输入学生ID" />
      </el-form-item>
      
      <el-form-item label="学生姓名" prop="studentName">
        <el-input v-model="form.studentName" placeholder="请输入学生姓名" />
      </el-form-item>
      
      <el-form-item label="课题ID" prop="topicId">
        <el-input-number v-model="form.topicId" :min="1" class="w-100" placeholder="请输入课题ID" />
      </el-form-item>
      
      <el-form-item label="课题" prop="topicTitle">
        <el-input v-model="form.topicTitle" placeholder="请输入课题" />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入描述" 
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" class="w-100">
          <el-option label="待提交" value="pending" />
          <el-option label="进行中" value="in-progress" />
          <el-option label="已完成" value="completed" />
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

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { processApi } from '@/api/process'
import { ElMessage } from 'element-plus'

// 表单数据结构
interface ProcessForm {
  id?: number
  title: string
  studentId: number
  studentName: string
  topicId: number
  topicTitle: string
  status: string
  description: string
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

// 表单引用
const formRef = ref()

// 表单数据
const form = ref<ProcessForm>({
  title: '',
  studentId: 0,
  studentName: '',
  topicId: 0,
  topicTitle: '',
  status: 'pending',
  description: ''
})

// 是否为编辑模式
const isEdit = ref(false)

// 表单验证规则
const rules = reactive({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  topicTitle: [
    { required: true, message: '请输入课题', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 显示对话框
function showModel(row?: any) {
  if (row) {
    Object.assign(form.value, row)
    isEdit.value = true
  } else {
    Object.assign(form.value, { 
      title: '', 
      studentId: 0,
      studentName: '', 
      topicId: 0,
      topicTitle: '', 
      status: 'pending',
      description: ''
    })
    isEdit.value = false
  }
  visible.value = true
}

// 提交表单
async function onSubmit() {
  try {
    btnLoading.value = true
    
    const formData = { ...form.value }
    let response
    
    if (isEdit.value && formData.id) {
      // 更新操作
      response = await processApi.update(formData.id, formData)
    } else {
      // 创建操作
      response = await processApi.create(formData)
    }
    
    if (response?.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      visible.value = false
      emit('refreshList')
    } else {
      ElMessage.error(response?.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error(isEdit.value ? '更新过程记录失败:' : '创建过程记录失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    btnLoading.value = false
  }
}

// 取消
function onCancel() {
  visible.value = false
}

// 表单验证
function validate() {
  return formRef.value?.validate() || Promise.reject()
}
</script>

<style scoped>
/* 使用 global.less 中的 dialog-footer 样式 */
</style>