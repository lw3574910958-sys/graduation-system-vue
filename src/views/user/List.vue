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
        <el-button @click="update(scope.row)" type="primary" size="small">编辑</el-button>
        <el-button @click="resetPassword(scope.row.id)" type="warning" size="small"
          >重置密码</el-button
        >
        <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
      </template>
      <template #dialogs>
        <add-or-update @refresh-list="getList" ref="operateRef" />
      </template>
    </base-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { userApi } from '@/api/user'
import AddOrUpdate from '@/views/user/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import Avatar from '@/components/common/Avatar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
// 导入用户类型常量和消息常量
import { USER_TYPE_LABELS, MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 用户数据结构
type UserRow = {
  id: number | string
  username: string
  realName: string
  userType: string
  status: number
  lastLoginAt?: string
  createdAt: string
  avatar?: string
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

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
    props: { placeholder: '请选择用户类型' },
    options: [
      { label: '学生', value: 'student' },
      { label: '教师', value: 'teacher' },
      { label: '管理员', value: 'admin' },
    ],
  },
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
    component: StatusTag,
    props: { status: (row: UserRow) => row.status }
  },
  { prop: 'lastLoginAt', label: '最后登录时间', headerAlign: 'center', align: 'center' },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center' },
]

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
  operateRef.value.showModel(row)
}

/**
 * 删除确认
 */
function confirmDel(id?: any) {
  // 由于使用BaseList，删除逻辑已在BaseList中处理
  // 这里仅保留重置密码功能
}

/**
 * 重置用户密码
 */
async function resetPassword(id: number | string) {
  try {
    await userApi.resetPassword(Number(id))
    ElMessage.success(MESSAGE.RESET_PASSWORD_SUCCESS)
  } catch (error) {
    console.error(MESSAGE.OPERATION_FAILED, error)
    ElMessage.error(MESSAGE.OPERATION_FAILED)
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
