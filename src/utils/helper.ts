/**
 * 通用工具函数
 */

/**
 * 日期格式化
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 确认对话框选项
 */
export interface ConfirmOptions {
  /** 标题 */
  title?: string
  /** 消息内容 */
  message?: string
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 类型：warning/success/info/error */
  type?: 'warning' | 'success' | 'info' | 'error'
}

/**
 * 通用确认话框函数
 * @param options 配置选项
 * @returns Promise<void>
 * 
 * @example
 * // 基本用法
 * await showConfirm({ message: '确定要删除吗？' })
 * 
 * // 自定义配置
 * await showConfirm({
 *   title: '提示',
 *   message: '确定要发布该通知吗？',
 *   type: 'warning'
 * })
 */
export async function showConfirm(options: ConfirmOptions = {}): Promise<void> {
  const { ElMessageBox } = await import('element-plus')
  
  const {
    title = '提示',
    message = '确定要执行此操作吗？',
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    type = 'warning'
  } = options

  await ElMessageBox.confirm(message, title, {
    confirmButtonText,
    cancelButtonText,
    type
  })
}