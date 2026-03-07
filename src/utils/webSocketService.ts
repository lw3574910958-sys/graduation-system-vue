/**
 * WebSocket实时通信服务
 * 用于接收服务器推送的业务状态变更通知
 */

import { ElMessage } from 'element-plus'
import { businessStatusNotifier, StatusChangeType } from '@/utils/businessStatusNotifier'
import { useAuthStore } from '@/stores/modules/auth'
import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private isConnected = false
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatInterval = 30000 // 30秒心跳

  /**
   * 连接到WebSocket服务器
   */
  connect() {
    // TODO: WebSocket功能暂未启用，等待后端实现
    console.log('WebSocket功能暂未启用，跳过连接')
    return
    
    /* 原有逻辑保留，待后端实现WebSocket后再启用
    const authStore = useAuthStore()
    
    // 检查是否已登录
    if (!authStore.isAuthenticated) {
      console.log('用户未登录，跳过WebSocket连接')
      return
    }

    // 获取WebSocket服务器地址
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'
    const token = storageUtil.get(constants.TOKEN_NAME)
    
    if (!token) {
      console.log('未找到认证token，跳过WebSocket连接')
      return
    }

    const wsUrl = `${wsBaseUrl}/api/ws/status?token=${token}`

    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket连接已建立')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        ElMessage.success('实时通知服务已连接')
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        this.isConnected = false
        this.stopHeartbeat()
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
        this.isConnected = false
        this.stopHeartbeat()
      }

    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.attemptReconnect()
    }
    */
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)
      console.log('收到WebSocket消息:', message)

      // 根据消息类型处理不同的业务状态变更
      switch (message.type) {
        case 'TOPIC_STATUS_CHANGED':
          businessStatusNotifier.notifyTopicStatusChange(
            message.topicId,
            message.topicTitle,
            message.oldStatus,
            message.newStatus
          )
          break

        case 'DOCUMENT_REVIEWED':
          businessStatusNotifier.notifyDocumentReviewResult(
            message.documentId,
            message.documentTitle,
            message.reviewStatus,
            message.reviewerName
          )
          break

        case 'SELECTION_APPROVED':
          businessStatusNotifier.notifySelectionApproval(
            message.selectionId,
            message.topicTitle,
            message.approvalStatus,
            message.reviewerName
          )
          break

        case 'GRADE_UPDATED':
          businessStatusNotifier.notifyGradeUpdate(
            message.gradeId,
            message.topicTitle,
            message.score
          )
          break

        case 'HEARTBEAT':
          // 心跳响应，无需处理
          break

        default:
          console.log('未知消息类型:', message.type)
      }

    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }

  /**
   * 发送心跳包
   */
  private sendHeartbeat() {
    if (this.ws && this.isConnected) {
      try {
        this.ws.send(JSON.stringify({ type: 'HEARTBEAT' }))
      } catch (error) {
        console.error('发送心跳包失败:', error)
      }
    }
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.heartbeatInterval)
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      ElMessage.warning('实时通知服务连接中断，请刷新页面重试')
      return
    }

    if (!this.reconnectTimer) {
      this.reconnectAttempts++
      console.log(`尝试第${this.reconnectAttempts}次重连...`)
      
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null
        this.connect()
      }, this.reconnectInterval)
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    // WebSocket功能暂未启用
    console.log('WebSocket功能暂未启用，无需断开连接')
    return
    
    /* 原有逻辑保留
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
    this.isConnected = false
    this.reconnectAttempts = 0
    */
  }

  /**
   * 检查连接状态
   */
  isConnectedStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 重新连接
   */
  reconnect() {
    this.disconnect()
    this.connect()
  }
}

// 创建全局实例
export const webSocketService = new WebSocketService()

// 默认导出
export default webSocketService