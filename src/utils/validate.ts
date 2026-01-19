/**
 * 表单校验规则
 */

import { reactive } from 'vue';

// 邮箱校验正则
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 手机号校验正则
const phonePattern = /^1[3-9]\d{9}$/;

// 身份证号校验正则
const idCardPattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;

// 密码强度校验正则（至少8位，包含数字、字母、特殊字符）
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 用户名校验规则（支持字母、数字、下划线，4-20位）
const usernamePattern = /^[a-zA-Z0-9_]{4,20}$/;

// 通用校验规则
export const commonRules = {
  // 必填项校验
  required: (message: string = '此为必填项') => ({
    required: true,
    message,
    trigger: 'blur' as const
  }),

  // 邮箱校验
  email: (message: string = '请输入正确的邮箱地址') => ({
    pattern: emailPattern,
    message,
    trigger: 'blur' as const
  }),

  // 手机号校验
  phone: (message: string = '请输入正确的手机号码') => ({
    pattern: phonePattern,
    message,
    trigger: 'blur' as const
  }),

  // 身份证号校验
  idCard: (message: string = '请输入正确的身份证号码') => ({
    pattern: idCardPattern,
    message,
    trigger: 'blur' as const
  }),

  // 用户名校验
  username: (message: string = '用户名格式不正确') => ({
    pattern: usernamePattern,
    message,
    trigger: 'blur' as const
  }),

  // 密码校验
  password: (message: string = '密码格式不正确') => ({
    pattern: passwordPattern,
    message,
    trigger: 'blur' as const
  }),

  // 长度校验
  length: (min: number, max: number, message?: string) => ({
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur' as const
  }),

  // 最小长度校验
  minLength: (min: number, message?: string) => ({
    min,
    message: message || `长度不能少于 ${min} 个字符`,
    trigger: 'blur' as const
  }),

  // 最大长度校验
  maxLength: (max: number, message?: string) => ({
    max,
    message: message || `长度不能超过 ${max} 个字符`,
    trigger: 'blur' as const
  })
};

// 表单验证器
export class FormValidator {
  /**
   * 验证表单
   * @param formRef 表单引用
   * @returns 是否通过验证
   */
  static async validate(formRef: any): Promise<boolean> {
    if (!formRef) {
      console.warn('表单引用未找到');
      return false;
    }

    try {
      await formRef.validate();
      return true;
    } catch (error) {
      console.error('表单验证失败:', error);
      return false;
    }
  }

  /**
   * 清除表单验证
   * @param formRef 表单引用
   */
  static clearValidate(formRef: any): void {
    if (formRef) {
      formRef.clearValidate();
    }
  }

  /**
   * 验证单个字段
   * @param formRef 表单引用
   * @param field 字段名
   * @returns 是否通过验证
   */
  static async validateField(formRef: any, field: string): Promise<boolean> {
    if (!formRef) {
      console.warn('表单引用未找到');
      return false;
    }

    try {
      await formRef.validateField(field);
      return true;
    } catch (error) {
      console.error(`字段 ${field} 验证失败:`, error);
      return false;
    }
  }
}

// 创建响应式的表单验证规则
export function createFormRules(rules: Record<string, any>) {
  return reactive(rules);
}