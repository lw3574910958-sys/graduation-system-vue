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
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (typeof obj === 'object') {
    const clonedObj: any = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }

  return obj as T;
}

/**
 * 防抖函数
 * @param func 函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param func 函数
 * @param delay 延迟时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecTime = 0;

  return function (this: any, ...args: Parameters<T>): void {
    const currentTime = Date.now();

    if (currentTime - lastExecTime >= delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    }
  };
}

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 对象转查询字符串
 * @param obj 对象
 * @returns 查询字符串
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const pairs: string[] = [];
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
        });
      } else {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
  });

  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

/**
 * 查询字符串转对象
 * @param str 查询字符串
 * @returns 对象
 */
export function queryStringToObject(str: string): Record<string, any> {
  const obj: Record<string, any> = {};
  const pairs = str.replace(/^\?/, '').split('&');

  pairs.forEach(pair => {
    if (pair) {
      const [key, value] = pair.split('=');
      if (key) {
        obj[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
  });

  return obj;
}

/**
 * 数组去重
 * @param arr 数组
 * @returns 去重后的数组
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 获取URL参数
 * @param name 参数名
 * @param url URL
 * @returns 参数值
 */
export function getUrlParam(name: string, url?: string): string | null {
  const targetUrl = url || window.location.href;
  const reg = new RegExp(`[?&]${name}=([^&#]*)`, 'i');
  const result = reg.exec(targetUrl);
  return result && result[1] ? decodeURIComponent(result[1]) : null;
}