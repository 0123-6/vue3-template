<template>
	<!--最外层-->
	<div class="module-two w-full h-full">
		<span>模块2</span>
		<el-slider v-model="value1" />
	</div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const value1 = ref(0)
</script>

<style scoped>
.module-two {
	:deep(.el-slider__bar) {
		background-color: orange;
	}
}
</style>

