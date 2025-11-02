<script setup lang="ts">
import {onMounted} from 'vue'
import * as echarts from 'echarts'

onMounted(() => {
  // 测试echarts
  const chartDom = document.getElementById('test-echarts')
  const myChart = echarts.init(chartDom)

  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line',
      },
    ],
  }

  myChart.setOption(option)
})
</script>

<template>
  <div class="w-full h-[600px] flex flex-col">
    <span class="text-primary text-3xl">你好,vue-ts</span>
    <div
      id="test-echarts"
      class="w-[500px] h-[500px]"
    />
  </div>
</template>
