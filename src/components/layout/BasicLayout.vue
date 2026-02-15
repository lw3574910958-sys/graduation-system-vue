<template>
  <div class="basic-layout">
    <el-container>
      <el-header>
        <Header />
      </el-header>

      <el-container>
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
</style>