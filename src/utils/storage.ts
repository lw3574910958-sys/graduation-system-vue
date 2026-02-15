/**
 * 存储工具类
 */
import constants from '@/utils/constants'

interface StorageOptions {
  expire?: number // 过期时间（秒）
}

class StorageUtil {
  /**
   * 设置存储值
   * @param key 键
   * @param value 值
   * @param storage 存储对象 (localStorage 或 sessionStorage)
   * @param options 选项
   */
  set(key: string, value: any, storage: Storage = localStorage, options?: StorageOptions) {
    try {
      // 对于token这类简单的字符串值，直接存储而不包装
      if (key === constants.TOKEN_NAME && typeof value === 'string') {
        storage.setItem(key, value)
      } else {
        const data = {
          value,
          timestamp: Date.now(),
          expire: options?.expire ? Date.now() + options.expire * 1000 : null,
        }
        storage.setItem(key, JSON.stringify(data))
      }
    } catch (error) {
      console.error(`设置 ${key} 失败:`, error)
    }
  }

  /**
   * 获取存储值
   * @param key 键
   * @param storage 存储对象 (localStorage 或 sessionStorage)
   * @returns 值
   */
  get(key: string, storage: Storage = localStorage) {
    try {
      const item = storage.getItem(key)
      if (!item) return null

      // 对于token这类简单的字符串值，直接返回
      if (key === constants.TOKEN_NAME) {
        return item
      }

      // 尝试解析JSON格式的数据
      try {
        const data = JSON.parse(item)

        // 检查是否过期
        if (data.expire && Date.now() > data.expire) {
          storage.removeItem(key)
          return null
        }

        return data.value
      } catch (e) {
        // 如果不是JSON格式，则直接返回原始值
        return item
      }
    } catch (error) {
      console.error(`获取 ${key} 失败:`, error)
      return null
    }
  }

  /**
   * 删除存储值
   * @param key 键
   * @param storage 存储对象 (localStorage 或 sessionStorage)
   */
  remove(key: string, storage: Storage = localStorage) {
    try {
      storage.removeItem(key)
    } catch (error) {
      console.error(`删除 ${key} 失败:`, error)
    }
  }

  /**
   * 清空存储
   * @param storage 存储对象 (localStorage 或 sessionStorage)
   */
  clear(storage: Storage = localStorage) {
    try {
      storage.clear()
    } catch (error) {
      console.error('清空存储失败:', error)
    }
  }

  /**
   * 获取存储大小
   * @param storage 存储对象 (localStorage 或 sessionStorage)
   * @returns 存储大小（字符数）
   */
  size(storage: Storage = localStorage) {
    try {
      return JSON.stringify(storage).length
    } catch (error) {
      console.error('获取存储大小失败:', error)
      return 0
    }
  }
}

export default new StorageUtil()
