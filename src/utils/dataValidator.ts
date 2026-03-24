/**
 * 数据格式验证工具
 * 确保前后端数据传输格式的一致性
 */

import type { 
  UserCreateRequest, 
  UserUpdateRequest,
  UserQueryParams 
} from '@/types/api/user'
import type { 
  TopicResponse, 
  TopicCreateRequest, 
  TopicUpdateRequest,
  TopicQueryParams 
} from '@/types/api/topic'
import type { 
  DocumentResponse, 
  DocumentQueryParams,
  DocumentUploadRequest 
} from '@/types/api/document'
import type { DepartmentResponse } from '@/types/api/department'
import type { PageResponse, ApiResponse } from '@/types/global'

// 验证规则接口
interface ValidationRule {
  field: string
  type: string
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  enum?: any[]
  validator?: (value: any) => boolean
}

// 验证结果接口
interface ValidationResult {
  field: string
  valid: boolean
  message: string
  value: any
}

// 数据格式验证器
class DataFormatValidator {
  /**
   * 验证用户响应数据格式
   */
  validateUserResponse(data: any): ValidationResult[] {
    const rules: ValidationRule[] = [
      { field: 'id', type: 'number', required: true },
      { field: 'username', type: 'string', required: true, minLength: 3, maxLength: 20 },
      { field: 'realName', type: 'string', required: true, minLength: 2, maxLength: 50 },
      { field: 'email', type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { field: 'phone', type: 'string', required: false, pattern: /^1[3-9]\d{9}$/ },
      { field: 'userType', type: 'number', required: true, enum: [1, 2, 3] },
      { field: 'accountStatus', type: 'number', required: true, enum: [0, 1] },
      { field: 'departmentId', type: 'number', required: true },
      { field: 'createTime', type: 'string', required: true },
      { field: 'updateTime', type: 'string', required: true }
    ]
    
    return this.validateObject(data, rules)
  }

  /**
   * 验证用户创建请求数据格式
   */
  validateUserCreateRequest(data: any): ValidationResult[] {
    const rules: ValidationRule[] = [
      { field: 'username', type: 'string', required: true, minLength: 3, maxLength: 20 },
      { field: 'password', type: 'string', required: true, minLength: 6, maxLength: 20 },
      { field: 'realName', type: 'string', required: true, minLength: 2, maxLength: 50 },
      { field: 'email', type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { field: 'phone', type: 'string', required: false, pattern: /^1[3-9]\d{9}$/ },
      { field: 'userType', type: 'number', required: true, enum: [1, 2, 3] },
      { field: 'departmentId', type: 'number', required: true }
    ]
    
    return this.validateObject(data, rules)
  }

  /**
   * 验证选题响应数据格式
   */
  validateTopicResponse(data: any): ValidationResult[] {
    const rules: ValidationRule[] = [
      { field: 'id', type: 'number', required: true },
      { field: 'title', type: 'string', required: true, minLength: 1, maxLength: 200 },
      { field: 'description', type: 'string', required: true, minLength: 10, maxLength: 1000 },
      { field: 'teacherId', type: 'number', required: true },
      { field: 'maxStudents', type: 'number', required: true, validator: (v) => v >= 1 && v <= 10 },
      { field: 'currentStudents', type: 'number', required: true, validator: (v) => v >= 0 },
      { field: 'status', type: 'number', required: true, enum: [0, 1, 2, 3] },
      { field: 'departmentId', type: 'number', required: true },
      { field: 'createTime', type: 'string', required: true },
      { field: 'updateTime', type: 'string', required: true }
    ]
    
    return this.validateObject(data, rules)
  }

  /**
   * 验证文档响应数据格式
   */
  validateDocumentResponse(data: any): ValidationResult[] {
    const rules: ValidationRule[] = [
      { field: 'id', type: 'number', required: true },
      { field: 'fileName', type: 'string', required: true, minLength: 1, maxLength: 255 },
      { field: 'fileSize', type: 'number', required: true, validator: (v) => v > 0 },
      { field: 'fileType', type: 'string', required: true },
      { field: 'filePath', type: 'string', required: true },
      { field: 'userId', type: 'number', required: true },
      { field: 'status', type: 'number', required: true, enum: [0, 1, 2] },
      { field: 'createTime', type: 'string', required: true }
    ]
    
    return this.validateObject(data, rules)
  }

  /**
   * 验证分页响应数据格式
   */
  validatePageResponse(data: any): ValidationResult[] {
    const rules: ValidationRule[] = [
      { field: 'records', type: 'array', required: true },
      { field: 'total', type: 'number', required: true, validator: (v) => v >= 0 },
      { field: 'current', type: 'number', required: true, validator: (v) => v >= 1 },
      { field: 'size', type: 'number', required: true, validator: (v) => v >= 1 },
      { field: 'pages', type: 'number', required: true, validator: (v) => v >= 0 }
    ]
    
    return this.validateObject(data, rules)
  }

  /**
   * 验证通用响应数据格式
   */
  validateApiResponse(data: any): ValidationResult[] {
    const rules: ValidationRule[] = [
      { field: 'code', type: 'number', required: true },
      { field: 'message', type: 'string', required: true },
      { field: 'data', type: 'any', required: false }
    ]
    
    return this.validateObject(data, rules)
  }

  /**
   * 验证对象数据
   */
  private validateObject(obj: any, rules: ValidationRule[]): ValidationResult[] {
    const results: ValidationResult[] = []
    
    if (!obj || typeof obj !== 'object') {
      return [{
        field: 'root',
        valid: false,
        message: '数据必须是对象类型',
        value: obj
      }]
    }
    
    for (const rule of rules) {
      const value = obj[rule.field]
      const fieldResult = this.validateField(value, rule)
      const result: ValidationResult = {
        ...fieldResult,
        field: rule.field,
        value: value
      }
      results.push(result)
    }
    
    // 检查是否有额外的字段
    const expectedFields = rules.map(r => r.field)
    const actualFields = Object.keys(obj)
    const extraFields = actualFields.filter(field => !expectedFields.includes(field))
    
    if (extraFields.length > 0) {
      results.push({
        field: 'extra_fields',
        valid: false,
        message: `存在未定义的字段: ${extraFields.join(', ')}`,
        value: extraFields
      })
    }
    
    return results
  }

  /**
   * 验证单个字段
   */
  private validateField(value: any, rule: ValidationRule): Omit<ValidationResult, 'field' | 'value'> {
    // 检查必填字段
    if (rule.required && (value === undefined || value === null)) {
      return {
        valid: false,
        message: `${rule.field} 是必填字段`
      }
    }
    
    // 如果值为空且非必填，视为通过
    if (!rule.required && (value === undefined || value === null)) {
      return {
        valid: true,
        message: '字段验证通过'
      }
    }
    
    // 检查类型
    if (rule.type !== 'any') {
      const typeValid = this.checkType(value, rule.type)
      if (!typeValid) {
        return {
          valid: false,
          message: `${rule.field} 类型应该是 ${rule.type}，实际是 ${typeof value}`
        }
      }
    }
    
    // 检查长度
    if ((rule.minLength !== undefined || rule.maxLength !== undefined) && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return {
          valid: false,
          message: `${rule.field} 长度不能少于 ${rule.minLength} 个字符`
        }
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return {
          valid: false,
          message: `${rule.field} 长度不能超过 ${rule.maxLength} 个字符`
        }
      }
    }
    
    // 检查数值范围
    if ((rule.minLength !== undefined || rule.maxLength !== undefined) && typeof value === 'number') {
      if (rule.minLength !== undefined && value < rule.minLength) {
        return {
          valid: false,
          message: `${rule.field} 不能小于 ${rule.minLength}`
        }
      }
      if (rule.maxLength !== undefined && value > rule.maxLength) {
        return {
          valid: false,
          message: `${rule.field} 不能大于 ${rule.maxLength}`
        }
      }
    }
    
    // 检查枚举值
    if (rule.enum && !rule.enum.includes(value)) {
      return {
        valid: false,
        message: `${rule.field} 的值 ${value} 不在允许的范围内: [${rule.enum.join(', ')}]`
      }
    }
    
    // 检查正则表达式
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return {
          valid: false,
          message: `${rule.field} 格式不正确`
        }
      }
    }
    
    // 自定义验证器
    if (rule.validator && !rule.validator(value)) {
      return {
        valid: false,
        message: `${rule.field} 自定义验证失败`
      }
    }
    
    return {
      valid: true,
      message: '字段验证通过'
    }
  }

  /**
   * 检查数据类型
   */
  private checkType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      default:
        return true // 'any' 类型总是通过
    }
  }

  /**
   * 格式化验证结果
   */
  formatValidationResults(results: ValidationResult[]): string {
    const invalidResults = results.filter(r => !r.valid)
    
    if (invalidResults.length === 0) {
      return '✅ 所有字段验证通过'
    }
    
    const messages = invalidResults.map(r => 
      `❌ ${r.field}: ${r.message} (值: ${JSON.stringify(r.value)})`
    )
    
    return messages.join('\n')
  }

  /**
   * 批量验证多个数据对象
   */
  batchValidate<T>(
    dataArray: T[], 
    validator: (data: T) => ValidationResult[]
  ): { 
    total: number, 
    passed: number, 
    failed: number, 
    details: { index: number; results: ValidationResult[] }[] 
  } {
    const details = dataArray.map((data, index) => ({
      index,
      results: validator(data)
    }))
    
    const passed = details.filter(d => d.results.every(r => r.valid)).length
    const failed = details.length - passed
    
    return {
      total: dataArray.length,
      passed,
      failed,
      details
    }
  }
}

// 创建验证器实例
export const dataValidator = new DataFormatValidator()

// 导出便捷验证方法
export const validateUserResponse = (data: any) => dataValidator.validateUserResponse(data)
export const validateUserCreateRequest = (data: any) => dataValidator.validateUserCreateRequest(data)
export const validateTopicResponse = (data: any) => dataValidator.validateTopicResponse(data)
export const validateDocumentResponse = (data: any) => dataValidator.validateDocumentResponse(data)
export const validatePageResponse = (data: any) => dataValidator.validatePageResponse(data)
export const validateApiResponse = (data: any) => dataValidator.validateApiResponse(data)

export default dataValidator