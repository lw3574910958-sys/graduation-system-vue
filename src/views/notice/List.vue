<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'
import { noticeApi } from '@/api/notice'
import type { NoticeResponse, NoticeQueryParams } from '@/types'
import NoticeForm from './NoticeForm.vue'

const authStore = useAuthStore()

// 表格数据
const tableData = ref<NoticeResponse[]>([])
const loading = ref(false)
const total = ref(0)

// 表单相关
const dialogVisible = ref(false)
const currentNotice = ref<NoticeResponse | null>(null)

// 查询参数
const queryParams = reactive<NoticeQueryParams>({
  current: 1,
  size: 10,
  title: '',
  type: undefined,
  priority: undefined,
  status: undefined,
  targetScope: undefined
})

// 枚举映射
const noticeTypeMap = {
  1: '系统通知',
  2: '公告',
  3: '提醒'
}

const noticePriorityMap = {
  1: '低',
  2: '中',
  3: '高'
}

const noticeStatusMap = {
  0: '草稿',
  1: '已发布',
  2: '已撤回'
}

const targetScopeMap = {
  0: '全体',
  1: '学生',
  2: '教师',
  3: '管理员'
}

// 获取表格数据
const getList = async () => {
  loading.value = true
  try {
    const res = await noticeApi.getNoticePage(queryParams)
    if (res.code === 200) {
      tableData.value = res.data?.records || []
      total.value = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// 重置
const handleReset = () => {
  queryParams.title = ''
  queryParams.type = undefined
  queryParams.priority = undefined
  queryParams.status = undefined
  queryParams.targetScope = undefined
  queryParams.current = 1
  getList()
}

// 分页变化
const handleSizeChange = (val: number) => {
  queryParams.size = val
  queryParams.current = 1
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.current = val
  getList()
}

// 查看详情
const handleView = (row: NoticeResponse) => {
  ElMessageBox.alert(
    `
    <div>
      <p><strong>标题：</strong>${row.title}</p>
      <p><strong>类型：</strong>${row.typeDesc}</p>
      <p><strong>优先级：</strong>${row.priorityDesc}</p>
      <p><strong>发布时间：</strong>${row.publishedAt || '未发布'}</p>
      <p><strong>状态：</strong>${row.statusDesc}</p>
      <p><strong>目标范围：</strong>${row.targetScopeDesc}</p>
      <p><strong>阅读次数：</strong>${row.readCount}</p>
      ${row.attachmentUrl ? `<p><strong>附件：</strong><a href="${row.attachmentUrl}" target="_blank">点击查看</a></p>` : ''}
      <hr>
      <div><strong>内容：</strong><br/>${row.content}</div>
    </div>
    `,
    '通知详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
  
  // 增加阅读次数
  noticeApi.increaseReadCount(row.id).catch(() => {
    // 忽略阅读计数增加的错误
  })
}

// 发布通知
const handlePublish = async (row: NoticeResponse) => {
  try {
    await ElMessageBox.confirm(`确定要发布通知"${row.title}"吗？`, '提示', {
      type: 'warning'
    })
    
    const res = await noticeApi.publishNotice(row.id)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      getList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('发布通知失败:', error)
      ElMessage.error(error.message || '发布通知失败')
    }
  }
}

// 撤回通知
const handleWithdraw = async (row: NoticeResponse) => {
  try {
    await ElMessageBox.confirm(`确定要撤回通知"${row.title}"吗？`, '提示', {
      type: 'warning'
    })
    
    const res = await noticeApi.withdrawNotice(row.id)
    if (res.code === 200) {
      ElMessage.success('撤回成功')
      getList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('撤回通知失败:', error)
      ElMessage.error(error.message || '撤回通知失败')
    }
  }
}

// 删除通知
const handleDelete = async (row: NoticeResponse) => {
  try {
    await ElMessageBox.confirm(`确定要删除通知"${row.title}"吗？此操作不可恢复！`, '提示', {
      type: 'error'
    })
    
    const res = await noticeApi.deleteNotice(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error(error.message || '删除通知失败')
    }
  }
}

// 创建通知
const handleCreate = () => {
  currentNotice.value = null
  dialogVisible.value = true
}

// 编辑通知
const handleEdit = (row: NoticeResponse) => {
  currentNotice.value = row
  dialogVisible.value = true
}

// 表单操作成功回调
const handleSuccess = () => {
  dialogVisible.value = false
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="notice-list">
    <!-- 搜索区域 -->
    <el-card class="mb-4">
      <el-form :model="queryParams" label-width="80px" inline>
        <el-form-item label="通知标题">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入通知标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择通知类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in noticeTypeMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="queryParams.priority"
            placeholder="请选择优先级"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="(label, value) in noticePriorityMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="(label, value) in noticeStatusMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标范围">
          <el-select
            v-model="queryParams.targetScope"
            placeholder="请选择目标范围"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="(label, value) in targetScopeMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>通知列表</span>
          <template v-if="authStore.userInfo?.userType === 'admin'">
            <el-button type="primary" @click="handleCreate">新建通知</el-button>
          </template>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="typeDesc" label="类型" width="100" />
        <el-table-column prop="priorityDesc" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag 
              :type="row.priority === 3 ? 'danger' : row.priority === 2 ? 'warning' : 'info'"
              effect="dark"
            >
              {{ row.priorityDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusDesc" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === 1 ? 'success' : row.status === 2 ? 'info' : 'warning'"
            >
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetScopeDesc" label="目标范围" width="100" />
        <el-table-column prop="publisherName" label="发布者" width="120" />
        <el-table-column prop="publishedAt" label="发布时间" width="180" />
        <el-table-column prop="readCount" label="阅读次数" width="100" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <template v-if="authStore.userInfo?.userType === 'admin'">
              <el-button 
                v-if="row.status === 0" 
                size="small" 
                type="primary" 
                @click="handlePublish(row)"
              >
                发布
              </el-button>
              <el-button 
                v-if="row.status === 1" 
                size="small" 
                type="warning" 
                @click="handleWithdraw(row)"
              >
                撤回
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 通知表单对话框 -->
    <NoticeForm
      v-model="dialogVisible"
      :notice="currentNotice"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.notice-list {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.items-center {
  align-items: center;
}

.mt-4 {
  margin-top: 1rem;
}
</style>