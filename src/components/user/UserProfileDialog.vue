<template>
  <div class="user-profile-dialog">
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑个人信息' : '个人信息'"
      width="800px"
      :close-on-click-modal="false"
      @closed="handleClosed"
    >
      <!-- 查看模式：使用 el-descriptions -->
      <template v-if="!isEditMode">
        <!-- 用户基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="用户名">{{ userData.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ userData.realName }}</el-descriptions-item>
        </el-descriptions>

        <!-- 学生详细信息 -->
        <template v-if="userData.userType === 'student'">
          <el-divider content-position="left">🎓 学生信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学号">{{ userData.studentId }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ userData.gender === 1 ? '男' : '女' }}
            </el-descriptions-item>
            <el-descriptions-item label="专业">{{ userData.major }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ userData.className }}</el-descriptions-item>
            <el-descriptions-item label="所属院系">
              {{ getDepartmentName(userData.departmentId) }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userData.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userData.phone || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 教师详细信息 -->
        <template v-if="userData.userType === 'teacher'">
          <el-divider content-position="left">👨‍🏫 教师信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="工号">{{ userData.teacherId }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ userData.gender === 1 ? '男' : '女' }}
            </el-descriptions-item>
            <el-descriptions-item label="职称">{{ userData.title }}</el-descriptions-item>
            <el-descriptions-item label="所属院系">
              {{ getDepartmentName(userData.departmentId) }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userData.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userData.phone || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 管理员详细信息 -->
        <template v-if="userData.userType === 'system_admin' || userData.userType === 'department_admin'">
          <el-divider content-position="left">🔧 管理员信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="管理员编号">{{
              userData.adminId || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="角色级别">
              <el-tag :type="userData.roleLevel === 0 ? 'danger' : 'primary'">
                {{ userData.roleLevel === 0 ? '系统管理员' : '院系管理员' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="userData.userType !== 'system_admin'" label="所属院系" :span="2">
              {{ getDepartmentName(userData.departmentId) }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userData.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userData.email || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </template>

      <!-- 编辑模式：使用 el-form -->
      <template v-else>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
          </el-form-item>

          <!-- 学生特有字段 -->
          <template v-if="userData.userType === 'student'">
            <el-form-item label="学号" prop="studentId">
              <el-input v-model="formData.studentId" placeholder="请输入学号" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择性别">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="专业" prop="major">
              <el-input v-model="formData.major" placeholder="请输入专业名称" />
            </el-form-item>
            <el-form-item label="班级" prop="className">
              <el-input v-model="formData.className" placeholder="请输入班级" />
            </el-form-item>
            <el-form-item v-if="departments.length > 0 && userData.departmentId" label="所属院系" prop="departmentId">
              <el-select v-model="formData.departmentId" placeholder="请选择院系" clearable>
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </template>

          <!-- 教师特有字段 -->
          <template v-if="userData.userType === 'teacher'">
            <el-form-item label="工号" prop="teacherId">
              <el-input v-model="formData.teacherId" placeholder="请输入工号" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择性别">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="职称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入职称" />
            </el-form-item>
            <el-form-item v-if="departments.length > 0 && userData.departmentId" label="所属院系" prop="departmentId">
              <el-select v-model="formData.departmentId" placeholder="请选择院系" clearable>
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </template>

          <!-- 管理员特有字段 -->
          <template v-if="userData.userType === 'system_admin' || userData.userType === 'department_admin'">
            <el-form-item label="管理员编号">
              <el-input v-model="formData.adminId" readonly disabled />
            </el-form-item>
            <el-form-item v-if="userData.userType !== 'system_admin' && departments.length > 0 && userData.departmentId" label="所属院系">
              <el-select v-model="formData.departmentId" readonly disabled placeholder="请选择院系" clearable>
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </template>
        </el-form>
      </template>

      <template #footer>
        <template v-if="isEditMode">
          <el-button @click="handleSubmit" type="primary" :loading="submitLoading">保存</el-button>
          <el-button @click="isEditMode = false">取消</el-button>
        </template>
        <template v-else>
          <el-button @click="isEditMode = true" type="primary">修改</el-button>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { userApi } from '@/api/user'
import { departmentApi } from '@/api/department'
import type { UserDetailsResponse, UserUpdateRequest } from '@/types/api/user'
import type { DepartmentResponse } from '@/types/api/department'
import { useAuthStore } from '@/stores'
import { ElMessage } from 'element-plus'

// 获取当前用户信息
const authStore = useAuthStore()

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<Emits>()

// 对话框可见性
const dialogVisible = ref(false)

// 编辑模式
const isEditMode = ref(false)

// 用户数据
const userData = ref<UserDetailsResponse>({} as UserDetailsResponse)

// 表单数据
const formData = ref<Partial<UserUpdateRequest>>({})

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)

// 提交状态
const submitLoading = ref(false)

// 院系数据
const departments = ref<DepartmentResponse[]>([])

// 表单验证规则
const formRules = reactive({
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
})

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  },
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  // 打开对话框时加载当前用户详情
  if (val && authStore.userInfo?.id) {
    loadUserDetail(authStore.userInfo.id)
  }
})

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取院系名称
const getDepartmentName = (departmentId?: number) => {
  if (!departmentId) return '-'
  const dept = departments.value.find((d) => d.id === departmentId)
  return dept ? dept.name : '-'
}

// 加载用户详情
const loadUserDetail = async (userId: string) => {
  loading.value = true
  try {
    // 获取用户基本信息
    const userRes = await userApi.getUserByUserId(userId)
    if (userRes.code === 200 && userRes.data) {
      userData.value = userRes.data
      // 初始化表单数据
      initFormData()
      // 加载院系数据
      await loadDepartments()
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化表单数据
const initFormData = () => {
  formData.value = {
    realName: userData.value.realName,
    email: userData.value.email,
    phone: userData.value.phone,
    departmentId: userData.value.departmentId,
    // 学生特有字段
    studentId: userData.value.studentId,
    gender: userData.value.gender,
    major: userData.value.major,
    className: userData.value.className,
    // 教师特有字段
    teacherId: userData.value.teacherId,
    title: userData.value.title,
    // 管理员特有字段
    adminId: userData.value.adminId
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      if (!authStore.userInfo?.id) {
        ElMessage.error('未获取到用户 ID')
        return
      }
      
      const updateData: Partial<UserUpdateRequest> = {
        realName: formData.value.realName,
        email: formData.value.email,
        phone: formData.value.phone,
        departmentId: formData.value.departmentId,
        userType: userData.value.userType, // 必须传递用户类型
        status: userData.value.status, // 必须传递状态
      }
      
      // 根据用户类型添加特有字段
      if (userData.value.userType === 'student') {
        updateData.studentId = formData.value.studentId
        updateData.gender = formData.value.gender
        updateData.major = formData.value.major
        updateData.className = formData.value.className
      } else if (userData.value.userType === 'teacher') {
        updateData.teacherId = formData.value.teacherId
        updateData.gender = formData.value.gender
        updateData.title = formData.value.title
      } else if (userData.value.userType === 'system_admin' || userData.value.userType === 'department_admin') {
        updateData.adminId = formData.value.adminId
      }
      
      const res = await userApi.updateUser(authStore.userInfo.id, updateData)
      if (res.code === 200) {
        ElMessage.success('保存成功')
        isEditMode.value = false
        // 重新加载用户数据
        await loadUserDetail(authStore.userInfo.id)
        // 更新 store 中的用户信息
        await authStore.fetchUserInfo()
      }
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 加载院系数据
const loadDepartments = async () => {
  try {
    const res = await departmentApi.getAllDepartments()
    if (res.code === 200 && res.data) {
      departments.value = res.data
    }
  } catch (error) {
    console.error('加载院系数据失败:', error)
  }
}

// 关闭对话框后的清理
const handleClosed = () => {
  userData.value = {} as UserDetailsResponse
  formData.value = {}
  isEditMode.value = false
}

// 暴露方法给父组件
defineExpose({
  loadUserDetail,
})
</script>

<style scoped>
.user-profile-dialog {
  .el-descriptions {
    margin-bottom: 20px;
  }

  .el-divider {
    margin: 20px 0;
  }

  .el-tag {
    min-width: 60px;
    text-align: center;
  }
}
</style>
