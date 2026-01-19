<template>
  <div class="teacher-dashboard dashboard-container">
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
/* 使用 global.less 中的通用仪表盘样式类 */
</style>