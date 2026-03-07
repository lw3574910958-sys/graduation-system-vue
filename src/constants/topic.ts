// 导入统一常量
import { TOPIC_STATUS, TOPIC_STATUS_LABELS } from './index';

// 保持向后兼容的TopicStatus枚举
export enum TopicStatus {
  OPEN = 'OPEN',
  SELECTED = 'SELECTED',
  CLOSED = 'CLOSED'
}

// 向后兼容的状态映射
export const TOPIC_STATUS_MAP: Record<string, string> = {
  [TopicStatus.OPEN]: '开放',
  [TopicStatus.SELECTED]: '已选',
  [TopicStatus.CLOSED]: '关闭'
};

// 与后端枚举值对应的数字状态映射
export const TOPIC_STATUS_NUMBERS = {
  OPEN: 1,
  SELECTED: 2,
  CLOSED: 3
} as const;

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