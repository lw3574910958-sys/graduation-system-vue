<template>
  <div class="teacher-dashboard dashboard-container">
    <h2 class="dashboard-title">教师仪表盘</h2>
    
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
          <div class="card-label">发布课题总数</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value" :class="{ 'text-warning': dashboardData.pendingSelections > 0 }">
            {{ dashboardData.pendingSelections || 0 }}
          </div>
          <div class="card-label">待审核选题申请</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value" :class="{ 'text-warning': dashboardData.pendingDocuments > 0 }">
            {{ dashboardData.pendingDocuments || 0 }}
          </div>
          <div class="card-label">待审核文档</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-success">
            {{ dashboardData.confirmedSelections || 0 }}
          </div>
          <div class="card-label">已确认选题</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-info">
            {{ dashboardData.totalStudents || 0 }}
          </div>
          <div class="card-label">指导学生总数</div>
        </div>
      </el-card>
    </div>
    
    <!-- 待办事项 -->
    <div class="todo-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>待审核题目</span>
                <el-tag v-if="dashboardData.pendingTopics > 0" type="danger" size="small">
                  {{ dashboardData.pendingTopics }} 条
                </el-tag>
              </div>
            </template>
            <div class="todo-content">
              <el-empty v-if="!dashboardData.pendingTopics" description="暂无待审核题目" />
              <el-button v-else type="primary" size="small" @click="goToTopicReview">
                前往审核
              </el-button>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>待审核选题申请</span>
                <el-tag v-if="dashboardData.pendingSelections > 0" type="warning" size="small">
                  {{ dashboardData.pendingSelections }} 条
                </el-tag>
              </div>
            </template>
            <div class="todo-content">
              <el-empty v-if="!dashboardData.pendingSelections" description="暂无待审核申请" />
              <el-button v-else type="primary" size="small" @click="goToSelectionReview">
                前往审核
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 通知公告 -->
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
import { ref, onMounted } from 'vue'
import type { TeacherDashboardResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 仪表盘数据
const dashboardData = ref<TeacherDashboardResponse>({
  pendingTopics: 0,
  totalTopics: 0,
  pendingSelections: 0,
  pendingDocuments: 0,
  totalStudents: 0,
  confirmedSelections: 0
})

// 加载数据
const loading = ref(false)
const loadDashboardData = async () => {
  try {
    loading.value = true
    const res = await dashboardApi.getTeacherDashboard()
    dashboardData.value = res.data as TeacherDashboardResponse
  } catch (error: any) {
    ElMessage.error(error.message || '加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 跳转到题目审核
const goToTopicReview = () => {
  router.push('/topics')
}

// 跳转到选题审核
const goToSelectionReview = () => {
  router.push('/selections')
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.todo-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-content {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.notice-section {
  margin-bottom: 20px;
}

.notice-content {
  min-height: 150px;
}
</style>