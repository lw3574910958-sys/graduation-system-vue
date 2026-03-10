<template>
  <div class="list-container">
    <base-list
      :get-list-api="userApi.getUserPage"
      :delete-api="userApi.deleteUser"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      @add="add"
      @edit="update"
      @refresh="getList"
      ref="listRef"
    >
      <template #operations="{ scope }">
        <el-button @click="viewDetail(scope.row)" type="info" size="small">详情</el-button>
        <el-button @click="update(scope.row)" type="primary" size="small">编辑</el-button>
        <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
      </template>
      <template #dialogs>
        <add-or-update @refresh-list="getList" ref="operateRef" />
        <user-detail-dialog v-model="detailDialogVisible" ref="detailDialogRef" />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { userApi } from '@/api/user'
import AddOrUpdate from '@/views/user/AddOrUpdate.vue'
import UserDetailDialog from '@/components/user/UserDetailDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import Avatar from '@/components/common/Avatar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import StatusSwitch from '@/components/common/StatusSwitch.vue'
// 导入用户类型常量和消息常量
import { USER_TYPE_LABELS, MESSAGE } from '@/constants/user'
import type { UserResponse } from '@/types/api/user'
import BaseList from '@/components/common/BaseList.vue'

// 使用统一的类型定义
type UserRow = UserResponse

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 详情对话框相关
const detailDialogVisible = ref(false)
const detailDialogRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'username',
    label: '用户名：',
    component: 'el-input',
    props: { placeholder: '请输入用户名' },
  },
  {
    prop: 'realName',
    label: '真实姓名：',
    component: 'el-input',
    props: { placeholder: '请输入真实姓名' },
  },
  {
    prop: 'userType',
    label: '用户类型：',
    component: 'el-select',
    props: { 
      placeholder: '请选择用户类型',
      options: [
        { label: '学生', value: 'student' },
        { label: '教师', value: 'teacher' },
        { label: '管理员', value: 'admin' },
      ]
    },
  },
  {
    prop: 'status',
    label: '状态：',
    component: 'el-select',
    props: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'username', label: '用户名', headerAlign: 'center', align: 'center' },
  { prop: 'realName', label: '真实姓名', headerAlign: 'center', align: 'center' },
  {
    prop: 'userType',
    label: '用户类型',
    headerAlign: 'center',
    align: 'center',
    render: (row: UserRow) => getUserTypeLabel(row.userType),
  },
  {
    prop: 'avatar',
    label: '头像',
    headerAlign: 'center',
    align: 'center',
    width: 100,
    component: Avatar,
    props: { size: 40 },
  },
  {
    prop: 'status',
    label: '状态',
    headerAlign: 'center',
    align: 'center',
    width: 120,
    component: StatusSwitch,
    props: {
      row: (row: UserRow) => row,
      onToggle: (row: UserRow) => () => toggleStatus(row),
    },
  },
  { prop: 'lastLoginAt', label: '最后登录时间', headerAlign: 'center', align: 'center' },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center' },
]

/**
 * 查看用户详情
 */
function viewDetail(row: UserRow) {
  detailDialogRef.value?.loadUserDetail(row.id)
  detailDialogVisible.value = true
}

/**
 * 新增用户
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑用户
 */
function update(row: UserRow) {
  console.log('🔍 List.vue update 方法接收到的 row:', row)
  console.log('🔍 row.id:', row.id)
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: any) {
  console.log('🔍 List.vue confirmDel 方法接收到的 id:', id)
  // 由于使用 BaseList，删除逻辑已在 BaseList 中处理
  // 这里需要手动触发 BaseList 的 confirmDel 方法
  listRef.value?.confirmDel && listRef.value.confirmDel(id)
}

/**
 * 切换用户状态
 * @param row 用户行数据
 * @returns Promise<void>
 */
async function toggleStatus(row: UserRow): Promise<void> {
  const isEnabled = row.status === 1
  const action = isEnabled ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: isEnabled ? 'warning' : 'success',
      }
    )
    
    // 调用 API
    if (isEnabled) {
      await userApi.disableUser(String(row.id))
    } else {
      await userApi.enableUser(String(row.id))
    }
    
    ElMessage.success(`${action}成功`)
    
    // 刷新列表
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error)
      ElMessage.error(error?.message || `${action}失败`)
      throw error // 抛出错误，让组件知道操作失败
    }
    throw error // 用户取消时也抛出错误
  }
}

/**
 * 获取用户类型标签
 * 使用常量映射，便于维护和国际化
 */
function getUserTypeLabel(userType: string) {
  // 使用常量映射返回对应标签，如果找不到则返回原值
  return USER_TYPE_LABELS[userType as keyof typeof USER_TYPE_LABELS] || userType
}

// 用于刷新列表的方法
function getList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>
