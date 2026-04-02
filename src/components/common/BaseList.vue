<template>
  <div class="base-list-container">
    <el-form :inline="true" v-if="showSearchForm" class="search-form">
      <el-form-item
        v-for="searchField in searchFields"
        :key="searchField.prop"
        :label="searchField.label"
      >
        <!-- 特殊处理 el-select 组件 -->
        <template v-if="searchField.component === 'el-select'">
          <el-select
            v-model="queryForm[searchField.prop]"
            v-bind="searchField.props || {}"
            :placeholder="searchField.placeholder || `请输入${searchField.label}`"
          >
            <el-option
              v-for="option in (typeof searchField.props?.options === 'function' ? searchField.props.options() : searchField.props?.options)"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </template>
        <!-- 其他组件 -->
        <template v-else>
          <component
            :is="searchField.component || 'el-input'"
            v-model="queryForm[searchField.prop]"
            v-bind="searchField.props || {}"
            :placeholder="searchField.placeholder || `请输入${searchField.label}`"
          />
        </template>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary" plain>查询</el-button>
        <el-button @click="add()" type="primary" plain v-if="showAddButton">{{ addButtonText }}</el-button>
        <el-button @click="confirmDel()" type="danger" plain v-if="showDeleteButton">{{ deleteButtonText }}</el-button>
        <el-button @click="resetQuery()">重置</el-button>
      </el-form-item>
    </el-form>

    <el-divider border-style="dashed" v-if="showSearchForm" />

    <div class="table-container">
      <div class="table-wrapper">
        <el-table
          border
          :data="datalist"
          v-loading="listLoading"
          @selection-change="handleSelectionChange"
          class="responsive-table"
          :header-cell-style="{ background: '#f5f7fa' }"
          :max-height="tableMaxHeight"
          :fit="true"
          :show-overflow-tooltip="false"
        >
          <el-table-column type="selection" width="55" v-if="showSelection" fixed="left" />
          
          <el-table-column
            v-for="(column, index) in filteredColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :header-align="column.headerAlign || 'center'"
            :align="column.align || 'center'"
            :min-width="column.width || getDefaultMinWidth(column)"
            :fixed="getColumnFixedStatus(index)"
          >
            <template #default="scope">
              <!-- 如果有 render 函数且没有 component -->
              <template v-if="column.render && !column.component">
                <span v-html="column.render(scope.row, scope.$index, scope.column)"></span>
              </template>
              <!-- 如果有 component 组件 -->
              <template v-else-if="column.component">
                <component
                  v-if="shouldRenderComponent(column, scope.row)"
                  :is="column.component"
                  :key="`${scope.row.id}-${column.prop}`"
                  v-bind="getComponentProps(column.props, scope.row)"
                  :avatar="scope.row[column.prop]"
                />
                <span v-else v-html="column.render ? column.render(scope.row, scope.$index, scope.column) : ''"></span>
              </template>
              <!-- 如果没有明确禁用省略号且不是特殊字段 -->
              <template v-else-if="shouldUseEllipsis(column, scope.row)">
                <EllipsisText
                  :content="getColumnValue(scope.row, column.prop)"
                  :title="column.label"
                  :maxLength="column.ellipsisMaxLength || defaultEllipsisMaxLength"
                  :dblclickable="column.ellipsisDblclickable !== false"
                />
              </template>
              <!-- 默认显示 -->
              <template v-else>
                {{ scope.row[column.prop] }}
              </template>
            </template>
          </el-table-column>

          <el-table-column
            v-if="showOperations"
            :label="operationColumnLabel"
            :min-width="operationColumnWidth"
            header-align="center"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <slot name="operations" :scope="scope">
                <el-button @click="update(scope.row)" type="primary" size="small" v-if="showEditButton">编辑</el-button>
                <el-button @click="confirmDel(scope.row?.id)" type="danger" size="small" v-if="showDeleteButtonInRow">删除</el-button>
              </slot>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <div class="pagination-left">
          <el-select 
            v-model="queryForm.size" 
            @change="handlePageSizeChange"
            size="default"
            style="width: 100px"
          >
            <el-option label="10 条/页" :value="10" />
            <el-option label="50 条/页" :value="50" />
            <el-option label="100 条/页" :value="100" />
            <el-option label="500 条/页" :value="500" />
          </el-select>
        </div>
        
        <el-pagination
          @current-change="handlePageChange"
          :page-size="queryForm.size"
          :current-page="queryForm.current"
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :pager-count="5"
          class="pagination"
          v-if="showPagination"
        />
      </div>
    </div>

    <!-- 默认插槽用于放置操作组件 -->
    <slot name="dialogs"></slot>
  </div>
</template>

<script setup lang="ts" generic="T = any" name="BaseList">
import { ref, reactive, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import constants from '@/utils/constants'
import { MESSAGE } from '@/constants/user'
import SafeText from '@/components/common/SafeText.vue'
import EllipsisText from '@/components/common/EllipsisText.vue'

// 定义搜索字段类型
interface SearchField {
  prop: string
  label: string
  component?: string
  props?: Record<string, any>
  placeholder?: string
}

// 定义表格列类型
interface TableColumn {
  prop: string
  label: string
  headerAlign?: string
  align?: string
  width?: string | number
  render?: (row: T, index: number, column: any) => string
  component?: any
  props?: Record<string, any> | ((row: T) => Record<string, any> | null) // 组件属性，支持函数
  ellipsis?: boolean // 是否启用省略号 + 双击查看（已废弃，现在默认启用）
  ellipsisMaxLength?: number // 省略号显示的最大长度
  ellipsisDblclickable?: boolean // 是否允许双击查看，默认 true
  disableEllipsis?: boolean // 是否禁用省略号（用于不需要截断的字段）
  vIf?: boolean // 条件显示列
}

// 定义组件属性
interface Props {
  // API 相关
  getListApi: (params: any) => Promise<any>
  deleteApi?: (id: string) => Promise<any>
  
  // 搜索表单配置
  showSearchForm?: boolean
  searchFields?: SearchField[]
  
  // 表格配置
  tableColumns: TableColumn[]
  showSelection?: boolean
  
  // 操作按钮配置
  showAddButton?: boolean
  showDeleteButton?: boolean
  showEditButton?: boolean
  showDeleteButtonInRow?: boolean
  showOperations?: boolean
  operationColumnLabel?: string
  operationColumnWidth?: string | number
  addButtonText?: string // 自定义新增按钮文字
  deleteButtonText?: string // 自定义批量删除按钮文字
  
  // 分页配置
  showPagination?: boolean
  
  // 初始查询参数
  initialQueryParams?: Record<string, any>
  
  // 省略号配置
  defaultEllipsisMaxLength?: number // 默认省略号最大长度，默认 50
  disableGlobalEllipsis?: boolean // 是否禁用全局省略号，默认 false
}

const props = withDefaults(defineProps<Props>(), {
  showSearchForm: true,
  searchFields: () => [],
  showSelection: true,
  showAddButton: true,
  showDeleteButton: true,
  showEditButton: true,
  showDeleteButtonInRow: true,
  showOperations: true,
  operationColumnLabel: '操作',
  operationColumnWidth: 200,
  addButtonText: '新增', // 默认显示"新增"
  deleteButtonText: '批量删除', // 默认显示"批量删除"
  showPagination: true,
  initialQueryParams: () => ({
    current: 1,
    size: constants.PAGE_SIZE
  }),
  defaultEllipsisMaxLength: 50,
  disableGlobalEllipsis: false
})

// 定义事件
const emit = defineEmits<{
  add: []
  edit: [row: T]
  delete: [id: number | string]
  refresh: []
}>()

// 响应式数据
const datalist = ref<T[]>([])
const listLoading = ref(false)
const total = ref(0)
// 根据布局尺寸计算表格最大高度：
// 100vh - header高度(90px) - search表单高度(约120px) - pagination高度(约50px) - 其他间距(约60px)
const tableMaxHeight = ref('calc(100vh - 320px)')

// 表单初始值
const queryFormState = reactive({
  ...props.initialQueryParams
})

// 表单查询参数
const queryForm = reactive({ ...queryFormState })

// 所有勾选的记录
const multipeSelection = ref<T[]>([])


// 获取路由参数（用于监听路由变化自动刷新列表）
const route = useRoute()

// 监听路由参数变化，当路由参数改变时重新加载列表
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // 只有当 query 参数真正发生变化时才刷新（排除初始化）
    if (oldQuery && JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      // 重置查询表单到第一页
      queryForm.current = 1
      // 重新加载列表
      getList()
    }
  },
  { deep: true } // 深度监听 query 对象
)

// 获取默认最小宽度
const getDefaultMinWidth = (column: TableColumn): number => {
  // 如果列已经指定了宽度，则使用该宽度；否则使用默认值
  if (column.width) {
    return typeof column.width === 'number' ? column.width : parseInt(column.width) || 120
  }
  // 根据列的内容类型设置默认最小宽度
  switch(column.prop) {
    case 'id':
      return 80
    case 'createdAt':
    case 'updatedAt':
    case 'uploadedAt':
    case 'lastLoginAt':
      return 160
    case 'description':
    case 'feedback':
    case 'originalFilename':
      return 200
    default:
      return 120
  }
}

// 过滤表格列（支持 vIf 条件）
const filteredColumns = computed(() => {
  return props.tableColumns.filter(column => {
    // 如果列有 vIf 属性，检查条件是否满足
    if ('vIf' in column && typeof column.vIf === 'boolean') {
      return column.vIf
    }
    // 没有 vIf 或 vIf 为 true 的列都显示
    return true
  })
})

// 判断是否应该使用 EllipsisText 组件
const shouldUseEllipsis = (column: TableColumn, row: T): boolean => {
  // 如果全局禁用了省略号，则不使用
  if (props.disableGlobalEllipsis) {
    return false
  }
  
  // 如果列明确禁用了省略号，则不使用
  if (column.disableEllipsis === true) {
    return false
  }
  
  // 如果有 render 函数或 component，不使用（由它们自己处理）
  if (column.render || column.component) {
    return false
  }
  
  // 检查字段值是否为字符串或数字
  const value = getColumnValue(row, column.prop)
  const isTextValue = typeof value === 'string' || typeof value === 'number'
  
  // 排除不需要省略号的字段类型
  const excludedProps = [
    'status',      // 状态
    'type',        // 类型（通常用标签显示）
    'role',        // 角色
    'priority',    // 优先级
  ]
  
  if (excludedProps.includes(column.prop)) {
    return false
  }
  
  return isTextValue
}

// 获取列的值
const getColumnValue = (row: T, prop: string): any => {
  return (row as any)[prop]
}

// 处理组件 props，如果 prop 是函数则调用它
const getComponentProps = (props: Record<string, any> | undefined | ((row: any) => Record<string, any> | null), row: T): Record<string, any> => {
  // 如果 props 是函数，调用它
  if (typeof props === 'function') {
    const result = props(row)
    if (!result) return {}
    return result
  }
  
  if (!props) return {}
  
  const result: Record<string, any> = {}
  for (const key in props) {
    const value = props[key]
    // 如果值是函数，调用它并传入 row
    if (typeof value === 'function') {
      result[key] = value(row)
    } else {
      result[key] = value
    }
  }
  return result
}

// 判断是否应该渲染组件（支持 props 为函数时返回 null 来控制是否渲染）
const shouldRenderComponent = (column: TableColumn, row: T): boolean => {
  if (!column.props) return true
  
  // 如果 props 是函数，调用它并判断返回值
  if (typeof column.props === 'function') {
    const propsResult = column.props(row)
    // 如果返回 null 或 undefined，则不渲染组件
    return propsResult !== null && propsResult !== undefined
  }
  
  return true
}

// 获取列的固定状态：第一列固定，其他不固定
const getColumnFixedStatus = (index: number): string | boolean => {
  // 第一列固定到左侧
  if (index === 0) {
    return 'left'
  }
  return false
}

// 获取列表数据
async function getList() {
  try {
    listLoading.value = true
    const response = await props.getListApi(queryForm)

    if (response?.code === 200 && response?.data) {
      const pageData = response.data
      datalist.value = Array.isArray(pageData.records) ? pageData.records : []
      total.value = typeof pageData.total === 'number' ? pageData.total : 0
    } else {
      ElMessage.error(response?.message || MESSAGE.FORMAT_ERROR)
      datalist.value = []
      total.value = 0
    }
  } catch (error) {
    console.error(MESSAGE.NETWORK_ERROR, error)
    datalist.value = []
    total.value = 0
  } finally {
    listLoading.value = false
  }
}

// 查询方法
function onSearch() {
  queryForm.current = 1
  getList()
}

// 分页查询
function handlePageChange(page: number) {
  queryForm.current = page
  getList()
}

// 处理每页显示条数变化
function handlePageSizeChange(size: number) {
  queryForm.current = 1 // 重置到第一页
  queryForm.size = size
  getList()
}

// 重置查询条件
function resetQuery() {
  // 重置所有搜索字段为 undefined，让后端使用默认值
  props.searchFields.forEach(field => {
    (queryForm as any)[field.prop] = undefined
  })
  
  // 重置分页
  queryForm.current = 1
  
  getList()
}

// 存储勾选id
const handleSelectionChange = (val: T[]) => {
  multipeSelection.value = val
}

// 新增操作
function add() {
  emit('add')
}

// 编辑操作
function update(row: T) {
  emit('edit', row)
}

// 删除操作
async function del(id?: number | string) {
  if (!props.deleteApi) {
    ElMessage.warning('未提供删除 API')
    return
  }

  try {
    listLoading.value = true
    
    let ids: string[] = []
    if (id !== undefined) {
      // 单个删除：保持字符串格式，避免精度丢失
      console.log('🔍 BaseList del method - single delete id:', id, 'type:', typeof id)
      ids = [String(id)]
    } else {
      // 批量删除：从选中记录中提取 ID，保持字符串格式
      console.log('🔍 BaseList del method - batch delete from selections:', multipeSelection.value)
      ids = multipeSelection.value.map((item: any) => {
        const itemId = item.id
        console.log('  📝 Selection item id:', itemId, 'type:', typeof itemId)
        return String(itemId)
      })
    }
    
    console.log('🔍 BaseList del method - IDs to delete:', ids)
    
    if (ids.length === 0) {
      ElMessage.warning(MESSAGE.SELECT_DATA)
      return
    }
    
    // 批量删除需要逐个调用删除接口
    const promises = ids.map(id => props.deleteApi!(id))
    console.log('🔍 Calling delete APIs:', promises.length, 'requests')
    await Promise.allSettled(promises)
    
    ElMessage.success(MESSAGE.DELETE_SUCCESS)
    getList()
    emit('refresh')
  } catch (e: any) {
    console.error(MESSAGE.OPERATION_FAILED, e)
    ElMessage.error(e.message || MESSAGE.OPERATION_FAILED)
  } finally {
    listLoading.value = false
  }
}

// 删除确认
function confirmDel(id?: number | string) {
  if (!props.deleteApi) {
    ElMessage.warning('未提供删除 API')
    return
  }

  ElMessageBox.confirm(MESSAGE.CONFIRM_DELETE, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
    .then(() => {
      if (id !== undefined) {
        del(id)
      } else if (multipeSelection.value.length > 0) {
        del()
      } else {
        ElMessage.warning(MESSAGE.SELECT_DATA)
      }
    })
    .catch(() => {
      // 取消删除
      ElMessage({
        type: 'info',
        message: MESSAGE.CANCEL_DELETE,
      })
    })
}

// 暴露方法给父组件
defineExpose({
  getList,
  resetQuery,
  onSearch,
  confirmDel  // 暴露删除确认方法
})
</script>

<style scoped>
.base-list-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px - 60px); /* 100vh - header 高度 - 底部版权栏高度 */
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* ✅ 防止容器本身滚动 */
}

.search-form {
  flex-wrap: wrap;
}

.search-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 10px;
  min-width: 220px;
}

@media (max-width: 768px) {
  .search-form .el-form-item {
    min-width: 100%;
    margin-right: 0;
  }
  
  .search-form .el-form-item:nth-child(odd) {
    margin-right: 0;
  }
}

.table-container {
  flex: 1;
  overflow: hidden;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 表格包装器 - 用于处理滚动 */
.table-wrapper {
  flex: 1;
  overflow: hidden; /* ✅ 改为 hidden，让外层容器处理滚动 */
  min-height: 0;
  position: relative;
  width: 100%;
}

/* 表格容器 - 处理固定列和滚动 */
.responsive-table {
  width: 100%;
}

/* ✅ 修复固定列的阴影效果 - 使用 !important 提高优先级 */
.responsive-table .el-table__fixed {
  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.1) !important;
}

.responsive-table .el-table__fixed-right {
  box-shadow: -3px 0 6px rgba(0, 0, 0, 0.1) !important;
}

/* ✅ 修复固定列边缘的圆角和边框 */
.responsive-table .el-table__fixed::before,
.responsive-table .el-table__fixed-right::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(0, 0, 0, 0.06);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: visible; /* ✅ 改为 visible，让分页完全显示 */
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 0; /* ✅ 紧贴左边界 */
  flex-shrink: 0; /* ✅ 防止被压缩 */
}

.pagination {
  white-space: nowrap;
  flex-shrink: 0; /* ✅ 防止被压缩 */
}
</style>

