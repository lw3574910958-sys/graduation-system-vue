<template>
  <div class="admin-dashboard dashboard-container">
    <h2 class="dashboard-title">管理员仪表盘</h2>
    
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
      <el-card class="card-item" shadow="hover">
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
        <el-col :span="12">
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
        
        <el-col :span="12">
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
    <div class="notice-section">
      <el-card>
        <template #header>
          <span>通知公告</span>
        </template>
        <div class="notice-content">
          <el-empty description="暂无通知" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AdminDashboardResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import GradeDistributionChart from '@/components/dashboard/GradeDistributionChart.vue'
import SelectionProgressChart from '@/components/dashboard/SelectionProgressChart.vue'

const router = useRouter()

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

// 跳转到题目审核
const goToTopicReview = () => {
  router.push('/topics')
}

onMounted(() => {
  loadDashboardData()
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

.notice-section {
  margin-bottom: 20px;
}

.notice-content {
  min-height: 150px;
}
</style>