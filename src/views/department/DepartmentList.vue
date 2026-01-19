<template>
  <div class="department-list">
    <el-card>
      <base-list
        :get-list-api="departmentApi.getList"
        :delete-api="departmentApi.delete"
        :search-fields="searchFields"
        :table-columns="tableColumns"
        @add="handleAdd"
        @edit="handleEdit"
        @refresh="onRefreshList"
        ref="listRef"
      >
        <template #operations="{ scope }">
          <el-button @click="handleEdit(scope.row)" type="primary" size="small">编辑</el-button>
          <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
        </template>
        <template #dialogs>
          <add-or-update @refresh-list="onRefreshList" ref="operateRef" />
        </template>
      </base-list>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { departmentApi } from '@/api/department'
import AddOrUpdate from '@/views/department/DepartmentForm.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import BaseList from '@/components/common/BaseList.vue'

// 院系数据结构
type DepartmentRow = {
  id: number | string
  name: string
  code: string
  description: string
  createdAt?: string | Date
}

// 定义操作组件引用--新增/编辑
const operateRef = ref()
const listRef = ref()

// 搜索字段配置
const searchFields = [
  {
    prop: 'name',
    label: '院系名称：',
    component: 'el-input',
    props: { placeholder: '请输入院系名称' }
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 100, headerAlign: 'center', align: 'center' },
  { prop: 'name', label: '院系名称', headerAlign: 'center', align: 'center' },
  { prop: 'code', label: '院系代码', headerAlign: 'center', align: 'center' },
  { prop: 'description', label: '描述', headerAlign: 'center', align: 'center' },
  { prop: 'createdAt', label: '创建时间', headerAlign: 'center', align: 'center' },
]

// 处理新增
function handleAdd() {
  operateRef.value.showModel()
}

// 处理编辑
function handleEdit(row: DepartmentRow) {
  operateRef.value.showModel(row)
}

// 确认删除
async function confirmDel(id: number | string) {
  try {
    await ElMessageBox.confirm('确定要删除吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const response = await departmentApi.delete(Number(id))
    if (response?.code === 200) {
      ElMessage.success(MESSAGE.DELETE_SUCCESS)
      // 重新获取列表
      listRef.value?.getList && listRef.value.getList()
    } else {
      ElMessage.error(response?.message || MESSAGE.OPERATION_FAILED)
    }
  } catch (error) {
    console.error('删除院系失败:', error)
    // 用户取消删除不会抛出错误，只有实际错误才会
    if (error !== 'cancel') {
      ElMessage.error(MESSAGE.OPERATION_FAILED)
    }
  }
}

// 刷新列表（子组件会调用）
function onRefreshList() {
  listRef.value?.getList && listRef.value.getList()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 100%;
}
</style>