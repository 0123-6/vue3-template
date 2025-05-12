<script setup lang="ts">
import router from "@/plugin/vue-router.ts";

const goIndexPage = () => {
  router.push('/index')
}
</script>

<template>
	<!--最外层-->
	<div class="hpj w-full grow flex flex-col">
		<span class="text-[30px] leading-[30px]">404</span>
		<button @click="goIndexPage">跳转到首页</button>
	</div>
</template>

