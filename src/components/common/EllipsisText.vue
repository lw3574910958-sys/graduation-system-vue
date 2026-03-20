<template>
  <div class="ellipsis-text-container">
    <!-- 显示文本 -->
    <div 
      class="ellipsis-text"
      :title="displayText"
      @dblclick="handleDblClick"
    >
      {{ displayText }}
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      :modal="true"
      :modal-append-to-body="true"
      lock-scroll
      destroy-on-close
      append-to-body
    >
      <div class="detail-content">
        <el-input
          ref="contentInputRef"
          v-model="fullContent"
          type="textarea"
          :rows="8"
          readonly
          resize="none"
          class="full-content-textarea"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCopy" type="primary" :icon="CopyDocument">
            复制内容
          </el-button>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="EllipsisText">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

// 定义组件属性
interface Props {
  content?: string | number
  title?: string
  maxLength?: number
  dblclickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  title: '详情',
  maxLength: 50,
  dblclickable: true
})

// 内部状态
const dialogVisible = ref(false)
const fullContent = ref('')
const contentInputRef = ref()

// 计算显示文本
const displayText = computed(() => {
  const contentStr = String(props.content || '')
  if (contentStr.length <= props.maxLength) {
    return contentStr
  }
  return contentStr.substring(0, props.maxLength) + '...'
})

// 对话框标题
const dialogTitle = computed(() => {
  return props.title || '详情'
})

// 处理双击事件
function handleDblClick(event: MouseEvent) {
  if (!props.dblclickable) {
    return
  }
  
  // 阻止事件冒泡，避免触发父元素的点击事件
  event.stopPropagation()
  event.preventDefault()
  
  fullContent.value = String(props.content || '')
  dialogVisible.value = true
}

// 复制内容
async function handleCopy() {
  try {
    // 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullContent.value)
      ElMessage.success('复制成功')
    } else {
      // 降级方案：使用传统的 execCommand 方式
      const textarea = contentInputRef.value?.$el?.querySelector('textarea')
      if (textarea) {
        textarea.select()
        document.execCommand('copy')
        ElMessage.success('复制成功')
      } else {
        throw new Error('无法访问 textarea 元素')
      }
    }
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.ellipsis-text-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ellipsis-text {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
  position: relative;
  z-index: 1;
}

.ellipsis-text:hover {
  background-color: var(--el-fill-color-light);
  border-radius: 2px;
}

.detail-content {
  padding: 0;
}

.full-content-textarea {
  width: 100%;
}

.full-content-textarea :deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
