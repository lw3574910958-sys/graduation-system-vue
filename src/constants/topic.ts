// 导入统一常量
import { TOPIC_STATUS, TOPIC_STATUS_LABELS } from './index';

// 题目状态常量
export enum TopicStatus {
  DRAFT = 'DRAFT',
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED'
}

export const TOPIC_STATUS_MAP: Record<string, string> = {
  [TopicStatus.DRAFT]: '草稿',
  [TopicStatus.AVAILABLE]: '可选',
  [TopicStatus.ASSIGNED]: '已选',
  [TopicStatus.COMPLETED]: '完成'
};

/**
 * 选题状态常量
 */
export enum SelectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export const SELECTION_STATUS_MAP: Record<string, string> = {
  [SelectionStatus.PENDING]: '待审核',
  [SelectionStatus.APPROVED]: '已通过',
  [SelectionStatus.REJECTED]: '已拒绝',
  [SelectionStatus.COMPLETED]: '已完成'
};