<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import { noticeApi } from '@/api/notice'
import { departmentApi } from '@/api/department'
import type { NoticeCreateRequest, NoticeUpdateRequest, NoticeResponse } from '@/types'
import { USER_TYPE_ENUM, NOTICE_TYPE_ENUM, NOTICE_PRIORITY_ENUM, TARGET_SCOPE_ENUM } from '@/constants/enums'
import { useAuthStore } from '@/stores'
import FileUpload from '@/components/common/FileUpload.vue'
import FilePreview from '@/components/common/FilePreview.vue'
import { urls2FileList } from '@/utils/utils'

// 用户类型枚举
const UserType = USER_TYPE_ENUM

// Pinia store
const authStore = useAuthStore()

// 当前用户类型
const currentUserType = computed(() => authStore.userInfo?.userType)

const props = defineProps<{
  modelValue: boolean
  notice?: NoticeResponse | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单引用
const formRef = ref()
const fileUploadRef = ref()

// ✅ 获取文件列表用于传递给 FileUpload 组件（参考 BaseAddOrUpdate 实现）
const attachmentFileList = computed(() => {
  return urls2FileList(formData.attachmentUrl)
})

// 文件预览相关
const previewVisible = ref(false)
const previewFileInfo = ref<any>({})

// 表单数据（仅包含创建和更新共有的字段）
const formData = reactive<{
  title: string
  content: string
  type: number
  priority: number
  startTime: string | undefined
  endTime: string | undefined
  isSticky: number
  targetScope: number
  departmentId: string | undefined
  attachmentUrl: string
  publishNow: boolean // 仅用于创建模式
}>({
  title: '',
  content: '',
  type: NOTICE_TYPE_ENUM.SYSTEM_NOTICE,
  priority: NOTICE_PRIORITY_ENUM.MEDIUM,
  startTime: undefined,
  endTime: undefined,
  isSticky: 0,
  targetScope: TARGET_SCOPE_ENUM.ALL,
  departmentId: undefined,
  attachmentUrl: '',
  publishNow: false
})

// 表单规则
const formRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在 2-100 个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  startTime: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && formData.endTime && value > formData.endTime) {
          callback(new Error('开始时间不能晚于结束时间'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  endTime: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && formData.startTime && value < formData.startTime) {
          callback(new Error('结束时间不能早于开始时间'))
        } else if (value) {
          // 验证结束时间是否在未来
          const now = new Date()
          const endTime = new Date(value)
          if (endTime <= now) {
            callback(new Error('结束时间必须在未来'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 枚举选项
const noticeTypeOptions = [
  { label: '系统通知', value: NOTICE_TYPE_ENUM.SYSTEM_NOTICE },
  { label: '公告', value: NOTICE_TYPE_ENUM.ANNOUNCEMENT },
  { label: '提醒', value: NOTICE_TYPE_ENUM.REMINDER }
]

const noticePriorityOptions = [
  { label: '低', value: NOTICE_PRIORITY_ENUM.LOW },
  { label: '中', value: NOTICE_PRIORITY_ENUM.MEDIUM },
  { label: '高', value: NOTICE_PRIORITY_ENUM.HIGH }
]

// 目标范围选项（根据用户类型动态显示）
const targetScopeOptions = computed(() => {
  const options: Array<{ label: string; value: number }> = []
  
  // 系统管理员可以看到所有选项
  if (currentUserType.value === UserType.SYSTEM_ADMIN) {
    options.push(
      { label: '全体', value: TARGET_SCOPE_ENUM.ALL },
      { label: '院系管理员', value: TARGET_SCOPE_ENUM.DEPARTMENT_ADMIN },
      { label: '教师', value: TARGET_SCOPE_ENUM.TEACHER },
      { label: '学生', value: TARGET_SCOPE_ENUM.STUDENT }
    )
  } else if (currentUserType.value === UserType.DEPARTMENT_ADMIN) {
    // 院系管理员只能看到本院系相关的选项
    options.push(
      { label: '本院系全体', value: TARGET_SCOPE_ENUM.ALL },
      { label: '本院系教师', value: TARGET_SCOPE_ENUM.TEACHER },
      { label: '本院系学生', value: TARGET_SCOPE_ENUM.STUDENT }
    )
  }
  
  return options
})

// 是否显示部门选择字段（系统管理员且目标范围为院系管理员/教师/学生时显示）
const showDepartmentSelect = computed(() => {
  return currentUserType.value === UserType.SYSTEM_ADMIN && 
         formData.targetScope !== TARGET_SCOPE_ENUM.ALL
})

// 编辑模式判断
const isEditMode = computed(() => !!props.notice?.id)

// 部门列表
const departmentList = ref<any[]>([])

// 加载部门列表
const loadDepartmentList = async () => {
  try {
    const res = await departmentApi.getDepartmentTree()
    departmentList.value = res.data || []
  } catch (error: any) {
    console.error('加载部门列表失败:', error.message)
    departmentList.value = []
  }
}

// 监听对话框打开
watch(dialogVisible, (newVal) => {
  if (newVal) {
    // 先重置表单数据（不调用resetForm，避免nextTick中的resetFields覆盖后续填充的数据）
    formData.title = ''
    formData.content = ''
    formData.type = NOTICE_TYPE_ENUM.SYSTEM_NOTICE
    formData.priority = NOTICE_PRIORITY_ENUM.MEDIUM
    formData.startTime = undefined
    formData.endTime = undefined
    formData.isSticky = 0
    formData.targetScope = TARGET_SCOPE_ENUM.ALL
    formData.departmentId = undefined
    formData.attachmentUrl = ''
    formData.publishNow = false
    
    // 清除FileUpload组件内部状态
    fileUploadRef.value?.clear()
    
    // 加载部门列表
    loadDepartmentList()
    
    if (props.notice) {
      // 编辑模式 - 填充表单数据（只填充共有字段）
      formData.title = props.notice.title
      formData.content = props.notice.content
      formData.type = props.notice.type
      formData.priority = props.notice.priority
      // 时间字段：后端可能返回 null，需要转换为 undefined
      formData.startTime = props.notice.startTime || undefined
      formData.endTime = props.notice.endTime || undefined
      formData.isSticky = props.notice.isSticky
      formData.targetScope = props.notice.targetScope
      // departmentId：后端可能返回 null，需要转换为 undefined
      formData.departmentId = props.notice.departmentId || undefined
      // attachmentUrl：后端可能返回 null，需要转换为空字符串
      formData.attachmentUrl = props.notice.attachmentUrl || ''
      // 注意：编辑模式不设置 publishNow，保持默认值 false
    }
    // 新建模式已在上面重置中处理
    
    // 数据填充完成后，清除表单验证错误（使用nextTick确保DOM已更新）
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})

// 重置表单
const resetForm = () => {
  // 逐个字段重置，确保完全清空
  formData.title = ''
  formData.content = ''
  formData.type = NOTICE_TYPE_ENUM.SYSTEM_NOTICE
  formData.priority = NOTICE_PRIORITY_ENUM.MEDIUM
  formData.startTime = undefined
  formData.endTime = undefined
  formData.isSticky = 0
  formData.targetScope = TARGET_SCOPE_ENUM.ALL
  formData.departmentId = undefined
  formData.attachmentUrl = ''
  formData.publishNow = false
  
  // 清除FileUpload组件内部状态
  fileUploadRef.value?.clear()
  
  // 清除表单验证错误
  nextTick(() => {
    formRef.value?.clearValidate()
    formRef.value?.resetFields()
  })
}

// 关闭对话框并重置表单
const closeDialogAndReset = () => {
  dialogVisible.value = false
  // 等待对话框关闭动画完成后重置表单
  setTimeout(() => {
    resetForm()
  }, 200)
}

// 处理附件预览
const handleAttachmentPreview = () => {
  if (!formData.attachmentUrl) {
    ElMessage.warning('暂无附件可预览')
    return
  }
  
  // 从 attachmentFileList 中获取文件信息
  const fileList = attachmentFileList.value
  if (fileList && fileList.length > 0) {
    const file = fileList[0]!
    // 从 URL 中提取文件名
    const urlPath = file.url || file.name
    const fileName = urlPath.split('/').pop() || '附件'
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
    
    previewFileInfo.value = {
      filename: decodeURIComponent(fileName),
      fileExtension: fileExtension,
      url: file.url
    }
    previewVisible.value = true
  } else {
    ElMessage.warning('无法获取附件信息')
  }
}

// 提交表单 - 创建模式
const handleSubmitCreate = async (publishNow = false) => {
  try {
    await formRef.value.validate()
    
    // 创建模式
    const createData: NoticeCreateRequest = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      priority: formData.priority,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isSticky: formData.isSticky,
      targetScope: formData.targetScope,
      departmentId: formData.departmentId, // 添加部门 ID
      attachmentUrl: formData.attachmentUrl,
      publishNow: publishNow  // 根据参数决定是否立即发布
    }
    
    const res = await noticeApi.createNotice(createData)
    if (res.code === 200) {
      ElMessage.success(publishNow ? '创建成功' : '暂存成功')
      closeDialogAndReset()  // 关闭对话框并重置表单
      emit('success')
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('创建失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (isEditMode.value) {
    // 编辑模式
    try {
      await formRef.value.validate()
      
      const updateData: NoticeUpdateRequest = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isSticky: formData.isSticky,
        targetScope: formData.targetScope,
        departmentId: formData.departmentId, // 添加部门 ID
        attachmentUrl: formData.attachmentUrl
      }
      
      const res = await noticeApi.updateNotice(props.notice!.id, updateData)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        closeDialogAndReset()  // 关闭对话框并重置表单
        emit('success')
      }
    } catch (error: any) {
      console.error('提交失败:', error)
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('更新失败')
      }
    }
  } else {
    // 新增模式：根据 publishNow 开关决定调用哪个方法
    handleSubmitCreate(formData.publishNow)
  }
}

// 关闭对话框
const handleClose = () => {
  closeDialogAndReset()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑通知' : '新建通知'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="unified-form"
    >
      <el-form-item label="通知标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入通知标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="通知类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择通知类型" style="width: 100%">
          <el-option
            v-for="option in noticeTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
          <el-option
            v-for="option in noticePriorityOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="目标范围" prop="targetScope">
        <el-select v-model="formData.targetScope" placeholder="请选择目标范围" style="width: 100%">
          <el-option
            v-for="option in targetScopeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item v-if="showDepartmentSelect" label="发布院系" prop="departmentId">
        <el-select v-model="formData.departmentId" placeholder="请选择发布院系" style="width: 100%" clearable>
          <el-option
            v-for="dept in departmentList"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="生效时间">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          placeholder="请选择开始时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 45%"
        />
        <span class="mx-2">至</span>
        <el-date-picker
          v-model="formData.endTime"
          type="datetime"
          placeholder="请选择结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 45%"
        />
      </el-form-item>
      
      <el-form-item label="是否置顶">
        <el-switch
          v-model="formData.isSticky"
          :active-value="1"
          :inactive-value="0"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      
      <el-form-item v-if="!isEditMode" label="发布设置">
        <el-radio-group v-model="formData.publishNow" style="width: 100%">
          <el-radio :label="true">立即发布</el-radio>
          <el-radio :label="false">暂存为草稿</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="附件链接">
        <div class="attachment-upload-container">
          <FileUpload
            ref="fileUploadRef"
            v-model:value="formData.attachmentUrl"
            :default-file-list="attachmentFileList"
            button-text="点击上传附件"
            :show-upload-btn="true"
            :auto-upload="true"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
            list-type="text"
            :max-size="50"
            :max-upload-size="1"
            category="notice"
          />
          <!-- 单个预览按钮 -->
          <el-button 
            v-if="formData.attachmentUrl" 
            type="primary" 
            link 
            @click="handleAttachmentPreview"
            class="preview-single-btn"
          >
            <el-icon><View /></el-icon>
            预览附件
          </el-button>
        </div>
      </el-form-item>
      
      <el-form-item label="通知内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="6"
          placeholder="请输入通知内容"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialogAndReset">取消</el-button>
        <el-button v-if="!isEditMode && !formData.publishNow" type="primary" @click="handleSubmit">
          确认
        </el-button>
        <el-button v-if="!isEditMode && formData.publishNow" type="primary" @click="handleSubmit">
          立即发布
        </el-button>
        <el-button v-if="isEditMode" type="primary" @click="handleSubmit">
          更新
        </el-button>
      </span>
    </template>
  </el-dialog>
  
  <!-- 文件预览对话框 -->
  <FilePreview
    v-model="previewVisible"
    :file-info="previewFileInfo"
  />
</template>

<style scoped>
.mx-2 {
  margin: 0 0.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 统一表单样式 */
.unified-form :deep(.el-input),
.unified-form :deep(.el-select),
.unified-form :deep(.el-textarea) {
  width: 100%;
}

.unified-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 附件上传容器样式 */
.attachment-upload-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.attachment-upload-container :deep(.el-upload-list) {
  flex: 1;
}

/* 隐藏 FileUpload 组件内部的预览按钮，使用外层单个预览按钮 */
.attachment-upload-container :deep(.upload-file-item .preview-btn) {
  display: none;
}

.attachment-upload-container :deep(.upload-file-item) {
  padding-right: 12px;
}

.preview-single-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>