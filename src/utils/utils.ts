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
 * url转fileList
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
      url: getFileUrl(item),
    }))
}
