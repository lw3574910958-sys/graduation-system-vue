<template>
  <div class="student-dashboard dashboard-container">
    <h2 class="dashboard-title">学生 Dashboard</h2>
    <div class="dashboard-content">
      <div class="stats-card">
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">1</div>
            <div class="card-label">我的选题</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">3</div>
            <div class="card-label">已完成文档</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">2</div>
            <div class="card-label">待提交</div>
          </div>
        </el-card>
        <el-card class="card-item">
          <div class="card-content">
            <div class="card-value">A</div>
            <div class="card-label">预估成绩</div>
          </div>
        </el-card>
      </div>
      
      <div class="progress-section">
        <el-card>
          <template #header>
            <span>毕业进度</span>
          </template>
          <div class="progress-content">
            <el-steps :active="3" finish-status="success" align-center>
              <el-step title="选题" />
              <el-step title="开题" />
              <el-step title="中期检查" />
              <el-step title="论文提交" />
              <el-step title="答辩" />
            </el-steps>
          </div>
        </el-card>
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
  </div>
</template>

<script setup lang="ts">
// 学生仪表盘组件
</script>

<style scoped>
/* 使用 global.less 中的通用仪表盘样式类 */
</style>