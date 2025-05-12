<script setup lang="ts">
import {ref} from "vue";

const iframeRef = ref<HTMLIFrameElement>()
const menuList = [
	{
		label: '模块1',
		component: 'module-one',
	},
	{
		label: '模块2',
		component: 'module-two',
	},
	{
		label: '模块3',
		component: 'module-three',
	},
	{
		label: '模块4',
		component: 'module-four',
	},
]

const clickMenu = component => {
	console.dir(iframeRef.value)
	iframeRef.value?.contentWindow?.postMessage(component, 'https://jiangjiang0123.cn:444')
}
</script>

<template>
<!--最外层-->
<div class="module-three bg-white flex flex-row h-full">
	<!--左侧菜单栏-->
	<div class="w-[200px] bg-[#aaaaaa] flex flex-col p-2 gap-y-2">
		<div v-for="(item, index) in menuList"
		     :key="index"
		     class="w-full h-[50px] border rounded-2xl bg-blue-700 hover:bg-blue-400 flex justify-center items-center cursor-pointer"
		     @click="clickMenu(item.component)"
		>
			<span class="flex">{{item.label}}</span>
		</div>
	</div>
	<!--右侧内容区-->
	<div class="flex flex-col" style="width: calc(100% - 200px);" v-scrollbar>
<!--		<div class="w-full bg-primary">-->
<!--			<div v-for="item in 100">-->
<!--				{{item}}-->
<!--			</div>-->
<!--		</div>-->
		<iframe ref="iframeRef"
            src="https://jiangjiang0123.cn:444/"
            width="100%"
            height="100%"/>
	</div>
</div>
</template>

<style>
.module-three {

}
</style>
