<template>
  <div class="student-detail-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      :disabled="readonly"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学号" prop="studentId">
            <el-input
              v-model="formData.studentId"
              placeholder="请输入学号"
              :disabled="isEditMode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属院系" prop="departmentId">
            <el-select
              v-model="formData.departmentId"
              placeholder="请选择院系"
              style="width: 100%"
            >
              <el-option
                v-for="dept in departments"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio :label="0">女</el-radio>
              <el-radio :label="1">男</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="专业" prop="major">
            <el-input
              v-model="formData.major"
              placeholder="请输入专业"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="班级" prop="className">
            <el-input
              v-model="formData.className"
              placeholder="请输入班级"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div v-if="!readonly" class="form-actions">
      <el-button @click="onCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="onSubmit"
      >
        {{ isEditMode ? '更新' : '保存' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { studentApi } from '@/api/student'
import type { StudentDetailResponse, StudentCreateRequest, StudentUpdateRequest } from '@/types/api/student'

interface Props {
  userId?: number
  readonly?: boolean
}

interface Emits {
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  userId: props.userId,
  studentId: '',
  departmentId: undefined as number | undefined,
  gender: 1,
  major: '',
  className: '',
  phone: '',
  email: ''
})

// 院系数据（模拟数据，实际应该从API获取）
const departments = ref([
  { id: 1, name: '计算机学院' },
  { id: 2, name: '软件学院' },
  { id: 3, name: '信息学院' }
])

// 表单验证规则
const formRules: FormRules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]{6,20}$/, message: '学号格式不正确', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择院系', trigger: 'change' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 是否为编辑模式
const isEditMode = computed(() => !!formData.id)

// 初始化数据
const initData = async () => {
  if (props.userId) {
    try {
      const res = await studentApi.getStudentByUserId(props.userId)
      if (res.code === 200 && res.data) {
        Object.assign(formData, res.data)
      }
    } catch (error) {
      console.log('获取学生信息失败:', error)
    }
  }
}

// 提交表单
const onSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEditMode.value) {
          // 更新学生信息
          const updateData: StudentUpdateRequest = {
            studentId: formData.studentId,
            departmentId: formData.departmentId,
            gender: formData.gender,
            major: formData.major,
            className: formData.className,
            phone: formData.phone,
            email: formData.email
          }
          await studentApi.updateStudent(formData.id!, updateData)
          ElMessage.success('学生信息更新成功')
        } else {
          // 创建学生信息
          const createData: StudentCreateRequest = {
            userId: props.userId!,
            studentId: formData.studentId,
            departmentId: formData.departmentId!,
            gender: formData.gender,
            major: formData.major,
            className: formData.className,
            phone: formData.phone,
            email: formData.email
          }
          await studentApi.createStudent(createData)
          ElMessage.success('学生信息创建成功')
        }
        emit('success')
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 取消操作
const onCancel = () => {
  emit('cancel')
}

// 暴露方法
defineExpose({
  initData
})

onMounted(() => {
  initData()
})
</script>

<style scoped>
.student-detail-form {
  padding: 20px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.form-actions .el-button {
  min-width: 100px;
  margin: 0 10px;
}
</style>