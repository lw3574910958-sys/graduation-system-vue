<template>
  <div class="admin-dashboard">
    <h2 class="dashboard-title">管理员 Dashboard</h2>
    <div class="dashboard-content">
      <div class="stats-card">
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">128</div>
            <div class="card-label">总用户数</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">256</div>
            <div class="card-label">总课题数</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">89</div>
            <div class="card-label">选题数</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">32</div>
            <div class="card-label">待审核</div>
          </div>
        </el-card>
      </div>
      
      <div class="chart-section">
        <el-card>
          <template #header>
            <span>数据统计图表</span>
          </template>
          <div class="chart-placeholder">
            <!-- 这里可以放置图表组件 -->
            <p>图表展示区域</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 管理员仪表盘组件
</script>

<style scoped>
.admin-dashboard {
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
  color: #409eff;
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