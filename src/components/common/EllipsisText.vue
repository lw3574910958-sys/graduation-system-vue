<template>
  <div class="ellipsis-text-container">
    <!-- 显示文本 -->
    <div 
      class="ellipsis-text"
      :title="displayText"
      @click="handleClick"
      @dblclick="handleDblClick"
    >
      {{ displayText }}
      <!-- 复制成功提示 -->
      <el-tooltip :visible="copyTooltipVisible" content="复制成功" placement="top">
        <span></span>
      </el-tooltip>
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
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

// 定义组件属性
interface Props {
  content?: string | number
  title?: string
  maxLength?: number
  dblclickable?: boolean
  copyOnClick?: boolean // 是否单击时复制，默认 false（单击选中，双击复制）
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  title: '详情',
  maxLength: 50,
  dblclickable: true,
  copyOnClick: false
})

// 内部状态
const dialogVisible = ref(false)
const fullContent = ref('')
const contentInputRef = ref()
const copyTooltipVisible = ref(false)

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
  
  // 双击时直接复制内容
  copyToClipboard(String(props.content || ''))
}

// 处理单击事件（可选：单击时复制）
async function handleClick() {
  if (props.copyOnClick) {
    await copyToClipboard(String(props.content || ''))
  }
}

// 复制到剪贴板
async function copyToClipboard(text: string) {
  try {
    // 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      ElMessage.success('复制成功')
    } else {
      // 降级方案：使用传统的 execCommand 方式
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('复制成功')
    }
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 复制内容（用于对话框中的复制按钮）
async function handleCopy() {
  await copyToClipboard(fullContent.value)
  dialogVisible.value = false
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
  user-select: text; /* 允许用户选中文本 */
  position: relative;
  z-index: 1;
  display: block;
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
