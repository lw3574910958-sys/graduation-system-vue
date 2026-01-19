<template>
  <div class="teacher-dashboard">
    <h2 class="dashboard-title">教师 Dashboard</h2>
    <div class="dashboard-content">
      <div class="stats-card">
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">12</div>
            <div class="card-label">指导学生数</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">8</div>
            <div class="card-label">发布课题数</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">5</div>
            <div class="card-label">待审核</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">3</div>
            <div class="card-label">待评阅</div>
          </div>
        </el-card>
      </div>
      
      <div class="chart-section">
        <el-card>
          <template #header>
            <span>教学统计</span>
          </template>
          <div class="chart-placeholder">
            <!-- 这里可以放置图表组件 -->
            <p>教师统计数据展示区域</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 教师仪表盘组件
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
}

.dashboard-title {
  margin-bottom: 20px;
  color: #303133;
  font-weight: 500;
  font-size: 20px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
}

.stats-card {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.card-item {
  flex: 1;
}

.card-content {
  text-align: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 5px;
}

.card-label {
  font-size: 14px;
  color: #606266;
}

.chart-section {
  flex: 1;
}

.chart-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>