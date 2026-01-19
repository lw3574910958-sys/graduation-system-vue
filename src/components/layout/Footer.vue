<template>
  <div class="version">
    <span target="_blank" class="copyright"> @{{ currentDate }} 高校毕业设计管理系统 </span>
    <a target="_blank" class="version" href="https://github.com/lw3574910958-sys/graduation-system-vue"
      >github: graduation-system
    </a>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
const currentDate = dayjs().format('YYYY-MM-DD')
</script>
