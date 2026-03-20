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
        <!-- 只有系统管理员才显示用户类型和状态 -->
        <template v-if="isSystemAdmin">
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
        </template>
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

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { userApi } from '@/api/user'
import { departmentApi } from '@/api/department'
import type { UserDetailsResponse } from '@/types/api/user'
import { USER_TYPE_LABELS } from '@/constants/user'
import type { DepartmentResponse } from '@/types/api/department'
import { useAuthStore } from '@/stores'
import { USER_TYPE_ENUM } from '@/constants/enums'

// 获取当前用户信息
const authStore = useAuthStore()

// 判断当前是否为系统管理员（只有系统管理员才能显示用户类型和状态）
const isSystemAdmin = computed(() => {
  return authStore.userInfo?.userType === USER_TYPE_ENUM.SYSTEM_ADMIN
})

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

// 用户数据
const userData = ref<UserDetailsResponse>({} as UserDetailsResponse)

// 加载状态
const loading = ref(false)

// 院系数据
const departments = ref<DepartmentResponse[]>([])

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  },
)

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
    system_admin: 'danger',
    department_admin: 'warning',
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

      // 加载院系数据
      await loadDepartments()
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
  userData.value = {} as UserDetailsResponse
}

// 暴露方法给父组件
defineExpose({
  loadUserDetail,
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
