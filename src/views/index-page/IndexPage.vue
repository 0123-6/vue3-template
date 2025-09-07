<script setup lang="ts">
import {onMounted, ref} from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

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
  navigator.clipboard.writeText('你好，这是首页')
  const day = dayjs('2018-05-05').locale('zh-cn').format()
  console.log(day)
})
const list = ref([])
</script>

<template>
  <div class="w-full h-[600px] flex flex-col">
    <span class="text-primary text-3xl">你好,vue-ts</span>
    <div
      id="test-echarts"
      class="w-[500px] h-[500px]"
    />
    <div class="w-full flex flex-col">
      <div
        v-for="(item, index) in list"
        :key="index"
      >
        <img
          loading="lazy"
          :data-src="item"
          alt=""
          style="width: 100%;height: 600px;"
        >
      </div>
    </div>
  </div>
</template>
