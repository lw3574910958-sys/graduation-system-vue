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

// 课题状态枚举 (对应后端 BizTopic.status: 0-草稿，1-审核中，2-开放，3-关闭)
export const TOPIC_STATUS = {
  DRAFT: 0,       // 草稿
  REVIEWING: 1,   // 审核中
  OPEN: 2,        // 开放（审核通过）
  CLOSED: 3       // 关闭
} as const

// 课题状态标签映射
export const TOPIC_STATUS_LABELS = {
  [TOPIC_STATUS.DRAFT]: '草稿',
  [TOPIC_STATUS.REVIEWING]: '审核中',
  [TOPIC_STATUS.OPEN]: '开放',
  [TOPIC_STATUS.CLOSED]: '关闭'
} as const

// 题目审核结果枚举 (对应后端 BizTopic.last_review_outcome: NULL-未审，1-通过，2-驳回)
export const TOPIC_REVIEW_OUTCOME = {
  NULL: null,       // 未审核
  APPROVED: 1,      // 审核通过
  REJECTED: 2       // 审核驳回
} as const

// 题目审核结果标签映射（使用函数方式处理 null 键）
export const getTopicReviewOutcomeLabel = (outcome: number | null | undefined): string => {
  if (outcome === null || outcome === undefined) return '未审核'
  if (outcome === 1) return '审核通过'
  if (outcome === 2) return '审核驳回'
  return '未知'
}

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
  THESIS: 2        // 毕业论文
} as const

// 文档文件类型标签映射
export const DOCUMENT_FILE_TYPE_LABELS = {
  [DOCUMENT_FILE_TYPE.PROPOSAL]: '开题报告',
  [DOCUMENT_FILE_TYPE.MIDTERM]: '中期报告',
  [DOCUMENT_FILE_TYPE.THESIS]: '毕业论文'
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

// 绩点枚举（对应后端 GradeLevel 中的 GPA 值）
export const GPA_OPTIONS = [
  { label: '4.0', value: 4.0 },    // 优秀
  { label: '3.0', value: 3.0 },    // 良好
  { label: '2.0', value: 2.0 },    // 中等
  { label: '1.0', value: 1.0 },    // 及格
  { label: '0.0', value: 0.0 }     // 不及格
] as const

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

// 题目难度枚举 (对应后端 TopicDifficulty: 1-简单，2-适中，3-困难，4-很难，5-极难)
export const TOPIC_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  VERY_HARD: 4,
  EXTREME: 5
} as const

// 题目难度标签映射
export const TOPIC_DIFFICULTY_LABELS = {
  [TOPIC_DIFFICULTY.EASY]: '简单',
  [TOPIC_DIFFICULTY.MEDIUM]: '适中',
  [TOPIC_DIFFICULTY.HARD]: '困难',
  [TOPIC_DIFFICULTY.VERY_HARD]: '很难',
  [TOPIC_DIFFICULTY.EXTREME]: '极难'
} as const

// 题目工作量枚举 (对应后端 TopicWorkload: 1-少于 10 学时，2-10-20 学时，3-20-30 学时，4-30-40 学时，5-40 学时以上)
export const TOPIC_WORKLOAD = {
  LESS_THAN_10_HOURS: 1,
  TEN_TO_TWENTY_HOURS: 2,
  TWENTY_TO_THIRTY_HOURS: 3,
  THIRTY_TO_FORTY_HOURS: 4,
  MORE_THAN_FORTY_HOURS: 5
} as const

// 题目工作量标签映射
export const TOPIC_WORKLOAD_LABELS = {
  [TOPIC_WORKLOAD.LESS_THAN_10_HOURS]: '少于 10 学时',
  [TOPIC_WORKLOAD.TEN_TO_TWENTY_HOURS]: '10-20 学时',
  [TOPIC_WORKLOAD.TWENTY_TO_THIRTY_HOURS]: '20-30 学时',
  [TOPIC_WORKLOAD.THIRTY_TO_FORTY_HOURS]: '30-40 学时',
  [TOPIC_WORKLOAD.MORE_THAN_FORTY_HOURS]: '40 学时以上'
} as const

// 成绩类型枚举 (对应后端 GradeType: 0-开题报告，1-中期报告，2-毕业论文，3-综合成绩)
export const GRADE_TYPE = {
  PROPOSAL: 0,      // 开题报告
  MIDTERM: 1,       // 中期报告
  THESIS: 2,        // 毕业论文
  COMPOSITE: 3      // 综合成绩
} as const

// 成绩类型标签映射
export const GRADE_TYPE_LABELS = {
  [GRADE_TYPE.PROPOSAL]: '开题报告',
  [GRADE_TYPE.MIDTERM]: '中期报告',
  [GRADE_TYPE.THESIS]: '毕业论文',
  [GRADE_TYPE.COMPOSITE]: '综合成绩'
} as const

// 通知类型枚举 (对应后端 NoticeType: 1-系统通知, 2-公告, 3-提醒)
export const NOTICE_TYPE_ENUM = {
  SYSTEM_NOTICE: 1,
  ANNOUNCEMENT: 2,
  REMINDER: 3
} as const

// 通知类型标签映射
export const NOTICE_TYPE_LABELS = {
  [NOTICE_TYPE_ENUM.SYSTEM_NOTICE]: '系统通知',
  [NOTICE_TYPE_ENUM.ANNOUNCEMENT]: '公告',
  [NOTICE_TYPE_ENUM.REMINDER]: '提醒'
} as const

// 通知优先级枚举 (对应后端 NoticePriority: 1-低, 2-中, 3-高)
export const NOTICE_PRIORITY_ENUM = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
} as const

// 通知优先级标签映射
export const NOTICE_PRIORITY_LABELS = {
  [NOTICE_PRIORITY_ENUM.LOW]: '低',
  [NOTICE_PRIORITY_ENUM.MEDIUM]: '中',
  [NOTICE_PRIORITY_ENUM.HIGH]: '高'
} as const

// 目标范围枚举 (对应后端 TargetScope: 0-全体, 1-学生, 2-教师, 3-院系管理员)
export const TARGET_SCOPE_ENUM = {
  ALL: 0,
  STUDENT: 1,
  TEACHER: 2,
  DEPARTMENT_ADMIN: 3
} as const

// 目标范围标签映射
export const TARGET_SCOPE_LABELS = {
  [TARGET_SCOPE_ENUM.ALL]: '全体',
  [TARGET_SCOPE_ENUM.STUDENT]: '学生',
  [TARGET_SCOPE_ENUM.TEACHER]: '教师',
  [TARGET_SCOPE_ENUM.DEPARTMENT_ADMIN]: '院系管理员'
} as const

// 性别枚举 (对应后端 Gender: 0-女, 1-男)
export const GENDER_ENUM = {
  FEMALE: 0,
  MALE: 1
} as const

// 性别标签映射
export const GENDER_LABELS = {
  [GENDER_ENUM.FEMALE]: '女',
  [GENDER_ENUM.MALE]: '男'
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
export type GradeType = typeof GRADE_TYPE[keyof typeof GRADE_TYPE]
export type TopicSource = typeof TOPIC_SOURCE[keyof typeof TOPIC_SOURCE]
export type TopicType = typeof TOPIC_TYPE[keyof typeof TOPIC_TYPE]
export type TopicNature = typeof TOPIC_NATURE[keyof typeof TOPIC_NATURE]
export type TopicDifficulty = typeof TOPIC_DIFFICULTY[keyof typeof TOPIC_DIFFICULTY]
export type TopicWorkload = typeof TOPIC_WORKLOAD[keyof typeof TOPIC_WORKLOAD]
export type Gender = typeof GENDER_ENUM[keyof typeof GENDER_ENUM]