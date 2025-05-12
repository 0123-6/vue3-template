<script setup lang="ts">
import BaseBg from "@/components/base-bg/BaseBg.vue";
</script>

<template>
	<div class="w-full grow">
		<BaseBg/>
		<div class="w-full h-full flex justify-center items-center">
			<RouterView/>
		</div>
	</div>
</template>