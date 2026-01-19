<template>
  <div>
    <el-menu
      :collapseTransition="false"
      class="pdm-sidebar_menu"
      background-color="#263238"
      active-text-color="#fff"
      text-color="#8a979e"
      router
    >
      <el-menu-item index="/welcome" @click="$router.push({ path: '/welcome' })">
        <el-icon>
          <House />
        </el-icon>
        <span>欢迎页</span>
      </el-menu-item>

      <!-- 用户管理 -->
      <el-sub-menu index="user-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <User />
          </el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/user/list" @click="$router.push({ path: '/user/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">用户列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 课题管理 -->
      <el-sub-menu index="topic-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <FolderOpened />
          </el-icon>
          <span>课题管理</span>
        </template>
        <el-menu-item index="/topic/list" @click="$router.push({ path: '/topic/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">课题列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 选题管理 -->
      <el-sub-menu index="selection-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <Collection />
          </el-icon>
          <span>选题管理</span>
        </template>
        <el-menu-item index="/selection/list" @click="$router.push({ path: '/selection/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">选题列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 文档管理 -->
      <el-sub-menu index="document-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <Document />
          </el-icon>
          <span>文档管理</span>
        </template>
        <el-menu-item index="/document/list" @click="$router.push({ path: '/document/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">文档列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 成绩管理 -->
      <el-sub-menu index="grade-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <Star />
          </el-icon>
          <span>成绩管理</span>
        </template>
        <el-menu-item index="/grade/list" @click="$router.push({ path: '/grade/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">成绩列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 院系管理 -->
      <el-sub-menu index="department-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <OfficeBuilding />
          </el-icon>
          <span>院系管理</span>
        </template>
        <el-menu-item index="/department/list" @click="$router.push({ path: '/department/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">院系列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 过程管理 -->
      <el-sub-menu index="process-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <Timer />
          </el-icon>
          <span>过程管理</span>
        </template>
        <el-menu-item index="/process/list" @click="$router.push({ path: '/process/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">过程列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 统计管理 -->
      <el-sub-menu index="statistics-management" :popper-class="'pdm-sidebar--dark-popper'">
        <template #title>
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <span>统计管理</span>
        </template>
        <el-menu-item index="/statistics/list" @click="$router.push({ path: '/statistics/list' })">
          <el-icon>
            <List />
          </el-icon>
          <span slot="title">统计列表</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import {
  Document,
  House,
  User,
  FolderOpened,
  Collection,
  Star,
  List,
  Setting,
  OfficeBuilding,
  Timer,
  DataAnalysis,
} from '@element-plus/icons-vue'

/**
 * 菜单打开事件
 * @param key
 * @param keyPath
 */
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

/**
 * 菜单关闭事件
 * @param key
 * @param keyPath
 */
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
