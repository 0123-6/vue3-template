<script setup lang="ts">
import {cloneDeep} from "lodash";
import {onMounted, ref} from "vue";
import * as echarts from 'echarts';
import {copyTextToClipboard} from "@/util/copyTextToClipboard.ts";
import dayjs from "dayjs";

const obj = cloneDeep({});
console.log(obj);

const getData = async () => {
	const res = await fetch('https://mock.apipark.cn/m1/1998724-1718330-default/pet/1')
	const resData = await res.json()
	console.log('resData: ', resData)
}
getData();
0
onMounted(() => {
	// 测试echarts
	var chartDom = document.getElementById('test-echarts');
	var myChart = echarts.init(chartDom);
	var option;

	option = {
		xAxis: {
			type: 'category',
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				data: [150, 230, 224, 218, 135, 147, 260],
				type: 'line'
			}
		]
	};

	option && myChart.setOption(option);
	copyTextToClipboard('你好，这是首页')
	const day = dayjs('2018-05-05').locale('zh-cn').format()
	console.log(day)
});
const value1 = ref(true);
const list = ref([])
</script>

<template>
<div class="w-full h-[600px] bg-blue-700 flex flex-col">
	<span class="text-red-500 text-3xl">你好,vue-ts</span>
	<div id="test-echarts"
	     class="w-[500px] h-[500px]"></div>
	<div v-scrollbar class="w-[200px] h-[200px] flex items-center">
		<span style="font-size: 100px;line-height: 100px;">五星红旗迎风飘扬</span>
	</div>
	<el-switch v-model="value1"></el-switch>
	<el-button type="danger">危险</el-button>
  <div class="w-[360px] h-[20px] bg-[blue]"></div>
  <div class="mt-4 w-[423px] h-[20px] bg-[blue]"></div>
	<div class="w-full flex flex-col">
		<div v-for="(item, index) in list"
		     :key="index"
		>
			<img v-lazyload :data-src="item" alt=""
			     style="width: 100%;height: 600px;">
		</div>
	</div>
</div>
</template>
