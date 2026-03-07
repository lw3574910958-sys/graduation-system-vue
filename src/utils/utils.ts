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
      // 如果路径不以 / 开头，添加 /files 前缀（因为数据库存储的是相对路径如 avatar/xxx.jpg）
      // 如果路径以 / 但不以 /files 开头，也添加 /files 前缀
      url: item.startsWith('/files') 
        ? normalizePath(constants.BASE_URL, item)
        : item.startsWith('/')
          ? normalizePath(constants.BASE_URL, '/files' + item)
          : normalizePath(constants.BASE_URL, '/files/' + item),
    }))
}
