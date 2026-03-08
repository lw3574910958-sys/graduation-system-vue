/**
 * WebSocket 消息通知处理器
 * 用于在页面右上角弹出通知消息
 */

import { ElNotification } from 'element-plus'
import { h } from 'vue'

/**
 * 显示通知消息
 */
export function showNotification(message: any) {
  console.log('收到 WebSocket 消息:', message)

  // 根据消息类型显示不同的通知
  switch (message.type) {
    case 'NOTICE_PUBLISHED':
      showNoticeNotification(message)
      break
    case 'TOPIC_STATUS_CHANGED':
      showTopicStatusChanged(message)
      break
    case 'DOCUMENT_REVIEWED':
      showDocumentReviewed(message)
      break
    case 'SELECTION_APPROVED':
      showSelectionApproved(message)
      break
    case 'GRADE_UPDATED':
      showGradeUpdated(message)
      break
    default:
      console.log('未知消息类型:', message.type)
  }
}

/**
 * 显示公告通知
 */
function showNoticeNotification(message: any) {
  ElNotification({
    title: '📢 新公告发布',
    message: h('div', { style: 'line-height: 1.6' }, [
      h('div', null, `标题：${message.title}`),
      h('div', null, `类型：${message.typeDesc}`),
      h('div', null, `范围：${message.targetScope}`),
      h('div', null, `发布者：${message.publisherName}`)
    ]),
    type: 'success',
    duration: 5000,
    position: 'top-right' // 右上角
  })
}

/**
 * 显示课题状态变更
 */
function showTopicStatusChanged(message: any) {
  ElNotification({
    title: '📝 课题状态更新',
    message: h('div', { style: 'line-height: 1.6' }, [
      h('div', null, `课题：${message.topicTitle}`),
      h('div', null, `新状态：${getStatusText(message.newStatus)}`)
    ]),
    type: 'info',
    duration: 4000,
    position: 'top-right' // 右上角
  })
}

/**
 * 显示文档审核结果
 */
function showDocumentReviewed(message: any) {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '审核通过',
    2: '审核拒绝'
  }
  
  ElNotification({
    title: '📄 文档审核结果',
    message: h('div', { style: 'line-height: 1.6' }, [
      h('div', null, `文档：${message.documentTitle}`),
      h('div', null, `状态：${statusMap[message.reviewStatus] || '未知'}`),
      h('div', null, `审核人：${message.reviewerName}`)
    ]),
    type: message.reviewStatus === 1 ? 'success' : 'warning',
    duration: 4000,
    position: 'top-right' // 右上角
  })
}

/**
 * 显示选题审核结果
 */
function showSelectionApproved(message: any) {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '审核通过',
    2: '审核拒绝'
  }
  
  ElNotification({
    title: '✅ 选题审核结果',
    message: h('div', { style: 'line-height: 1.6' }, [
      h('div', null, `课题：${message.topicTitle}`),
      h('div', null, `状态：${statusMap[message.approvalStatus] || '未知'}`),
      h('div', null, `审核人：${message.reviewerName}`)
    ]),
    type: message.approvalStatus === 1 ? 'success' : 'warning',
    duration: 4000,
    position: 'top-right' // 右上角
  })
}

/**
 * 显示成绩更新
 */
function showGradeUpdated(message: any) {
  ElNotification({
    title: '🎯 成绩已发布',
    message: h('div', { style: 'line-height: 1.6' }, [
      h('div', null, `课题：${message.topicTitle}`),
      h('div', null, `分数：${message.score}`)
    ]),
    type: 'success',
    duration: 4000,
    position: 'top-right' // 右上角
  })
}

/**
 * 获取状态文本
 */
function getStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '待审核',
    2: '审核通过',
    3: '审核拒绝',
    4: '已撤回'
  }
  return statusMap[status] || '未知'
}
