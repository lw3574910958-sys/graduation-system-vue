<template>
  <div class="business-status-monitor">
    <!-- 状态变更通知列表 -->
    <div v-if="notifications.length > 0" class="notification-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="`notification-${notification.type}`"
      >
        <div class="notification-header">
          <span class="notification-title">{{ notification.title }}</span>
          <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
        </div>
        <div class="notification-content">
          {{ notification.message }}
        </div>
        <div class="notification-actions">
          <el-button 
            v-if="notification.entityId"
            type="primary" 
            link 
            size="small"
            @click="handleViewEntity(notification)"
          >
            查看详情
          </el-button>
          <el-button 
            type="danger" 
            link 
            size="small"
            @click="removeNotification(notification.id)"
          >
            关闭
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无状态变更通知" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { businessStatusNotifier, StatusChangeType } from '@/utils/businessStatusNotifier'
import { useRouter } from 'vue-router'

interface NotificationItem {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  entityId?: number
  entityType?: string
  timestamp: Date
}

const router = useRouter()
const notifications = ref<NotificationItem[]>([])

// 格式化时间
const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleString()
  }
}

// 添加通知
const addNotification = (item: NotificationItem) => {
  notifications.value.unshift(item)
  
  // 限制最多显示10条通知
  if (notifications.value.length > 10) {
    notifications.value.pop()
  }
}

// 移除通知
const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 查看实体详情
const handleViewEntity = (notification: NotificationItem) => {
  if (!notification.entityId || !notification.entityType) return
  
  try {
    switch (notification.entityType) {
      case 'topic':
        router.push(`/topic/detail/${notification.entityId}`)
        break
      case 'document':
        router.push(`/document/detail/${notification.entityId}`)
        break
      case 'selection':
        router.push(`/selection/detail/${notification.entityId}`)
        break
      default:
        ElMessage.info('暂不支持查看此类型详情')
    }
  } catch (error) {
    ElMessage.error('跳转失败')
  }
}

// 监听状态变更
const handleStatusChange = (message: any) => {
  let notificationType: 'success' | 'warning' | 'info' | 'error' = 'info'
  let title = ''
  let entityType = ''

  switch (message.type) {
    case StatusChangeType.TOPIC_STATUS_CHANGE:
      title = '课题状态变更'
      notificationType = message.newStatus === 3 ? 'warning' : 'success'
      entityType = 'topic'
      break

    case StatusChangeType.DOCUMENT_REVIEW_RESULT:
      title = '文档审核结果'
      notificationType = message.newStatus === 1 ? 'success' : 'warning'
      entityType = 'document'
      break

    case StatusChangeType.SELECTION_APPROVAL:
      title = '选题申请结果'
      notificationType = message.newStatus === 1 ? 'success' : 'warning'
      entityType = 'selection'
      break

    case StatusChangeType.GRADE_UPDATE:
      title = '成绩更新'
      notificationType = 'success'
      break
  }

  addNotification({
    id: `${message.type}-${Date.now()}`,
    type: notificationType,
    title,
    message: message.message || `实体 "${message.entityTitle}" 状态已更新`,
    entityId: message.entityId,
    entityType,
    timestamp: message.timestamp
  })
}

// 清空所有通知
const clearAllNotifications = () => {
  notifications.value = []
}

// 组件挂载时订阅状态变更
onMounted(() => {
  businessStatusNotifier.subscribe(StatusChangeType.TOPIC_STATUS_CHANGE, handleStatusChange)
  businessStatusNotifier.subscribe(StatusChangeType.DOCUMENT_REVIEW_RESULT, handleStatusChange)
  businessStatusNotifier.subscribe(StatusChangeType.SELECTION_APPROVAL, handleStatusChange)
  businessStatusNotifier.subscribe(StatusChangeType.GRADE_UPDATE, handleStatusChange)
})

// 组件卸载时取消订阅
onUnmounted(() => {
  businessStatusNotifier.unsubscribe(StatusChangeType.TOPIC_STATUS_CHANGE, handleStatusChange)
  businessStatusNotifier.unsubscribe(StatusChangeType.DOCUMENT_REVIEW_RESULT, handleStatusChange)
  businessStatusNotifier.unsubscribe(StatusChangeType.SELECTION_APPROVAL, handleStatusChange)
  businessStatusNotifier.unsubscribe(StatusChangeType.GRADE_UPDATE, handleStatusChange)
})

// 暴露方法给父组件
defineExpose({
  clearAllNotifications
})
</script>

<style scoped>
.business-status-monitor {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.notification-list {
  padding: 10px;
}

.notification-item {
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #409eff;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-success {
  border-left-color: #67c23a;
  background-color: #f0f9ff;
}

.notification-warning {
  border-left-color: #e6a23c;
  background-color: #fdf6ec;
}

.notification-error {
  border-left-color: #f56c6c;
  background-color: #fef0f0;
}

.notification-info {
  border-left-color: #409eff;
  background-color: #f5f7fa;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-content {
  margin-bottom: 12px;
  color: #606266;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}
</style>