<template>
  <div class="student-dashboard dashboard-container">
    <h2 class="dashboard-title">学生仪表盘</h2>
    
    <!-- 流程进度 -->
    <div class="progress-section">
      <el-card>
        <template #header>
          <span>毕业设计进度</span>
        </template>
        <div class="progress-content">
          <el-steps 
            :active="dashboardData.currentStep" 
            finish-status="success" 
            align-center
          >
            <el-step 
              title="选题" 
              :description="dashboardData.currentStep >= 1 ? '已确认选题' : '待选题'" 
            />
            <el-step 
              title="开题报告" 
              :description="getStepDescription(2, '开题报告')" 
            />
            <el-step 
              title="中期检查" 
              :description="getStepDescription(3, '中期检查')" 
            />
            <el-step 
              title="毕业论文" 
              :description="getStepDescription(4, '毕业论文')" 
            />
          </el-steps>
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
import { ref, onMounted } from 'vue'
import type { StudentDashboardResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { noticeApi } from '@/api/notice'
import { ElMessage } from 'element-plus'
import NoticeSimpleDetail from '@/views/notice/NoticeSimpleDetail.vue'

// 仪表盘数据
const dashboardData = ref<StudentDashboardResponse>({
  currentStep: 0
})

// 通知公告数据
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
    const res = await dashboardApi.getStudentDashboard()
    dashboardData.value = res.data as StudentDashboardResponse
  } catch (error: any) {
    ElMessage.error(error.message || '加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 获取通知公告（调用公告 API）
const loadNotices = async () => {
  try {
    const res = await noticeApi.getLatestNotices(undefined, 5)
    notices.value = res.data || []
  } catch (error: any) {
    console.error('加载通知公告失败:', error.message)
    notices.value = []
  }
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

// 获取步骤描述
const getStepDescription = (step: number, stepName: string) => {
  const currentStep = dashboardData.value.currentStep || 0
  if (currentStep >= step) {
    return '已通过'  // 已完成
  } else if (currentStep === step - 1) {
    return `待提交${stepName}`  // 当前可进行
  } else {
    return ''  // 尚未到达，不显示描述
  }
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-content {
  padding: 20px 0;
}

.progress-section,
.notice-section {
  margin-bottom: 20px;
}

.notice-content {
  min-height: 150px;
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