<template>
  <div class="user-detail-dialog">
    <el-dialog
      v-model="dialogVisible"
      title="用户详情"
      width="800px"
      :close-on-click-modal="false"
      @closed="handleClosed"
    >
      <!-- 用户基本信息 -->
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="用户名">{{ userData.username }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ userData.realName }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="getUserTypeTag(userData.userType)">
            {{ getUserTypeLabel(userData.userType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userData.status === 1 ? 'success' : 'danger'">
            {{ userData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 学生详细信息 -->
      <el-divider content-position="left">🎓 学生信息</el-divider>
      <el-descriptions :column="2" border v-if="userData.userType === 'student' && studentDetail">
        <el-descriptions-item label="学号">{{ studentDetail.studentId }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ studentDetail.gender === 1 ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="专业">{{ studentDetail.major }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ studentDetail.className }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">
          {{ getDepartmentName(studentDetail.departmentId) }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ studentDetail.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ studentDetail.phone || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 教师详细信息 -->
      <el-divider content-position="left">👨‍🏫 教师信息</el-divider>
      <el-descriptions :column="2" border v-if="userData.userType === 'teacher' && teacherDetail">
        <el-descriptions-item label="工号">{{ teacherDetail.teacherId }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ teacherDetail.gender === 1 ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="职称">{{ teacherDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">
          {{ getDepartmentName(teacherDetail.departmentId) }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ teacherDetail.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ teacherDetail.phone || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 管理员详细信息 -->
      <el-divider content-position="left">🔧 管理员信息</el-divider>
      <el-descriptions :column="2" border v-if="userData.userType === 'admin' && adminDetail">
        <el-descriptions-item label="管理员编号">{{ adminDetail.adminId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色级别">
          <el-tag :type="adminDetail.roleLevel === 0 ? 'danger' : 'primary'">
            {{ adminDetail.roleLevelDesc || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属院系" :span="2">
          {{ adminDetail.departmentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ adminDetail.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ adminDetail.email || '-' }}
        </el-descriptions-item>
      </el-descriptions>


      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { userApi } from '@/api/user'
import { studentApi } from '@/api/student'
import { teacherApi } from '@/api/teacher'
import { adminApi } from '@/api/admin'
import { departmentApi } from '@/api/department'
import type { UserResponse } from '@/types/api/user'
import type { StudentDetailResponse } from '@/types/api/student'
import type { TeacherDetailResponse } from '@/types/api/teacher'
import type { AdminDetailResponse } from '@/types/api/admin'
import { USER_TYPE_LABELS } from '@/constants/user'
import type { DepartmentResponse } from '@/types/api/department'

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<Emits>()

// 对话框可见性
const dialogVisible = ref(false)

// 用户数据
const userData = ref<UserResponse>({} as UserResponse)
const studentDetail = ref<StudentDetailResponse | null>(null)
const teacherDetail = ref<TeacherDetailResponse | null>(null)
const adminDetail = ref<AdminDetailResponse | null>(null)

// 加载状态
const loading = ref(false)

// 院系数据
const departments = ref<DepartmentResponse[]>([])

// 监听对话框打开
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 获取用户类型标签
const getUserTypeLabel = (userType: string) => {
  return USER_TYPE_LABELS[userType as keyof typeof USER_TYPE_LABELS] || userType
}

// 获取用户类型标签颜色
const getUserTypeTag = (userType: string) => {
  const tagMap: Record<string, any> = {
    student: 'primary',
    teacher: 'success',
    admin: 'warning'
  }
  return tagMap[userType] || 'info'
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取院系名称
const getDepartmentName = (departmentId?: number) => {
  if (!departmentId) return '-'
  const dept = departments.value.find(d => d.id === departmentId)
  return dept ? dept.name : '-'
}

// 加载用户详情
const loadUserDetail = async (userId: string) => {
  loading.value = true
  try {
    // 先清空之前的数据
    studentDetail.value = null
    teacherDetail.value = null
    adminDetail.value = null
    
    // 获取用户基本信息
    const userRes = await userApi.getUserById(userId)
    if (userRes.code === 200 && userRes.data) {
      userData.value = userRes.data
      
      // 加载院系数据
      await loadDepartments()
      
      // 根据用户类型获取详细信息
      if (userRes.data.userType === 'student') {
        const studentRes = await studentApi.getStudentByUserId(userId)
        if (studentRes.code === 200 && studentRes.data) {
          studentDetail.value = studentRes.data
        }
      } else if (userRes.data.userType === 'teacher') {
        const teacherRes = await teacherApi.getTeacherByUserId(userId)
        if (teacherRes.code === 200 && teacherRes.data) {
          teacherDetail.value = teacherRes.data
        }
      } else if (userRes.data.userType === 'admin') {
        const adminRes = await adminApi.getAdminByUserId(userId)
        if (adminRes.code === 200 && adminRes.data) {
          adminDetail.value = adminRes.data
        }
      }
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
  } finally {
    loading.value = false
  }
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
  userData.value = {} as UserResponse
  studentDetail.value = null
  teacherDetail.value = null
}

// 暴露方法给父组件
defineExpose({
  loadUserDetail
})
</script>

<style scoped>
.user-detail-dialog {
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
