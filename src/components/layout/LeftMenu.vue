<template>
  <div>
    <el-menu
      ref="menuRef"
      :collapseTransition="false"
      class="pdm-sidebar_menu"
      background-color="#263238"
      active-text-color="#fff"
      text-color="#8a979e"
      router
      :default-active="activeIndex"
      accordion
      @select="handleMenuSelect"
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
import { computed, ref, watch } from 'vue'
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
const menuRef = ref()

// 当前激活的菜单项
const activeIndex = computed(() => route.path)

// 根据用户权限过滤菜单
const filteredMenus = computed(() => {
  if (!authStore.userInfo) return []
  return filterMenusByUser(menuConfig, authStore.userInfo)
})

// 监听路由变化，确保手风琴效果
watch(() => route.path, (newPath) => {
  if (!menuRef.value) return
  
  // 找到当前路由对应的父菜单索引
  const parentMenuIndex = findParentMenuIndex(newPath)
  
  // 关闭所有展开的菜单
  filteredMenus.value.forEach(menu => {
    if (menu.children && menu.children.length > 0) {
      // 如果是单级菜单（如欢迎页）或者不是当前路由对应的父菜单，则关闭
      if (!parentMenuIndex || menu.index !== parentMenuIndex) {
        menuRef.value.close(menu.index)
      }
    }
  })
})

// 查找当前路由对应的父菜单索引
function findParentMenuIndex(path: string): string | null {
  for (const menu of filteredMenus.value) {
    if (menu.children && menu.children.length > 0) {
      const hasChildPath = menu.children.some(child => child.path === path)
      if (hasChildPath) {
        return menu.index
      }
    }
  }
  return null
}

// 菜单选择事件
const handleMenuSelect = (index: string, indexPath: string[]) => {
  if (!menuRef.value) return
  
  // 如果选择的是单级菜单（indexPath 长度为 1），关闭所有展开的父菜单
  if (indexPath.length === 1) {
    filteredMenus.value.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        menuRef.value.close(menu.index)
      }
    })
  } else {
    // 如果选择的是子菜单，关闭其他所有父菜单
    const parentIndex = indexPath[0]
    filteredMenus.value.forEach(menu => {
      if (menu.index !== parentIndex && menu.children && menu.children.length > 0) {
        menuRef.value.close(menu.index)
      }
    })
  }
}
</script>
