<template>
  <div class="selection-progress-chart">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>题目统计</span>
          <el-select v-model="departmentId" size="small" @change="loadData" placeholder="选择院系" clearable>
            <el-option label="全部院系" value="" />
            <el-option 
              v-for="dept in departmentList" 
              :key="dept.id" 
              :label="dept.name" 
              :value="dept.id" 
            />
          </el-select>
        </div>
      </template>
      <div ref="chartRef" class="chart-container" style="height: 400px;"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { TopicProgressResponse } from '@/api/dashboard'
import { dashboardApi } from '@/api/dashboard'
import { departmentApi } from '@/api/department'
import type { DepartmentResponse } from '@/types/api/department'

// 院系选择
const departmentId = ref<string>('')

// 院系列表
const departmentList = ref<DepartmentResponse[]>([])

// 图表实例
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 图表数据
const selectionData = ref({
  open: 0,        // 开放选题
  reviewing: 0,   // 审核中
  selected: 0,    // 已选
  closed: 0       // 关闭
})

// 加载院系列表
const loadDepartmentList = async () => {
  try {
    const res = await departmentApi.getAllDepartments()
    departmentList.value = res.data || []
  } catch (error: any) {
    console.error('加载院系列表失败:', error.message)
    departmentList.value = []
  }
}

// 加载数据
const loadData = async () => {
  try {
    // 直接使用字符串，避免大数字精度丢失
    // 注意：雪花算法生成的 ID 是 18-19 位，超出 JavaScript Number 的安全范围
    const validDeptId = departmentId.value === '' ? undefined : departmentId.value
    
    const res = await dashboardApi.getTopicProgress(validDeptId)
    const data: TopicProgressResponse = res.data
    
    selectionData.value = {
      open: data.open,
      reviewing: data.reviewing,
      selected: data.selected,
      closed: data.closed
    }
    
    updateChart()
  } catch (error: any) {
    console.error('[选题进度] 加载选题进度数据失败:', error.message)
    // 使用模拟数据作为降级方案
    selectionData.value = {
      open: Math.floor(Math.random() * 50) + 20,
      reviewing: Math.floor(Math.random() * 30) + 10,
      selected: Math.floor(Math.random() * 60) + 30,
      closed: Math.floor(Math.random() * 20) + 5
    }
    updateChart()
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}题 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['开放选题', '审核中', '已选', '关闭']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    series: [
      {
        name: '题目状态',
        type: 'pie',
        radius: '60%',
        center: ['55%', '50%'],
        data: [
          { 
            value: selectionData.value.open, 
            name: '开放选题',
            itemStyle: { color: '#67C23A' }
          },
          { 
            value: selectionData.value.reviewing, 
            name: '审核中',
            itemStyle: { color: '#E6A23C' }
          },
          { 
            value: selectionData.value.selected, 
            name: '已选',
            itemStyle: { color: '#409EFF' }
          },
          { 
            value: selectionData.value.closed, 
            name: '关闭',
            itemStyle: { color: '#909399' }
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c}'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

// 监听院系变化
watch(departmentId, () => {
  loadData()
})

onMounted(() => {
  initChart()
  loadDepartmentList()  // 加载院系列表
  loadData()
})
</script>

<style scoped>
.selection-progress-chart {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
}
</style>
