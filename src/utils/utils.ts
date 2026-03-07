/**
 * @description: 通用工具类
 */

import constants from '@/utils/constants'

// ==================== File URL ====================

const normalizePath = (base: string, path: string): string => {
  const cleanBase = base.replace(/\/+$/, '')
  const cleanPath = path.replace(/^\/+/, '')
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase
}

/**
 * 获取文件url
 * @param url
 * @returns
 */
export const getFileUrl = (url: string): string => {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) {
    return url
  }
  return normalizePath(constants.BASE_URL, url)
}

// ==================== File List ====================
export interface FileItem {
  name: string
  url: string
}

/**
 * url 转 fileList
 * @param url
 * @returns
 */
export const urls2FileList = (url: string | null | undefined): FileItem[] => {
  if (!url || typeof url !== 'string') {
    return []
  }
  return url
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item)
    .map((item) => ({
      name: item,
      // ✅ 修复：如果已经是完整 URL，直接使用，不再拼接
      url: item.startsWith('http')
        ? item  // 已经是完整 URL，直接使用
        : item.startsWith('/files') 
          ? normalizePath(constants.BASE_URL, item)  // 有 /files 前缀
          : item.startsWith('/')
            ? normalizePath(constants.BASE_URL, '/files' + item)  // 有 / 但没有 /files
            : normalizePath(constants.BASE_URL, '/files/' + item),  // 没有 /
    }))
}
