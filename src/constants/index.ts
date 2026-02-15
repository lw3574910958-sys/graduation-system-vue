/**
 * 统一常量定义
 */

// API状态码
export const API_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const

// 用户类型
export const USER_TYPE = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const

// 用户类型标签映射
export const USER_TYPE_LABELS = {
  [USER_TYPE.STUDENT]: '学生',
  [USER_TYPE.TEACHER]: '教师',
  [USER_TYPE.ADMIN]: '管理员',
} as const

// 通用消息
export const MESSAGE = {
  LOGIN_SUCCESS: '登录成功',
  SELECT_DATA: '请至少选择一条数据',
  CONFIRM_DELETE: '确定要删除选中的数据吗？',
  DELETE_SUCCESS: '删除成功',
  OPERATION_FAILED: '操作失败',
  CANCEL_DELETE: '已取消删除',
  NETWORK_ERROR: '网络连接异常，请检查网络后重试',
  REQUEST_FAILED: '请求失败，请稍后重试！',
  FORMAT_ERROR: '数据格式错误',
  SUBMIT_FAILED: '提交失败，请重试',
  RESET_PASSWORD_SUCCESS: '密码重置成功',
  CONFIRM_LOGOUT: '确定要退出登录吗？',
  UPLOAD_SUCCESS: '上传成功',
  UPLOAD_FAILED: '上传失败',
  LOGIN_EXPIRED: '登录已过期，请重新登录',
  USERNAME_EXISTS: '用户名已存在，请选择其他用户名',
  INVALID_USER_TYPE: '无效的用户类型',
} as const

// 系统常量
export const SYSTEM_CONSTANTS = {
  PAGE_SIZE: 10,
  TOKEN_NAME: 'user_token',
  TOKEN_PREFIX: 'Bearer ',
  LOGIN_PATH: '/login',
  USER_INFO_KEY: 'user_info',
  REQUEST_TIMEOUT: 10000, // 默认请求超时时间
  USER_INFO_FETCH_TIMEOUT: 8000, // 获取用户信息超时时间
} as const

// 文件类型
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  DOCUMENT: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  AUDIO: ['mp3', 'wav', 'ogg', 'aac'],
} as const

// 用户状态
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const

// 用户状态标签映射
export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: '启用',
  [USER_STATUS.INACTIVE]: '禁用',
} as const

// 课题状态
export const TOPIC_STATUS = {
  OPEN: 0,
  SELECTED: 1,
  CLOSED: 2,
} as const

// 课题状态标签映射
export const TOPIC_STATUS_LABELS = {
  [TOPIC_STATUS.OPEN]: '开放',
  [TOPIC_STATUS.SELECTED]: '已选',
  [TOPIC_STATUS.CLOSED]: '关闭',
} as const
