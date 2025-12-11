<template>
  <div class="list-container">
    <el-form :inline="true">
      <el-form-item label="姓名：">
        <el-input v-model="queryForm.name" placeholder="请输入姓名：" />
      </el-form-item>

      <el-form-item label="电话：">
        <el-input v-model="queryForm.phone" placeholder="请输入电话：" />
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary" plain>查询</el-button>
        <el-button @click="add()" type="primary" plain>新增</el-button>
        <el-button @click="confirmDel()" type="danger" plain>批量删除</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>

    <el-divider border-style="dashed" />

    <el-table
      border
      :data="datalist"
      v-loading="listLoading"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa' }"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userName" label="用户" header-align="center" align="center" />
      <el-table-column prop="name" label="姓名" header-align="center" align="center" />
      <el-table-column prop="sex" label="性别" header-align="center" align="center" />
      <el-table-column prop="phone" label="电话" header-align="center" align="center" />
      <el-table-column prop="avatar" label="头像" header-align="center" align="center" />

      <el-table-column label="操作" width="160" header-align="center" align="center">
        <template #default="scope">
          <el-button @click="update(scope.row)" type="primary" size="small">编辑</el-button>
          <el-button @click="confirmDel(scope.row.id)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="handlePageChange"
      :page-size="queryForm.pageSize"
      :current-page="queryForm.pageNum"
      background
      layout="prev, pager, next"
      :total="total"
      style="float: right; margin: 10px 20px 20px 0px"
    />

    <add-or-update @refresh-list="getList" ref="operateRef"></add-or-update>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onMounted } from 'vue'
import { adminApi } from '@/api/admin-api'
import constants from '@/utils/constants'
import AddOrUpdate from '@/views/admin/AddOrUpdate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 管理员数据结构
type AdminRow = {
  id: number | string
  userName?: string
  name?: string
  sex?: string
  phone?: string
  avatar?: string
}

// 数据列表
const datalist = ref<AdminRow[]>([])
//列表加载状态
const listLoading = ref(false)
//数据总条数
const total = ref(0)
//表单初始值
const queryFormState = reactive({
  name: '',
  phone: '',
  pageNum: 1,
  pageSize: constants.PAGE_SIZE,
})
//表单查询参数
const queryForm = reactive({ ...queryFormState })
//定义操作组件引用--新增/编辑
const operateRef = ref()
//所有勾选的纪录
const multipeSelection = ref<AdminRow[]>([])

//获取列表数据
async function getList() {
  try {
    listLoading.value = true
    const response = await adminApi.list(queryForm, queryForm.pageNum, queryForm.pageSize)

    // response 是 AxiosResponse，response.data 是 API 返回的完整 body
    const resBody = response.data

    // 后端直接返回分页数据，没有 code 字段
    if (resBody?.records) {
      datalist.value = Array.isArray(resBody.records) ? resBody.records : []
      total.value = typeof resBody.total === 'number' ? resBody.total : 0
    } else {
      console.warn('返回格式异常:', resBody)
      datalist.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('网络请求失败或接口异常:', error)
    datalist.value = []
    total.value = 0
  } finally {
    listLoading.value = false
  }
}

// 初始化加载数据
onMounted(() => {
  getList()
})

//查询方法
function onSearch() {
  queryForm.pageNum = 1
  getList()
}

//分页查询
function handlePageChange(page: number) {
  queryForm.pageNum = page
  getList()
}

/**
 * 新增管理员
 */
function add() {
  operateRef.value.showModel()
}

/**
 * 编辑管理员
 */
function update(row: any) {
  operateRef.value.showModel(row)
}

/**
 * 删除管理员
 */
async function del(id: any) {
  try {
    listLoading.value = true
    const ids = id ? [id] : multipeSelection.value.map((item) => item.id)
    if (ids.length == 0) {
      ElMessage.warning('请选择要删除的数据')
      return
    }
    await adminApi.delete(ids)
    ElMessage.success('删除管理员成功')
    getList()
  } catch (e) {
    console.error('删除管理员失败:', e)
  } finally {
    listLoading.value = false
  }
}
function confirmDel(id?: any) {
  ElMessageBox.confirm('确定删除该管理员吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
    .then(() => {
      del(id)
    })
    .catch(() => {
      // 取消删除
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}
const handleSelectionChange = (val: AdminRow[]) => {
  multipeSelection.value = val
}
</script>
