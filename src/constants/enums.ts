  /**
 * 后端枚举值的前端常量定义
 * 与 graduation-system-boot 项目中的枚举保持完全同步
 */

// 用户类型枚举 (对应后端 UserType)
export const USER_TYPE_ENUM = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  SYSTEM_ADMIN: 'system_admin',
  DEPARTMENT_ADMIN: 'department_admin'
} as const

// 系统角色枚举 (对应后端 SystemRole)
export const SYSTEM_ROLE = {
  SYSTEM_ADMIN: 'system_admin',     // 系统管理员
  DEPARTMENT_ADMIN: 'department_admin', // 院系管理员
  TEACHER: 'teacher',               // 教师
  STUDENT: 'student'                // 学生
} as const

// 系统角色标签映射
export const SYSTEM_ROLE_LABELS = {
  [SYSTEM_ROLE.SYSTEM_ADMIN]: '系统管理员',
  [SYSTEM_ROLE.DEPARTMENT_ADMIN]: '院系管理员',
  [SYSTEM_ROLE.TEACHER]: '教师',
  [SYSTEM_ROLE.STUDENT]: '学生'
} as const

// 账户状态枚举 (对应后端 AccountStatus)
export const ACCOUNT_STATUS = {
  DISABLED: 0,
  ENABLED: 1
} as const

// 账户状态标签映射
export const ACCOUNT_STATUS_LABELS = {
  [ACCOUNT_STATUS.DISABLED]: '禁用',
  [ACCOUNT_STATUS.ENABLED]: '启用'
} as const

// 课题状态枚举 (对应后端 BizTopic.status: 1-开放, 2-审核中, 3-已选, 4-关闭)
export const TOPIC_STATUS = {
  OPEN: 1,        // 开放
  REVIEWING: 2,   // 审核中
  SELECTED: 3,    // 已选
  CLOSED: 4       // 关闭
} as const

// 课题状态标签映射
export const TOPIC_STATUS_LABELS = {
  [TOPIC_STATUS.OPEN]: '开放',
  [TOPIC_STATUS.REVIEWING]: '审核中',
  [TOPIC_STATUS.SELECTED]: '已选',
  [TOPIC_STATUS.CLOSED]: '关闭'
} as const

// 选题状态枚举 (对应后端 SelectionStatus: 0-待审核, 1-审核通过, 2-审核驳回, 3-已确认)
export const SELECTION_STATUS = {
  PENDING_REVIEW: 0,   // 待审核
  APPROVED: 1,         // 审核通过
  REJECTED: 2,         // 审核驳回
  CONFIRMED: 3         // 已确认
} as const

// 选题状态标签映射
export const SELECTION_STATUS_LABELS = {
  [SELECTION_STATUS.PENDING_REVIEW]: '待审核',
  [SELECTION_STATUS.APPROVED]: '审核通过',
  [SELECTION_STATUS.REJECTED]: '审核驳回',
  [SELECTION_STATUS.CONFIRMED]: '已确认'
} as const

// 文档文件类型枚举 (对应后端 DocumentFileType)
export const DOCUMENT_FILE_TYPE = {
  PROPOSAL: 0,     // 开题报告
  MIDTERM: 1,      // 中期报告
  THESIS: 2,       // 毕业论文
  TRANSLATION: 3,  // 外文翻译
  OTHER: 4         // 其他文档
} as const

// 文档文件类型标签映射
export const DOCUMENT_FILE_TYPE_LABELS = {
  [DOCUMENT_FILE_TYPE.PROPOSAL]: '开题报告',
  [DOCUMENT_FILE_TYPE.MIDTERM]: '中期报告',
  [DOCUMENT_FILE_TYPE.THESIS]: '毕业论文',
  [DOCUMENT_FILE_TYPE.TRANSLATION]: '外文翻译',
  [DOCUMENT_FILE_TYPE.OTHER]: '其他文档'
} as const

// 审核状态枚举 (对应后端 ReviewStatus)
export const REVIEW_STATUS = {
  PENDING: 0,    // 待审
  APPROVED: 1,   // 通过
  REJECTED: 2    // 驳回
} as const

// 审核状态标签映射
export const REVIEW_STATUS_LABELS = {
  [REVIEW_STATUS.PENDING]: '待审',
  [REVIEW_STATUS.APPROVED]: '通过',
  [REVIEW_STATUS.REJECTED]: '驳回'
} as const

// 成绩等级枚举 (对应后端 GradeLevel)
export const GRADE_LEVEL = {
  EXCELLENT: 'EXCELLENT',    // 优秀 (90-100分)
  GOOD: 'GOOD',              // 良好 (80-89分)
  FAIR: 'FAIR',              // 中等 (70-79分)
  PASS: 'PASS',              // 及格 (60-69分)
  FAIL: 'FAIL'               // 不及格 (0-59分)
} as const

// 成绩等级标签映射
export const GRADE_LEVEL_LABELS = {
  [GRADE_LEVEL.EXCELLENT]: '优秀',
  [GRADE_LEVEL.GOOD]: '良好',
  [GRADE_LEVEL.FAIR]: '中等',
  [GRADE_LEVEL.PASS]: '及格',
  [GRADE_LEVEL.FAIL]: '不及格'
} as const

// 题目来源枚举 (对应后端 TopicSource)
export const TOPIC_SOURCE = {
  TEACHING_PRACTICE: '教学实践',
  SCIENTIFIC_RESEARCH: '科研项目',
  ENTERPRISE_COOPERATION: '企业合作',
  FRONTIER_TECHNOLOGY: '前沿技术',
  SOCIAL_PRACTICE: '社会实践',
  OTHER: '其他'
} as const

// 题目来源标签映射
export const TOPIC_SOURCE_LABELS = {
  [TOPIC_SOURCE.TEACHING_PRACTICE]: '教学实践',
  [TOPIC_SOURCE.SCIENTIFIC_RESEARCH]: '科研项目',
  [TOPIC_SOURCE.ENTERPRISE_COOPERATION]: '企业合作',
  [TOPIC_SOURCE.FRONTIER_TECHNOLOGY]: '前沿技术',
  [TOPIC_SOURCE.SOCIAL_PRACTICE]: '社会实践',
  [TOPIC_SOURCE.OTHER]: '其他'
} as const

// 题目类型枚举 (对应后端 TopicType)
export const TOPIC_TYPE = {
  THEORETICAL_RESEARCH: '理论研究',
  APPLIED_RESEARCH: '应用开发',
  OTHER: '其他'
} as const

// 题目类型标签映射
export const TOPIC_TYPE_LABELS = {
  [TOPIC_TYPE.THEORETICAL_RESEARCH]: '理论研究',
  [TOPIC_TYPE.APPLIED_RESEARCH]: '应用开发',
  [TOPIC_TYPE.OTHER]: '其他'
} as const

// 题目性质枚举 (对应后端 TopicNature)
export const TOPIC_NATURE = {
  ENGINEERING_DESIGN: '工程设计',
  SCIENTIFIC_RESEARCH: '科学研究',
  OTHER: '其他'
} as const

// 题目性质标签映射
export const TOPIC_NATURE_LABELS = {
  [TOPIC_NATURE.ENGINEERING_DESIGN]: '工程设计',
  [TOPIC_NATURE.SCIENTIFIC_RESEARCH]: '科学研究',
  [TOPIC_NATURE.OTHER]: '其他'
} as const

// 题目审核结果枚举 (用于院系管理员审核题目)
export const TOPIC_REVIEW_RESULT = {
  APPROVED: 1,    // 审核通过
  REJECTED: 2     // 审核驳回
} as const

// 题目审核结果标签映射
export const TOPIC_REVIEW_RESULT_LABELS = {
  [TOPIC_REVIEW_RESULT.APPROVED]: '审核通过',
  [TOPIC_REVIEW_RESULT.REJECTED]: '审核驳回'
} as const

// 导出类型定义
export type UserTypeEnum = typeof USER_TYPE_ENUM[keyof typeof USER_TYPE_ENUM]
export type SystemRole = typeof SYSTEM_ROLE[keyof typeof SYSTEM_ROLE]
export type AccountStatus = typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS]
export type TopicStatus = typeof TOPIC_STATUS[keyof typeof TOPIC_STATUS]
export type SelectionStatus = typeof SELECTION_STATUS[keyof typeof SELECTION_STATUS]
export type DocumentFileType = typeof DOCUMENT_FILE_TYPE[keyof typeof DOCUMENT_FILE_TYPE]
export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS]
export type GradeLevel = typeof GRADE_LEVEL[keyof typeof GRADE_LEVEL]
export type TopicReviewResult = typeof TOPIC_REVIEW_RESULT[keyof typeof TOPIC_REVIEW_RESULT]
export type TopicSource = typeof TOPIC_SOURCE[keyof typeof TOPIC_SOURCE]
export type TopicType = typeof TOPIC_TYPE[keyof typeof TOPIC_TYPE]
export type TopicNature = typeof TOPIC_NATURE[keyof typeof TOPIC_NATURE]