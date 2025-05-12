<script setup lang="ts">
import {nextTick, onMounted, onScopeDispose, ref, watch} from "vue";

interface IProps {
	lineHeight?: number,
	lineClamp?: number,
	text: string,
}
const props = defineProps<IProps>()

const textRef = ref<HTMLElement>()
const isOverflow = ref(false)
const lineClamp = ref(props.lineClamp ?? 1)

const checkOverflow = () => {
	if (!(textRef.value)) {
		return
	}
	const maxHeight = lineClamp.value * (props.lineHeight ?? 20)
	isOverflow.value = textRef.value.scrollHeight > maxHeight
}

watch(() => props.text, async () => {
	await nextTick()
	checkOverflow()
})

onMounted(() => {
	const observer = new ResizeObserver(checkOverflow)
	if (textRef.value) {
		observer.observe(textRef.value)
	}

	onScopeDispose(() => observer.disconnect())
})

</script>

<template>
	<div class="hpj w-full flex items-center">
		<el-tooltip effect="dark"
								placement="top"
								:disabled="!isOverflow"
								:content="text"
								popper-class="hpj"
		>
			<span
				ref="textRef"
				class="text-left tracking-tight break-all overflow-hidden"
				style="display: -webkit-box!important;-webkit-box-orient: vertical;"
				:style="{
					'-webkit-line-clamp': lineClamp,
					'line-height': `${lineHeight ?? 20}px`,
				}"
			>{{ text }}</span>
		</el-tooltip>
	</div>
</template>