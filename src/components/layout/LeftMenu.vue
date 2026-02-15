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
      <el-menu-item index="/welcome">
        <el-icon>
          <House />
        </el-icon>
        <span>欢迎页</span>
      </el-menu-item>

      <!-- 用户管理 -->
      <el-sub-menu
        index="user-management"
        :popper-class="'pdm-sidebar--dark-popper'"
        v-if="isAdmin"
      >
        <template #title>
          <el-icon>
            <User />
          </el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/user/list">
          <el-icon>
            <List />
          </el-icon>
          <span>用户列表</span>
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
        <el-menu-item index="/topic/list">
          <el-icon>
            <List />
          </el-icon>
          <span>课题列表</span>
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
        <el-menu-item index="/selection/list">
          <el-icon>
            <List />
          </el-icon>
          <span>选题列表</span>
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
        <el-menu-item index="/document/list">
          <el-icon>
            <List />
          </el-icon>
          <span>文档列表</span>
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
        <el-menu-item index="/grade/list">
          <el-icon>
            <List />
          </el-icon>
          <span>成绩列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 院系管理 -->
      <el-sub-menu
        index="department-management"
        :popper-class="'pdm-sidebar--dark-popper'"
        v-if="isAdmin"
      >
        <template #title>
          <el-icon>
            <OfficeBuilding />
          </el-icon>
          <span>院系管理</span>
        </template>
        <el-menu-item index="/department/list">
          <el-icon>
            <List />
          </el-icon>
          <span>院系列表</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
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
import { useAuthStore } from '@/stores'
import { USER_TYPE } from '@/constants'

// 获取用户类型，用于权限控制
const authStore = useAuthStore()

// 安全的权限判断函数
const getIsAdmin = computed(() => {
  if (!authStore.userInfo) return false
  return authStore.userInfo.userType === USER_TYPE.ADMIN
})

// 为了向后兼容，保留原来的变量名
const isAdmin = getIsAdmin

/**
 * 菜单打开事件
 * @param key
 * @param keyPath
 */
const handleOpen = (key: string, keyPath: string[]) => {
  // 菜单打开时的处理
}

/**
 * 菜单关闭事件
 * @param key
 * @param keyPath
 */
const handleClose = (key: string, keyPath: string[]) => {
  // 菜单关闭时的处理
}
</script>
