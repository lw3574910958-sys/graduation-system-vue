/**
 * 增强表单验证工具
 * 提供统一的表单验证和提交体验
 */

import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

// 验证规则配置
interface ValidationConfig {
  trigger?: 'blur' | 'change' | ('blur' | 'change')[]
  requiredMessage?: string
  patternMessage?: string
  minLengthMessage?: string
  maxLengthMessage?: string
}

// 表单提交配置
interface SubmitConfig {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

// 增强表单验证器
class EnhancedFormValidator {
  private defaultConfig: ValidationConfig = {
    trigger: 'blur',
    requiredMessage: '此项为必填项',
    patternMessage: '格式不正确',
    minLengthMessage: '长度不能少于 {min} 个字符',
    maxLengthMessage: '长度不能超过 {max} 个字符'
  }

  /**
   * 创建必填验证规则
   */
  required(message?: string, config: Partial<ValidationConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config }
    return {
      required: true,
      message: message || finalConfig.requiredMessage,
      trigger: finalConfig.trigger
    }
  }

  /**
   * 创建邮箱验证规则
   */
  email(message?: string, config: Partial<ValidationConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config }
    return [
      this.required(undefined, config),
      {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: message || finalConfig.patternMessage,
        trigger: finalConfig.trigger
      }
    ]
  }

  /**
   * 创建手机号验证规则
   */
  phone(message?: string, config: Partial<ValidationConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config }
    return [
      this.required(undefined, config),
      {
        pattern: /^1[3-9]\d{9}$/,
        message: message || finalConfig.patternMessage,
        trigger: finalConfig.trigger
      }
    ]
  }

  /**
   * 创建长度验证规则
   */
  length(min: number, max: number, config: Partial<ValidationConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config }
    return [
      {
        min,
        max,
        message: finalConfig.minLengthMessage?.replace('{min}', min.toString()) + 
                 '，' + 
                 finalConfig.maxLengthMessage?.replace('{max}', max.toString()),
        trigger: finalConfig.trigger
      }
    ]
  }

  /**
   * 创建用户名验证规则
   */
  username(config: Partial<ValidationConfig> = {}) {
    return [
      this.required('请输入用户名', config),
      ...this.length(3, 20, config),
      {
        pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
        message: '用户名只能包含字母、数字、下划线和中文',
        trigger: config.trigger || this.defaultConfig.trigger
      }
    ]
  }

  /**
   * 创建密码验证规则
   */
  password(config: Partial<ValidationConfig> = {}) {
    return [
      this.required('请输入密码', config),
      ...this.length(6, 20, config),
      {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
        message: '密码必须包含大小写字母和数字，长度6-20位',
        trigger: config.trigger || this.defaultConfig.trigger
      }
    ]
  }

  /**
   * 增强表单提交
   */
  async enhancedSubmit(
    formRef: FormInstance | undefined,
    submitFunction: () => Promise<any>,
    config: SubmitConfig = {}
  ): Promise<boolean> {
    const defaultSubmitConfig: Required<SubmitConfig> = {
      loadingMessage: '提交中...',
      successMessage: '操作成功',
      errorMessage: '操作失败',
      showSuccessToast: true,
      showErrorToast: true
    }
    
    const finalConfig = { ...defaultSubmitConfig, ...config }

    if (!formRef) {
      console.error('表单引用不存在')
      return false
    }

    try {
      // 表单验证
      await formRef.validate()
      
      // 显示loading状态
      // 这里可以通过全局状态管理显示loading
      console.log(finalConfig.loadingMessage)
      
      // 执行提交
      await submitFunction()
      
      // 显示成功消息
      if (finalConfig.showSuccessToast) {
        ElMessage.success(finalConfig.successMessage)
      }
      
      return true
    } catch (error: any) {
      // 显示错误消息
      if (finalConfig.showErrorToast) {
        const errorMessage = error.message || finalConfig.errorMessage
        ElMessage.error(errorMessage)
      }
      
      console.error('表单提交失败:', error)
      return false
    }
  }

  /**
   * 批量验证表单字段
   */
  async validateFields(formRef: FormInstance | undefined, fields: string[]): Promise<boolean> {
    if (!formRef) {
      console.error('表单引用不存在')
      return false
    }

    try {
      await formRef.validateField(fields)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 清除表单验证状态
   */
  clearValidate(formRef: FormInstance | undefined, fields?: string[]) {
    if (!formRef) return
    formRef.clearValidate(fields)
  }

  /**
   * 重置表单
   */
  resetForm(formRef: FormInstance | undefined) {
    if (!formRef) return
    formRef.resetFields()
  }
}

// 创建实例
export const formValidator = new EnhancedFormValidator()

// 导出常用验证规则
export const required = (message?: string) => formValidator.required(message)
export const email = (message?: string) => formValidator.email(message)
export const phone = (message?: string) => formValidator.phone(message)
export const username = () => formValidator.username()
export const password = () => formValidator.password()

// 导出表单操作方法
export const enhancedSubmit = (
  formRef: FormInstance | undefined,
  submitFunction: () => Promise<any>,
  config?: SubmitConfig
) => formValidator.enhancedSubmit(formRef, submitFunction, config)

export const validateFields = (formRef: FormInstance | undefined, fields: string[]) => 
  formValidator.validateFields(formRef, fields)

export const clearValidate = (formRef: FormInstance | undefined, fields?: string[]) => 
  formValidator.clearValidate(formRef, fields)

export const resetForm = (formRef: FormInstance | undefined) => 
  formValidator.resetForm(formRef)

export default formValidator