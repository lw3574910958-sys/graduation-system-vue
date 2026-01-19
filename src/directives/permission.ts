/**
 * 权限指令 v-permission
 * 用于控制元素的显示与隐藏
 */

import { useAuthStore } from '@/stores';

interface PermissionDirectiveElement extends HTMLElement {
  _originalDisplay?: string;
}

export const permission = {
  mounted(el: PermissionDirectiveElement, binding: { value: string }) {
    const { value } = binding;
    const authStore = useAuthStore();
    
    // 如果没有权限，则隐藏该元素
    if (!checkPermission(value, authStore.userInfo?.userType)) {
      el._originalDisplay = el.style.display;
      el.style.display = 'none';
    }
  },
  updated(el: PermissionDirectiveElement, binding: { value: string }) {
    const { value } = binding;
    const authStore = useAuthStore();
    
    if (!checkPermission(value, authStore.userInfo?.userType)) {
      el.style.display = 'none';
    } else {
      el.style.display = el._originalDisplay || '';
    }
  }
};

function checkPermission(permission: string, userType?: string): boolean {
  // 权限检查逻辑
  if (!userType) return false;
  
  // 示例：ADMIN拥有所有权限
  if (userType === 'ADMIN') return true;
  
  // 根据用户类型和所需权限进行具体判断
  // 这里可以扩展具体的权限逻辑
  switch (userType) {
    case 'STUDENT':
      // 学生权限逻辑
      return permission === 'student';
    case 'TEACHER':
      // 教师权限逻辑
      return permission === 'teacher' || permission === 'student';
    default:
      return false;
  }
}