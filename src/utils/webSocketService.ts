/**
 * WebSocket 实时通信服务（STOMP 协议）
 * 用于接收服务器推送的业务状态变更通知
 */

import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/modules/auth'
import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'

class WebSocketService {
  private stompClient: Client | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private isConnected = false
  private heartbeatInterval = 30000 // 30 秒心跳
  private shouldReconnect = true // 是否应该重连的标志

  /**
   * 连接到 WebSocket 服务器
   */
  connect() {
    const authStore = useAuthStore()
          
    // 检查是否已登录（使用 checkAuth 而不是 isAuthenticated）
    if (!authStore.checkAuth()) {
      console.log('用户未登录，跳过 WebSocket连接')
      return
    }
      
    // 获取 WebSocket 服务器地址
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'
    const token = storageUtil.get(constants.TOKEN_NAME)
          
    if (!token) {
      console.log('未找到认证 token，跳过 WebSocket连接')
      return
    }
      
    // 如果已有连接，不要重复连接
    if (this.isConnectedStatus()) {
      console.log('WebSocket 已连接，跳过重复连接')
      return
    }
      
    // 重置重连标志（每次主动连接时都应该允许重连）
    this.shouldReconnect = true
      
    console.log('开始连接 STOMP:', `${wsBaseUrl}/api/ws`)
    
    try {
      // 创建 STOMP 客户端（token 通过 URL 参数和 CONNECT header 传递）
      this.stompClient = new Client({
        brokerURL: `${wsBaseUrl}/api/ws?token=${encodeURIComponent(token)}`,
        // 禁用自动重连，使用我们自己的重连逻辑
        reconnectDelay: 0,
        // STOMP CONNECT 帧的 header（用于 STOMP 协议认证）
        connectHeaders: {
          token: token // ← 关键：STOMP 协议阶段的 token
        },
        debug: (str: string) => {
          console.log('STOMP:', str)
        },
        onConnect: () => {
          console.log('✅ STOMP 连接成功')
          this.isConnected = true
          this.reconnectAttempts = 0
          
          // 订阅公告通知主题
          this.subscribeToNotice()
          
          console.log('✅ 实时通知服务已连接')
        },
        onStompError: (frame: any) => {
          console.error('STOMP 错误:', frame)
          this.isConnected = false
        },
        onWebSocketClose: () => {
          console.log('WebSocket 连接已关闭')
          this.isConnected = false
          this.attemptReconnect()
        },
        onWebSocketError: (error: Event) => {
          console.error('WebSocket 连接错误:', error)
          this.isConnected = false
        }
      })

      // 激活 STOMP 客户端
      this.stompClient.activate()
          
    } catch (error) {
      console.error('WebSocket 连接失败:', error)
      this.attemptReconnect()
    }
  }

  /**
   * 订阅公告通知主题
   */
  private subscribeToNotice() {
    if (!this.stompClient) return

    this.stompClient.subscribe('/topic/notice', (message: any) => {
      console.log('🔔 收到公告通知:', message)
      
      try {
        const body = JSON.parse(message.body!)
        console.log('📢 公告内容:', body)
        // 不显示通知框，用户可在仪表盘通知公告中查看
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    })

    console.log('✅ 已订阅 /topic/notice 主题')
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect() {
    // 如果已经手动断开连接（shouldReconnect=false），则不再重连
    // 注意：正常登录状态下 shouldReconnect 应该为 true
    if (!this.shouldReconnect) {
      console.log('已停止重连，跳过 WebSocket连接')
      return
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      console.warn('⚠️ 实时通知服务连接中断，请刷新页面重试')
      
      // 停用 STOMP 客户端，防止其继续重连
      if (this.stompClient) {
        this.stompClient.deactivate()
        this.stompClient = null
      }
      
      // 设置不再重连的标志
      this.shouldReconnect = false
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
   * 断开连接（用于退出登录）
   * @param permanent 是否永久断开（退出登录时为 true）
   */
  disconnect(permanent: boolean = false) {
    if (permanent) {
      // 退出登录时，设置不再重连的标志
      this.shouldReconnect = false
      console.log('退出登录，永久断开 WebSocket连接')
    } else {
      // 临时断开（如切换页面），不断开重连能力
      console.log('临时断开 WebSocket连接')
    }
    
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.stompClient = null
    }
      
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
      
    this.isConnected = false
    this.reconnectAttempts = 0
  }

  /**
   * 检查连接状态
   */
  isConnectedStatus(): boolean {
    return this.isConnected && (this.stompClient?.active ?? false)
  }

  /**
   * 重新连接
   */
  reconnect() {
    // 重置重连标志
    this.shouldReconnect = true
    this.disconnect()
    this.connect()
  }
}

// 创建全局实例
export const webSocketService = new WebSocketService()

// 默认导出
export default webSocketService