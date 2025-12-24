import constants from '@/utils/constants'

export const saveLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

export const getLocalStorage = (key: string) => {
  const value = localStorage.getItem(key)
  return value ? value : null
}

export const clearLocalStorage = () => {
  localStorage.clear()
}

export const getFileUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) {
    return url
  }
  return `${constants.BASE_URL}/${url}`
}

export const urls2FileList = (url: any) => {
  const list: any = []
  if (url) {
    url.split(',').map((item: string) => {
      let url = getFileUrl(item)
      const file = {
        name: item,
        url: url,
      }
      list.push(file)
    })
  }
  return list
}
