<template>
  <div class="header">
    <div class="header-menu">
      <div class="header-logo">
        <img :src="logoImageUrl" />
        <div class="header-title">高校毕业设计管理系统</div>
      </div>
      <div class="header-rinfo">
        <el-dropdown trigger="hover" @command="handleCommand" popper-class="user-dropdown-popper">
          <div class="user-avatar-wrapper">
            <Avatar :avatar="userInfo?.avatar" :size="40" />
            <span class="user-name">{{ userInfo?.realName || '未知用户' }}</span>
            <el-icon class="user-dropdown-icon"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon class="dropdown-item-icon"><user /></el-icon>
                <span>个人信息</span>
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <el-icon class="dropdown-item-icon"><lock /></el-icon>
                <span>修改密码</span>
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon class="dropdown-item-icon"><switch-button /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
  
  <!-- 个人信息对话框 -->
  <UserProfileDialog v-model="profileDialogVisible" />
  
  <!-- 修改密码对话框 -->
  <ChangePasswordDialog ref="passwordDialogRef" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ArrowDown, User, Lock, SwitchButton } from '@element-plus/icons-vue'
import logoUrl from '@/assets/login/logo.png?url'
import { webSocketService } from '@/utils/webSocketService'
import Avatar from '@/components/common/Avatar.vue'
import UserProfileDialog from '@/components/user/UserProfileDialog.vue'
import ChangePasswordDialog from '@/components/user/ChangePasswordDialog.vue'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

const router = useRouter()

// Logo URL 作为响应式变量
const logoImageUrl = logoUrl

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 显示个人信息对话框
      profileDialogVisible.value = true
      break
    case 'password':
      // 显示修改密码对话框
      passwordDialogRef.value?.showDialog()
      break
    case 'logout':
      // 退出登录
      loginOut()
      break
  }
}

// 个人信息对话框
const profileDialogVisible = ref(false)

// 修改密码对话框引用
const passwordDialogRef = ref()

async function loginOut() {
  try {
    await authApi.logout()
    ElMessage.success('退出登录成功')
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    // 先断开 WebSocket 连接（永久断开）
    webSocketService.disconnect(true)
    
    // 清除认证信息
    authStore.clearAuth()
    
    // 跳转到登录页
    router.push('/login')
  }
}
</script>

<style scoped>
.header {
  height: 60px;
  background-color: #001529;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo img {
  height: 40px;
  width: auto;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.header-rinfo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  color: #fff;
}

.user-avatar-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.user-dropdown-icon {
  font-size: 14px;
  margin-left: 4px;
  transition: transform 0.3s;
}

.user-avatar-wrapper:hover .user-dropdown-icon {
  transform: rotate(180deg);
}

.header-exit a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
}

.header-exit a:hover {
  text-decoration: underline;
}

/* 下拉菜单样式优化 */
.user-dropdown-popper {
  --el-dropdown-menuItem-hover-fill: #f5f7fa;
  --el-dropdown-menuItem-hover-color: #409eff;
}

.user-dropdown-popper .el-dropdown-menu {
  padding: 8px 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.user-dropdown-popper .el-dropdown-menu__item {
  padding: 10px 20px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-dropdown-popper .el-dropdown-menu__item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.user-dropdown-popper .el-dropdown-menu__item .dropdown-item-icon {
  font-size: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-dropdown-popper .el-dropdown-menu__item--divided {
  border-top: 1px solid #ebeef5;
  margin-top: 6px;
  padding-top: 10px;
}

.user-dropdown-popper .el-dropdown-menu__item--divided:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

</style>
