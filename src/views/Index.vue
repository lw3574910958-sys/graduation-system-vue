<template>
  <div class="common-layout">
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
                <router-view />
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
import Header from '@/components/layout/Header.vue'
import LeftMenu from '@/components/layout/LeftMenu.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<!--
注意：不再导入 style.less
因为该样式已在 main.ts 中全局导入，避免重复导入
-->
