// 导入统一常量
import { USER_TYPE, USER_TYPE_LABELS, MESSAGE } from './index';

// 重新导出，保持向后兼容
export { USER_TYPE, USER_TYPE_LABELS, MESSAGE };

// 审核状态常量
export const REVIEW_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
} as const;

// 审核状态标签映射
export const REVIEW_STATUS_LABELS = {
  [REVIEW_STATUS.PENDING]: '待审',
  [REVIEW_STATUS.APPROVED]: '通过',
  [REVIEW_STATUS.REJECTED]: '驳回'
} as const;

// 文件类型常量
export const FILE_TYPE = {
  PROPOSAL: 0,
  MID_TERM_REPORT: 1,
  THESIS: 2
} as const;

// 文件类型标签映射
export const FILE_TYPE_LABELS = {
  [FILE_TYPE.PROPOSAL]: '开题报告',
  [FILE_TYPE.MID_TERM_REPORT]: '中期报告',
  [FILE_TYPE.THESIS]: '毕业论文'
} as const;