<template>
	<!--最外层-->
	<div class="w-full flex flex-col bg-[blue]">
		<span class="text-3xl">模块4</span>
		<div class="w-full h-[300px] flex flex-col">
			<span class="mt-2 text-3xl">复制</span>
			<textarea v-model="text"></textarea>
			<button class="mt-2 w-[100px]"
			        @click="copy"
			>复制</button>
		</div>
		<el-table-v2
			:columns="columns"
			:data="data"
			:width="700"
			:height="400"
			fixed
		/>
		<DraggableComp class="mt-[500px]"/>
		<div class="flex-shrink-0 w-full h-[1000px]"></div>
		<div class="mt-5 flex items-center">
			<button @click="getData">防抖</button>
			<button @click="getData2" class="ml-4">节流</button>
		</div>
		<div class="mt-5 flex items-center">
			<button ref="xlsxRef">解析XLSX</button>
			<button @click="clickExport">导出XLSX</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {copyTextToClipboard} from "@/util/copyTextToClipboard.ts";
import DraggableComp from "@/components/vue-draggable-plus/DraggableComp.vue";
import {debounce, throttle} from "@/util/api.ts";
import {ableSelectFileByClick, type ISelectFileProps} from "@/util/file.ts";
import {excelExport, excelParse, type IExcelExportProps} from "@/util/excel.ts";

// state
const text = ref('')
const xlsxRef = ref()

// 生命周期
onMounted(() => {
	const clickProps: ISelectFileProps = {
		element: xlsxRef.value!,
		accept: '.xlsx, .xls',
		callback: async file => {
			excelParse({
				file,
				expectedKeyList: ['编号', '姓名', '性别', '年龄', '单位'],
				callback: excelData => {
					console.log(excelData)
				},
				callbackError: text => {
					alert(text)
				}
			})
		},
		callbackError: text => {
			alert(text)
		},
	}
	ableSelectFileByClick(clickProps)
})

// methods
function copy() {
	copyTextToClipboard(text.value)
}

const generateColumns = (length = 10, prefix = 'column-', props?: any) =>
	Array.from({ length }).map((_, columnIndex) => ({
		...props,
		key: `${prefix}${columnIndex}`,
		dataKey: `${prefix}${columnIndex}`,
		title: `Column ${columnIndex}`,
		width: 150,
	}))

const generateData = (
	columns: ReturnType<typeof generateColumns>,
	length = 200,
	prefix = 'row-'
) =>
	Array.from({ length }).map((_, rowIndex) => {
		return columns.reduce(
			(rowData, column, columnIndex) => {
				rowData[column.dataKey] = `Row ${rowIndex} - Col ${columnIndex}`
				return rowData
			},
			{
				id: `${prefix}${rowIndex}`,
				parentId: null,
			}
		)
	})

const columns = generateColumns(10)
const data = generateData(columns, 1000)

const getData = debounce(function () {
	console.log('点击了防抖函数')
}, 2000)
const getData2 = throttle(function () {
	console.log('点击了节流函数')
}, 2000)

function clickExport() {
	const data = [
		{
			'姓名': '夏翀',
			'年龄': 25,
		},
		{
			'姓名': '吕凤凤',
			'年龄': 24,
		},
		{
			'姓名': '江思雨',
			'年龄': 31,
		},
		{
			'姓名': '申梦瑶',
			'年龄': 32,
		},
		{
			'姓名': '唐建飞',
			'年龄': 33,
		},
		{
			'姓名': '马晓琪',
			'年龄': 28,
		},
		{
			'是': 's',
		}
	]
	const exportProps: IExcelExportProps = {
		fileName: '美女名单.xlsx',
		data,
		callback: () => {
			alert('导出成功')
		},
		callbackError: text => {
			alert(text)
		}
	}
	excelExport(exportProps)
}
</script>
