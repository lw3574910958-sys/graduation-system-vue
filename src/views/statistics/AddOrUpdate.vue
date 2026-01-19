<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑统计' : '新增统计'"
    width="600px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="统计名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入统计名称" />
      </el-form-item>
      
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
          <el-option label="计数" value="count" />
          <el-option label="百分比" value="percentage" />
          <el-option label="金额" value="amount" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="数值" prop="value">
        <el-input-number v-model="form.value" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入描述" 
        />
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
import { statisticsApi } from '@/api/statistics'
import { ElMessage } from 'element-plus'

// 表单数据结构
interface StatisticsForm {
  id?: number
  name: string
  type: string
  value: number
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
const form = ref<StatisticsForm>({
  name: '',
  type: 'count',
  value: 0,
  description: ''
})

// 是否为编辑模式
const isEdit = ref(false)

// 表单验证规则
const rules = reactive({
  name: [
    { required: true, message: '请输入统计名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入数值', trigger: 'blur' }
  ]
})

// 显示对话框
function showModel(row?: any) {
  if (row) {
    Object.assign(form.value, row)
    isEdit.value = true
  } else {
    Object.assign(form.value, { 
      name: '', 
      type: 'count', 
      value: 0, 
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
      response = await statisticsApi.update(formData.id, formData)
    } else {
      // 创建操作
      response = await statisticsApi.create(formData)
    }
    
    if (response?.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      visible.value = false
      emit('refreshList')
    } else {
      ElMessage.error(response?.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error(isEdit.value ? '更新统计失败:' : '创建统计失败:', error)
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