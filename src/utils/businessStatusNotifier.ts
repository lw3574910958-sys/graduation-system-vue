/**
 * 业务状态变更通知服务
 * 用于实现实时的状态变更反馈机制
 */

import { ElNotification } from 'element-plus'
import type { TopicStatus } from '@/constants/enums'
import { TOPIC_STATUS_LABELS } from '@/constants'

// 状态变更类型枚举
export enum StatusChangeType {
  TOPIC_STATUS_CHANGE = 'topic_status_change',
  DOCUMENT_REVIEW_RESULT = 'document_review_result',
  SELECTION_APPROVAL = 'selection_approval',
  GRADE_UPDATE = 'grade_update'
}

// 状态变更消息接口
export interface StatusChangeMessage {
  type: StatusChangeType
  entityId: number
  entityTitle: string
  oldStatus?: any
  newStatus: any
  timestamp: Date
  userId?: number
  userName?: string
  message?: string
}

class BusinessStatusNotifier {
  private listeners: Map<StatusChangeType, Array<(message: StatusChangeMessage) => void>> = new Map()

  /**
   * 注册状态变更监听器
   */
  subscribe(type: StatusChangeType, callback: (message: StatusChangeMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)?.push(callback)
  }

  /**
   * 取消注册监听器
   */
  unsubscribe(type: StatusChangeType, callback: (message: StatusChangeMessage) => void) {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 发送状态变更通知
   */
  notify(message: StatusChangeMessage) {
    // 执行回调函数
    const callbacks = this.listeners.get(message.type)
    if (callbacks) {
      callbacks.forEach(callback => callback(message))
    }

    // 显示桌面通知
    this.showDesktopNotification(message)
  }

  /**
   * 显示桌面通知
   */
  private showDesktopNotification(message: StatusChangeMessage) {
    let title = ''
    let messageText = ''
    let type: 'success' | 'warning' | 'info' | 'error' = 'info'

    switch (message.type) {
      case StatusChangeType.TOPIC_STATUS_CHANGE:
        title = '课题状态变更'
        messageText = `课题"${message.entityTitle}"状态已更新为${this.getTopicStatusLabel(message.newStatus)}`
        type = message.newStatus === 3 ? 'warning' : 'success'
        break

      case StatusChangeType.DOCUMENT_REVIEW_RESULT:
        title = '文档审核结果'
        const result = message.newStatus === 1 ? '通过' : '驳回'
        messageText = `文档"${message.entityTitle}"审核${result}`
        type = message.newStatus === 1 ? 'success' : 'warning'
        break

      case StatusChangeType.SELECTION_APPROVAL:
        title = '选题申请结果'
        const approval = message.newStatus === 1 ? '通过' : '驳回'
        messageText = `选题"${message.entityTitle}"申请${approval}`
        type = message.newStatus === 1 ? 'success' : 'warning'
        break

      case StatusChangeType.GRADE_UPDATE:
        title = '成绩更新'
        messageText = `课题"${message.entityTitle}"成绩已更新`
        type = 'success'
        break
    }

    ElNotification({
      title,
      message: messageText,
      type,
      duration: 5000,
      offset: 60
    })
  }

  /**
   * 获取课题状态标签
   */
  private getTopicStatusLabel(status: number): string {
    return TOPIC_STATUS_LABELS[status as keyof typeof TOPIC_STATUS_LABELS] || '未知状态'
  }

  /**
   * 通知课题状态变更
   */
  notifyTopicStatusChange(topicId: number, topicTitle: string, oldStatus: number, newStatus: number) {
    this.notify({
      type: StatusChangeType.TOPIC_STATUS_CHANGE,
      entityId: topicId,
      entityTitle: topicTitle,
      oldStatus,
      newStatus,
      timestamp: new Date()
    })
  }

  /**
   * 通知文档审核结果
   */
  notifyDocumentReviewResult(documentId: number, documentTitle: string, result: number, reviewerName?: string) {
    this.notify({
      type: StatusChangeType.DOCUMENT_REVIEW_RESULT,
      entityId: documentId,
      entityTitle: documentTitle,
      newStatus: result,
      timestamp: new Date(),
      userName: reviewerName
    })
  }

  /**
   * 通知选题审批结果
   */
  notifySelectionApproval(selectionId: number, topicTitle: string, result: number, reviewerName?: string) {
    this.notify({
      type: StatusChangeType.SELECTION_APPROVAL,
      entityId: selectionId,
      entityTitle: topicTitle,
      newStatus: result,
      timestamp: new Date(),
      userName: reviewerName
    })
  }

  /**
   * 通知成绩更新
   */
  notifyGradeUpdate(gradeId: number, topicTitle: string, score: number) {
    this.notify({
      type: StatusChangeType.GRADE_UPDATE,
      entityId: gradeId,
      entityTitle: topicTitle,
      newStatus: score,
      timestamp: new Date()
    })
  }
}

// 创建全局实例
export const businessStatusNotifier = new BusinessStatusNotifier()

// 默认导出
export default businessStatusNotifier