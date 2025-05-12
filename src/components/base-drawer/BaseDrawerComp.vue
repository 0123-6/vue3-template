<script lang="ts" setup>
</script>

<template>
	<div class="hpj w-full py-4 pr-6 flex flex-col"
			 style="height: calc(100% - 88px)"
			 v-scrollbar
	>
		<slot name="default"></slot>
	</div>
	<!--尾部插槽-->
	<div class="hpj footer">
		<slot name="footer"></slot>
	</div>
</template>