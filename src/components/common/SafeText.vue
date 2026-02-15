<template>
  <span v-if="allowHtml" v-html="sanitizedContent"></span>
  <span v-else>{{ sanitizedContent }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

// 组件属性定义
interface Props {
  // 要渲染的内容
  content: string
  // 是否允许 HTML 渲染
  allowHtml?: boolean
  // 自定义白名单标签（可选）
  allowedTags?: string[]
  // 自定义白名单属性（可选）
  allowedAttributes?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  allowHtml: false,
  allowedTags: () => ['b', 'i', 'em', 'strong', 'span'],
  allowedAttributes: () => ({ 'span': ['class', 'style'] })
})

// HTML 转义函数
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  return text.replace(/[&<>"'/]/g, (s) => map[s] || s)
}

// 使用 DOMPurify 进行 HTML 净化
function sanitizeHtml(html: string): string {
  try {
    // 配置净化选项
    const config = {
      ALLOWED_TAGS: props.allowedTags,
      ALLOWED_ATTR: Object.values(props.allowedAttributes).flat(),
      KEEP_CONTENT: true
    }
    
    return DOMPurify.sanitize(html, config)
  } catch (error) {
    console.warn('HTML 净化失败，返回转义后的内容:', error)
    return escapeHtml(html)
  }
}

// 计算安全的内容
const sanitizedContent = computed(() => {
  if (!props.content) return ''
  
  if (props.allowHtml) {
    return sanitizeHtml(props.content)
  } else {
    return escapeHtml(props.content)
  }
})

// 暴露方法供外部使用
defineExpose({
  escapeHtml,
  sanitizeHtml
})
</script>

<style scoped>
/* 安全文本组件样式 */
</style>