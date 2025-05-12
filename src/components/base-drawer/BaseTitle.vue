<script lang="ts" setup>
import {defineProps} from "vue";

interface IProps {
	title: string
}

const props = defineProps<IProps>()
</script>

<template>
	<div class="hpj flex items-center gap-x-4">
		<div class="w-[4px] h-[16px] bg-primary rounded-r-sm"/>
		<span class="text-text-title font-medium text-base">{{ props.title }}</span>
	</div>
</template>