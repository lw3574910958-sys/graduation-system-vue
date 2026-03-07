<template>
  <div>
    <el-menu
      :collapseTransition="false"
      class="pdm-sidebar_menu"
      background-color="#263238"
      active-text-color="#fff"
      text-color="#8a979e"
      router
      :default-active="activeIndex"
    >
      <template v-for="menu in filteredMenus" :key="menu.index">
        <!-- 单级菜单项 -->
        <el-menu-item 
          v-if="!menu.children || menu.children.length === 0" 
          :index="menu.path || menu.index"
        >
          <el-icon>
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
        
        <!-- 多级菜单项 -->
        <el-sub-menu 
          v-else
          :index="menu.index"
          :popper-class="'pdm-sidebar--dark-popper'"
        >
          <template #title>
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item 
            v-for="child in menu.children" 
            :key="child.index"
            :index="child.path || child.index"
          >
            <el-icon>
              <component :is="child.icon" />
            </el-icon>
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
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
import { filterMenusByUser } from '@/config/menu'
import { menuConfig } from '@/config/menu'

const route = useRoute()
const authStore = useAuthStore()

// 当前激活的菜单项
const activeIndex = computed(() => route.path)

// 根据用户权限过滤菜单
const filteredMenus = computed(() => {
  if (!authStore.userInfo) return []
  return filterMenusByUser(menuConfig, authStore.userInfo)
})

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
