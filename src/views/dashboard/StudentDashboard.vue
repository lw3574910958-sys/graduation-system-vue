<template>
  <div class="student-dashboard dashboard-container">
    <h2 class="dashboard-title">学生仪表盘</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-card">
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value" :class="{ 'text-warning': dashboardData.pendingDocuments > 0 }">
            {{ dashboardData.pendingDocuments || 0 }}
          </div>
          <div class="card-label">待提交文档</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-success">
            {{ dashboardData.approvedDocuments || 0 }}
          </div>
          <div class="card-label">已通过文档</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value">
            {{ dashboardData.submittedDocuments || 0 }} / {{ dashboardData.totalDocuments || 0 }}
          </div>
          <div class="card-label">已提交/总文档</div>
        </div>
      </el-card>
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value text-primary">
            {{ getCurrentStepLabel(dashboardData.currentStep) }}
          </div>
          <div class="card-label">当前阶段</div>
        </div>
      </el-card>
    </div>
    
    <!-- 流程进度 -->
    <div class="progress-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>毕业设计进度</span>
            <el-tag v-if="dashboardData.topicTitle" type="success" size="small">
              {{ dashboardData.topicTitle }}
            </el-tag>
          </div>
        </template>
        <div class="progress-content">
          <el-steps :active="(dashboardData.currentStep || 0) - 1" finish-status="success" align-center>
            <el-step title="选题" :description="getCurrentStepDescription(1)" />
            <el-step title="开题报告" :description="getCurrentStepDescription(2)" />
            <el-step title="中期检查" :description="getCurrentStepDescription(3)" />
            <el-step title="毕业论文" :description="getCurrentStepDescription(4)" />
            <el-step title="答辩" :description="getCurrentStepDescription(5)" />
          </el-steps>
        </div>
      </el-card>
    </div>
    
    <!-- 指导教师信息 -->
    <div class="teacher-section" v-if="dashboardData.teacherName">
      <el-card>
        <template #header>
          <span>指导教师</span>
        </template>
        <div class="teacher-content">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="教师姓名">
              {{ dashboardData.teacherName }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
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
import type { StudentDashboardResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { ElMessage } from 'element-plus'

// 仪表盘数据
const dashboardData = ref<StudentDashboardResponse>({
  pendingDocuments: 0,
  submittedDocuments: 0,
  approvedDocuments: 0,
  currentStep: 0,
  totalDocuments: 0
})

// 加载数据
const loading = ref(false)
const loadDashboardData = async () => {
  try {
    loading.value = true
    const res = await dashboardApi.getStudentDashboard()
    dashboardData.value = res.data as StudentDashboardResponse
  } catch (error: any) {
    ElMessage.error(error.message || '加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 获取步骤标签
const getCurrentStepLabel = (step: number) => {
  const labels: Record<number, string> = {
    0: '未选题',
    1: '已选题',
    2: '开题中',
    3: '中期检查',
    4: '论文撰写',
    5: '准备答辩'
  }
  return labels[step] || '未知'
}

// 获取步骤说明
const getCurrentStepDescription = (step: number) => {
  const descriptions: Record<number, string> = {
    1: '确认选题',
    2: '提交开题报告',
    3: '提交中期报告',
    4: '提交毕业论文',
    5: '参加答辩'
  }
  return descriptions[step] || ''
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.progress-section,
.teacher-section,
.notice-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-content {
  padding: 20px 0;
}

.teacher-content {
  padding: 10px 0;
}

.notice-content {
  min-height: 150px;
}
</style>