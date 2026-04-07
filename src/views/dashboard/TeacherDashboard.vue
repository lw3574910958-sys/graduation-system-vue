<template>
  <div class="teacher-dashboard dashboard-container">
    <h2 class="dashboard-title">教师仪表盘</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-card">
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-value" :class="{ 'text-warning': dashboardData.pendingSelections > 0 }">
            {{ dashboardData.pendingSelections || 0 }}
          </div>
          <div class="card-label">待审核选题</div>
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
      <el-card class="card-item" shadow=   "hover">
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
                <span>待审核选题</span>
                <el-tag v-if="dashboardData.pendingSelections > 0" type="danger" size="small">
                  {{ dashboardData.pendingSelections }} 条
                </el-tag>
              </div>
            </template>
            <div class="todo-content">
              <el-empty v-if="!dashboardData.pendingSelections" description="暂无待审核选题" />
              <el-button v-else type="primary" size="small" @click="goToSelectionReview">
                前往审核
              </el-button>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>待审核文档</span>
                <el-tag v-if="dashboardData.pendingDocuments > 0" type="warning" size="small">
                  {{ dashboardData.pendingDocuments }} 条
                </el-tag>
              </div>
            </template>
            <div class="todo-content">
              <el-empty v-if="!dashboardData.pendingDocuments" description="暂无待审核文档" />
              <el-button v-else type="primary" size="small" @click="goToDocumentReview">
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
import type { TeacherDashboardResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { noticeApi } from '@/api/notice'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import NoticeSimpleDetail from '@/views/notice/NoticeSimpleDetail.vue'
import { SELECTION_STATUS, REVIEW_STATUS } from '@/constants/enums'

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
    const res = await dashboardApi.getTeacherDashboard()
    dashboardData.value = res.data as TeacherDashboardResponse
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

// 跳转到选题审核（传递待审核状态筛选参数）
const goToSelectionReview = () => {
  router.push({
    path: '/selection/list',
    query: {
      status: SELECTION_STATUS.PENDING_REVIEW // 使用枚举常量
    }
  })
}

// 跳转到文档审核（传递待审核状态筛选参数）
const goToDocumentReview = () => {
  router.push({
    path: '/document/list',
    query: {
      reviewStatus: REVIEW_STATUS.PENDING // 使用枚举常量，显示所有类型的待审核文档
    }
  })
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

.notice-card {
  cursor: pointer;
  transition: all 0.3s;
}

.notice-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>