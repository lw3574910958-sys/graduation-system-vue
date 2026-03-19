<template>
  <div class="basic-layout">
    <el-container>
      <el-header class="layout-header">
        <Header />
      </el-header>

      <el-container class="main-container">
        <el-aside class="pdm-sidebar pdm-sidebar--dark">
          <LeftMenu />
        </el-aside>

        <el-container>
          <div class="pdm-content_wrapper">
            <el-main class="pdm-content">
              <el-card class="pdm-content-card">
                <RouterView />
              </el-card>
            </el-main>

            <el-footer class="layout-footer">
              <Footer />
            </el-footer>
          </div>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from '@/components/layout/Header.vue';
import LeftMenu from '@/components/layout/LeftMenu.vue';
import Footer from '@/components/layout/Footer.vue';
</script>

<style scoped>
.basic-layout {
  height: 100vh;
  width: 100%;
}

.layout-header {
  height: 60px !important;
  padding: 0 !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.main-container {
  position: relative;
  top: 60px;
  height: calc(100vh - 60px);
}
</style>