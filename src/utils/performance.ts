/**
 * 性能优化工具集
 */

import { ref, watch, onUnmounted, computed } from 'vue'

// 防抖函数类型
type DebounceFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void

// 节流函数类型
type ThrottleFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void

/**
 * 防抖 Hook
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  immediate: boolean = false
): DebounceFunction<T> {
  let timeoutId: number | null = null
  
  const debouncedFn: DebounceFunction<T> = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    if (immediate && !timeoutId) {
      fn(...args)
    }
    
    timeoutId = window.setTimeout(() => {
      if (!immediate) {
        fn(...args)
      }
      timeoutId = null
    }, delay)
  }
  
  // 清理函数
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  // 在组件卸载时自动清理
  onUnmounted(cancel)
  
  // 添加取消方法到返回函数上
  Object.assign(debouncedFn, { cancel })
  
  return debouncedFn
}

/**
 * 节流 Hook
 * @param fn 要节流的函数
 * @param delay 节流间隔（毫秒）
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ThrottleFunction<T> {
  let lastExecTime = 0
  let timeoutId: number | null = null
  
  const throttledFn: ThrottleFunction<T> = (...args: Parameters<T>) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime >= delay) {
      fn(...args)
      lastExecTime = currentTime
    } else {
      // 确保最后一次调用会被执行
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        fn(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
  
  // 清理函数
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastExecTime = 0
  }
  
  // 在组件卸载时自动清理
  onUnmounted(cancel)
  
  // 添加取消方法到返回函数上
  Object.assign(throttledFn, { cancel })
  
  return throttledFn
}

/**
 * 搜索防抖 Hook
 * @param searchFn 搜索函数
 * @param delay 防抖延迟
 * @returns 包含搜索函数和加载状态的响应式对象
 */
export function useSearchDebounce<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 500
) {
  const loading = ref(false)
  const searchResult = ref<T | null>(null)
  const error = ref<Error | null>(null)
  
  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query.trim()) {
      searchResult.value = null
      return
    }
    
    try {
      loading.value = true
      error.value = null
      const result = await searchFn(query)
      searchResult.value = result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('搜索失败')
      searchResult.value = null
    } finally {
      loading.value = false
    }
  }, delay)
  
  return {
    search: debouncedSearch,
    loading,
    result: searchResult,
    error
  }
}

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollOptions {
  itemHeight: number
  bufferSize?: number
  throttleDelay?: number
}

/**
 * 虚拟滚动 Hook
 * @param containerRef 容器引用
 * @param items 数据项数组
 * @param options 配置选项
 * @returns 虚拟滚动相关信息
 */
export function useVirtualScroll<T>(
  containerRef: HTMLElement | null,
  items: T[],
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    bufferSize = 5,
    throttleDelay = 16 // ~60fps
  } = options
  
  const scrollTop = ref(0)
  const containerHeight = ref(0)
  
  // 计算可见区域
  const visibleRange = computed(() => {
    const startIndex = Math.floor(scrollTop.value / itemHeight)
    const visibleCount = Math.ceil(containerHeight.value / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount + bufferSize, items.length)
    
    return {
      start: Math.max(0, startIndex - bufferSize),
      end: endIndex,
      offset: startIndex * itemHeight
    }
  })
  
  // 可见项
  const visibleItems = computed(() => {
    const range = visibleRange.value
    return items.slice(range.start, range.end)
  })
  
  // 滚动处理
  const handleScroll = useThrottle((event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }, throttleDelay)
  
  // 容器尺寸变化处理
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      containerHeight.value = entry.contentRect.height
    }
  })
  
  // 监听容器引用变化
  watch(() => containerRef, (newContainer, oldContainer) => {
    if (oldContainer) {
      oldContainer.removeEventListener('scroll', handleScroll)
      resizeObserver.unobserve(oldContainer)
    }
    
    if (newContainer) {
      newContainer.addEventListener('scroll', handleScroll)
      resizeObserver.observe(newContainer)
      containerHeight.value = newContainer.clientHeight
    }
  }, { immediate: true })
  
  // 清理
  onUnmounted(() => {
    if (containerRef) {
      containerRef.removeEventListener('scroll', handleScroll)
      resizeObserver.unobserve(containerRef)
    }
  })
  
  return {
    visibleItems,
    visibleRange,
    scrollTop,
    containerHeight
  }
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private monitoring = false
  private intervalId: number | null = null
  
  private constructor() {}
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }
  
  startMonitoring(callback: (memoryInfo: any) => void, interval: number = 5000) {
    // @ts-ignore - performance.memory 是 Chrome 特有的 API
    if (this.monitoring || !(performance as any).memory) return
    
    this.monitoring = true
    this.intervalId = window.setInterval(() => {
      // @ts-ignore - performance.memory 是 Chrome 特有的 API
      if ((performance as any).memory) {
        const perf = performance as any;
        const memoryInfo = {
          used: Math.round(perf.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(perf.memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(perf.memory.jsHeapSizeLimit / 1048576), // MB
          timestamp: Date.now()
        }
        callback(memoryInfo)
      }
    }, interval)
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.monitoring = false
  }
}

// 导出常用的性能优化组合
export const performanceUtils = {
  useDebounce,
  useThrottle,
  useSearchDebounce,
  useVirtualScroll,
  MemoryMonitor
}