<script setup lang="ts">
import {IUseElFormReturn} from "@/components/base-form/useElForm.ts";

interface IProps {
	formObject: IUseElFormReturn,
}
const props = defineProps<IProps>()

const changeFold = () => {
	props.formObject.isFold.value = !props.formObject.isFold.value
}
</script>

<template>
	<button v-if="formObject.canFold"
					@click="changeFold"
					class="hpj text-primary flex items-center gap-x-1"
	>
		<span>{{!formObject.isFold.value ? '收起' : '展开'}}</span>
		<el-icon>
			<ArrowUp v-show="!formObject.isFold.value"/>
			<ArrowDown v-show="formObject.isFold.value"/>
		</el-icon>
	</button>
</template>