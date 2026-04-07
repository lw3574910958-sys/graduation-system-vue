/**
 * 通用文件下载工具
 * 提供统一的文件下载功能，支持 Token 认证和 RFC 5987 文件名编码
 */

import { ElMessage, ElLoading } from 'element-plus'
import storageUtil from '@/utils/storage'
import { SYSTEM_CONSTANTS } from '@/constants'

/**
 * 文件下载选项
 */
export interface DownloadOptions {
  /** API 基础 URL */
  apiBaseUrl?: string
  /** 加载提示文本 */
  loadingText?: string
  /** 成功提示文本 */
  successText?: string
  /** 是否显示加载动画 */
  showLoading?: boolean
}

/**
 * 通用文件下载函数
 * @param url 下载接口 URL
 * @param options 下载选项
 * @returns Promise<void>
 * 
 * @example
 * // 基本用法
 * await downloadFile('/api/documents/123/download')
 * 
 * // 自定义选项
 * await downloadFile('/api/notices/download-attachment?attachmentUrl=xxx', {
 *   loadingText: '正在下载附件...',
 *   successText: '附件下载成功'
 * })
 */
export async function downloadFile(
  url: string,
  options: DownloadOptions = {}
): Promise<void> {
  const {
    apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '',
    loadingText = '正在下载文件...',
    successText = '文件下载成功',
    showLoading = true
  } = options

  let loadingInstance: ReturnType<typeof ElLoading.service> | undefined

  try {
    // 显示加载状态
    if (showLoading) {
      loadingInstance = ElLoading.service({
        text: loadingText,
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }

    // 获取 Token
    const token = storageUtil.get(SYSTEM_CONSTANTS.TOKEN_NAME)

    // 发起请求
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'GET',
      headers: {
        // 使用配置的 TOKEN_NAME 作为 header 名称，与后端 Sa-Token 配置一致
        [SYSTEM_CONSTANTS.TOKEN_NAME]: token
          ? `${SYSTEM_CONSTANTS.TOKEN_PREFIX}${token.replace(/^Bearer\s*/i, '').trim()}`
          : ''
      }
    })

    // 检查响应状态
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('无权下载该文件')
      }
      if (response.status === 404) {
        throw new Error('文件不存在')
      }
      throw new Error(`下载失败：${response.status} ${response.statusText}`)
    }

    // 从 Content-Disposition header 获取文件名（支持 RFC 5987 编码）
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'file'

    if (contentDisposition) {
      // 尝试解析 RFC 5987 编码的文件名（filename*=UTF-8''encoded_filename）
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;\n]*)/i)
      if (filenameStarMatch && filenameStarMatch[1]) {
        filename = decodeURIComponent(filenameStarMatch[1])
      } else {
        // 尝试解析普通 filename 参数
        const filenameMatch = contentDisposition.match(/filename[\s]*=[\s]*([^;\n]*)/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/"/g, ''))
        }
      }
    }

    // 获取文件内容
    const blob = await response.blob()

    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    // 关闭加载动画
    if (loadingInstance) {
      loadingInstance.close()
    }

    // 显示成功消息
    ElMessage.success(successText)
  } catch (error: any) {
    console.error('文件下载失败:', error)
    ElMessage.error(error.message || '文件下载失败')
    loadingInstance?.close()
    throw error
  }
}

/**
 * 文档下载辅助函数
 * @param documentId 文档 ID
 * @param options 下载选项
 */
export async function downloadDocument(
  documentId: number | string,
  options?: DownloadOptions
): Promise<void> {
  return downloadFile(`/api/documents/${documentId}/download`, {
    loadingText: '正在下载文档...',
    successText: '文档下载成功',
    ...options
  })
}

/**
 * 公告附件下载辅助函数
 * @param attachmentUrl 附件 URL（相对路径）
 * @param options 下载选项
 */
export async function downloadNoticeAttachment(
  attachmentUrl: string,
  options?: DownloadOptions
): Promise<void> {
  if (!attachmentUrl) {
    ElMessage.warning('该公告没有附件')
    return
  }

  return downloadFile(
    `/api/notices/download-attachment?attachmentUrl=${encodeURIComponent(attachmentUrl)}`,
    {
      loadingText: '正在下载附件...',
      successText: '附件下载成功',
      ...options
    }
  )
}
