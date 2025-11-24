<script setup lang="ts">
import {nextTick, onMounted, onScopeDispose, ref, watch} from 'vue'

interface IProps {
  lineHeight?: number,
  lineClamp?: number,
  text: any,
}

const props = defineProps<IProps>()

const textRef = ref<HTMLElement>()
const isOverflow = ref(false)
const lineClamp = props.lineClamp ?? 1
const lineHeight = props.lineHeight ?? 20

const checkOverflow = () => {
  if (!(textRef.value)) {
    return
  }
  isOverflow.value = textRef.value.scrollHeight > lineClamp * lineHeight
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
    <el-tooltip
      effect="dark"
      placement="top"
      :disabled="!isOverflow"
      :content="typeof text === 'object' && text !== null ? JSON.stringify(text) : text+''"
      popper-class="hpj"
    >
      <span
        ref="textRef"
        class="text-left tracking-tight break-all overflow-hidden"
        style="display: -webkit-box!important;-webkit-box-orient: vertical;"
        :style="{
          '-webkit-line-clamp': lineClamp,
          'line-height': `${lineHeight}px`,
        }"
      >{{ text }}</span>
    </el-tooltip>
  </div>
</template>
