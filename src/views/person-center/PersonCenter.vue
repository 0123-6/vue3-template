<template>
	<!--最外层-->
	<div class="w-full h-full flex flex-col bg-amber-200">
		<!--2种选择文件的方式-->
		<div class="flex items-center">
			<!--点击-->
			<img ref="clickElementRef"
			     src="/default_avatar.jpg" alt=""
			     class="cursor-pointer"
			     style="width: 400px;"
			>
			<!--拖拽-->
			<div ref="dragElementRef"
			     class="ml-2 w-[400px] min-h-[400px] cursor-pointer bg-blue-700 flex justify-center items-center">
				<span>将文件拖到此处</span>
			</div>
		</div>
		<img :src="imgUrl2"
		     alt=""
		     class="w-[300px] h-[300px]"
		>
		<!--弹框-->
		<el-dialog
			v-model="dialogVisible"
			title="Tips"
			width="500"
			destroy-on-close
		>
			<cropper-comp :img-url="imgUrl" @exportImg="exportImg"/>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import CropperComp from "@/components/CropperComp.vue";
import {ableSelectFileByClick, ableSelectFileByDrag, type ISelectFileProps} from "@/util/file.ts";

// state
const clickElementRef = ref<HTMLElement>()
const dragElementRef = ref<HTMLDivElement>()
const dialogVisible = ref(false)
const imgUrl = ref('')
const imgUrl2 = ref('')
// effect
onMounted(() => {
	// 设置点击选择文件元素
	const clickProps: ISelectFileProps = {
		element: clickElementRef.value!,
		accept: 'image/*',
		callback: file => {
			console.log('点击读取成功')
			console.log(file)
			imgUrl.value = URL.createObjectURL(file)
			dialogVisible.value = true
		},
		callbackError: text => {
			alert(text)
		},
	}
	ableSelectFileByClick(clickProps)

	// 设置拖拽选择文件元素
	const dragProps: ISelectFileProps = {
		element: dragElementRef.value!,
		accept: 'image/*',
		callback: file => {
			console.log('点击读取成功')
			console.log(file)
			imgUrl.value = URL.createObjectURL(file)
			dialogVisible.value = true
		},
		callbackError: text => {
			alert(text)
		},
	}
	ableSelectFileByDrag(dragProps)
})
// methods
function exportImg(file) {
	dialogVisible.value = false
	imgUrl2.value = URL.createObjectURL(file)
}
</script>


