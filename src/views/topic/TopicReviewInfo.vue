<template>
  <review-info-dialog
    v-model:visible="visible"
    title="审核信息"
    :entity-title="topicData?.title"
    :review-outcome="topicData.lastReviewOutcome"
    :reviewer-name="topicData.reviewerName"
    :reviewer-id="topicData.reviewerId"
    :reviewed-at="topicData.reviewedAt"
    :feedback="topicData.lastReviewFeedback"
  />
</template>

<script lang="ts" setup name="TopicReviewInfo">
import { ref, reactive } from 'vue'
import type { TopicResponse } from '@/types/api/topic'
import ReviewInfoDialog from '@/components/common/ReviewInfoDialog.vue'

// 控制对话框显示与否
const visible = ref(false)

// 题目数据
const topicData = reactive<TopicResponse>({
  id: '',
  title: '',
  description: '',
  teacherId: '',
  status: 0,
  departmentId: '',
  source: '',
  type: '',
  nature: '',
  difficulty: 1,
  workload: 1,
  maxSelections: 1,
  selectedCount: 0,
  teacherNumber: '',
  departmentName: '',
  lastReviewOutcome: undefined,
  lastReviewFeedback: '',
  reviewerId: undefined,
  reviewerName: undefined,
  reviewedAt: undefined,
})

// 显示审核信息
function showModel(row: TopicResponse) {
  // 重置数据
  Object.assign(topicData, {
    id: '',
    title: '',
    description: '',
    teacherId: '',
    status: 0,
    departmentId: '',
    source: '',
    type: '',
    nature: '',
    difficulty: 1,
    workload: 1,
    maxSelections: 1,
    selectedCount: 0,
    teacherNumber: '',
    departmentName: '',
    lastReviewOutcome: undefined,
    lastReviewFeedback: '',
    reviewerId: undefined,
    reviewedAt: undefined,
  })

  // 填充数据
  Object.assign(topicData, row)

  visible.value = true
}

// 关闭对话框
function handleClose() {
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  showModel,
})
</script>
