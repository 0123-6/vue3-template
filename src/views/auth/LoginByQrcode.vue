<script setup lang="ts">
import router from "@/plugin/vue-router.ts";

const clickReturn = () => {
	router.replace('/auth/login')
}
</script>

<template>
	<div class="hpj w-[640px] h-[520px] px-[100px] py-[64px] bg-white shadow-2xl rounded-3xl flex flex-col">
		<span class="text-text-title font-bold text-[36px] leading-[36px]">欢迎回来 📱 </span>
		<span class="mt-4 text-text ">请用手机扫描二维码登录</span>
		<img src="./icon/qrcode.png"
				 alt=""
				 style="width: 250px;height: 250px;"
				 class="self-center"
		>
		<span class="text-text self-center">扫码后点击 '确认'，即可完成登录</span>
		<el-button class="mt-5"
							 size="large"
							 @click="clickReturn">返回</el-button>
	</div>
</template>