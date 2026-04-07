<template>
  <div class="admin-dashboard dashboard-container">
    <h2 class="dashboard-title">{{ dashboardTitle }}</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-card">
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value" :class="{ 'text-warning': dashboardData.pendingTopics > 0 }">
            {{ dashboardData.pendingTopics || 0 }}
          </div>
          <div class="card-label">待审核题目</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-primary">
            {{ dashboardData.totalTopics || 0 }}
          </div>
          <div class="card-label">总课题数</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-success">
            {{ dashboardData.selectedStudents || 0 }}
          </div>
          <div class="card-label">已选题学生</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-info">
            {{ dashboardData.unselectedStudents || 0 }}
          </div>
          <div class="card-label">未选题学生</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-success">
            {{ dashboardData.totalStudents || 0 }}
          </div>
          <div class="card-label">学生总数</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-primary">
            {{ dashboardData.totalTeachers || 0 }}
          </div>
          <div class="card-label">教师总数</div>
        </div>
      </el-card>
      <el-card v-if="isSystemAdmin" class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-info">
            {{ dashboardData.totalDepartments || 0 }}
          </div>
          <div class="card-label">院系总数</div>
        </div>
      </el-card>
    </div>
    
    <!-- 选题进度 -->
    <div class="progress-section">
      <el-row :gutter="20">
        <!-- 选题进度统计 - 根据用户类型动态调整列数 -->
        <el-col :span="isDepartmentAdmin ? 12 : 24">
          <el-card>
            <template #header>
              <span>选题进度统计</span>
            </template>
            <div class="progress-content">
              <el-progress
                type="dashboard"
                :percentage="selectionProgressPercentage"
                :color="getProgressColor(selectionProgressPercentage)"
              />
              <div class="progress-label">
                已选题：{{ dashboardData.selectedStudents || 0 }} / {{ dashboardData.totalStudents || 0 }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 待办事项（仅院系管理员显示） -->
        <el-col :span="12" v-if="isDepartmentAdmin">
          <el-card>
            <template #header>
              <span>待办事项</span>
            </template>
            <div class="todo-content">
              <div class="todo-item">
                <span class="todo-label">待审核题目：</span>
                <el-tag v-if="dashboardData.pendingTopics > 0" type="danger" size="small">
                  {{ dashboardData.pendingTopics }} 条
                </el-tag>
                <span v-else class="text-muted">暂无</span>
              </div>
              <el-button 
                v-if="dashboardData.pendingTopics > 0" 
                type="primary" 
                size="small" 
                @click="goToTopicReview"
              >
                前往审核
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 数据可视化图表 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <grade-distribution-chart />
        </el-col>
        <el-col :span="12">
          <selection-progress-chart />
        </el-col>
      </el-row>
    </div>
    
    <!-- 通知公告（仅院系管理员显示） -->
    <div v-if="isDepartmentAdmin" class="notice-section">
      <el-card>
        <template #header>
          <span>通知公告</span>
        </template>
        <div class="notice-content">
          <el-empty v-if="!notices.length" description="暂无通知" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="notice in notices"
              :key="notice.id"
              :timestamp="formatDate(notice.createdAt)"
              placement="top"
              :color="getNoticeColor(notice.priority)"
              @dblclick="handleNoticeDoubleClick(notice)"
            >
              <el-card shadow="hover" class="notice-card">
                <h4>{{ notice.title }}</h4>
                <p>{{ notice.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 公告详情对话框 -->
    <NoticeSimpleDetail ref="noticeDetailRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AdminDashboardResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { noticeApi } from '@/api/notice'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { USER_TYPE_ENUM, TOPIC_STATUS } from '@/constants'
import GradeDistributionChart from '@/components/dashboard/GradeDistributionChart.vue'
import SelectionProgressChart from '@/components/dashboard/SelectionProgressChart.vue'
import NoticeSimpleDetail from '@/views/notice/NoticeSimpleDetail.vue'

const router = useRouter()
const authStore = useAuthStore()

// 获取当前用户类型
const userType = computed(() => authStore.userInfo?.userType)
const isSystemAdmin = computed(() => userType.value === USER_TYPE_ENUM.SYSTEM_ADMIN)
const isDepartmentAdmin = computed(() => userType.value === USER_TYPE_ENUM.DEPARTMENT_ADMIN)

// 动态标题
const dashboardTitle = computed(() => {
  if (isSystemAdmin.value) {
    return '系统管理员仪表盘'
  } else if (isDepartmentAdmin.value) {
    return '院系管理员仪表盘'
  }
  return '管理员仪表盘'
})

// 仪表盘数据
const dashboardData = ref<AdminDashboardResponse>({
  pendingTopics: 0,
  totalStudents: 0,
  totalTeachers: 0,
  selectedStudents: 0,
  unselectedStudents: 0,
  totalDepartments: 0,
  totalTopics: 0
})

// 通知公告数据（仅院系管理员需要）
const notices = ref<any[]>([])

// 公告详情对话框引用
const noticeDetailRef = ref()

// 双击公告打开详情
const handleNoticeDoubleClick = (notice: any) => {
  noticeDetailRef.value?.showModel(notice)
}

// 加载数据
const loading = ref(false)
const loadDashboardData = async () => {
  try {
    loading.value = true
    const res = await dashboardApi.getAdminDashboard()
    dashboardData.value = res.data as AdminDashboardResponse
  } catch (error: any) {
    ElMessage.error(error.message || '加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 获取通知公告（仅院系管理员需要）
const loadNotices = async () => {
  if (!isDepartmentAdmin.value) {
    return
  }
  try {
    const res = await noticeApi.getLatestNotices(undefined, 5)
    notices.value = res.data || []
  } catch (error: any) {
    console.error('加载通知公告失败:', error.message)
    notices.value = []
  }
}

// 跳转到题目审核（传递审核状态筛选参数）
const goToTopicReview = () => {
  // 传递审核状态：待审核
  router.push({
    path: '/topic/list',
    query: {
      reviewStatus: 'pending'
    }
  })
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取通知颜色
const getNoticeColor = (priority?: number) => {
  if (!priority) return '#409EFF'
  switch (priority) {
    case 1: return '#F56C6C' // 高优先级 - 红色
    case 2: return '#E6A23C' // 中优先级 - 橙色
    default: return '#409EFF' // 普通 - 蓝色
  }
}

// 计算选题进度百分比
const selectionProgressPercentage = computed(() => {
  const total = dashboardData.value.totalStudents || 0
  const selected = dashboardData.value.selectedStudents || 0
  if (total === 0) return 0
  return Math.round((selected / total) * 100)
})

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#F56C6C'
  if (percentage < 70) return '#E6A23C'
  return '#67C23A'
}

onMounted(() => {
  loadDashboardData()
  loadNotices()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card-item {
  cursor: pointer;
  transition: transform 0.3s;
}

.card-item:hover {
  transform: translateY(-5px);
}

.card-content {
  text-align: center;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.text-warning {
  color: #E6A23C !important;
}

.text-success {
  color: #67C23A !important;
}

.text-primary {
  color: #409EFF !important;
}

.text-info {
  color: #909399 !important;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.progress-label {
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.todo-content {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.todo-item {
  margin-bottom: 15px;
  font-size: 14px;
}

.todo-label {
  color: #606266;
}

.text-muted {
  color: #909399;
}

.notice-card {
  cursor: pointer;
  transition: all 0.3s;
}

.notice-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>