<script setup="" lang="ts">
import {ElMessage} from 'element-plus'
import {CopyDocument} from '@element-plus/icons-vue'

interface IProps {
  // 大小
  size?: number,
  // 要复制的值
  value: any,
}
const props = defineProps<IProps>()

const clickCopy = async () => {
  const copyValue: string = typeof props.value === 'string'
    ? props.value
    : JSON.stringify(props.value)
  await navigator.clipboard.writeText(copyValue)
  ElMessage.success(`文本 ${copyValue.length > 20 ? copyValue.slice(0, 20) + '...' : copyValue} 已复制`)
}
</script>

<template>
  <div
    class="cursor-pointer bg-white"
    :style="{
      width: `${props.size ?? 20}px`,
      height: `${props.size ?? 20}px`,
      padding: '2px',
      borderRadius: '2px',
    }"
    @click="clickCopy"
  >
    <CopyDocument />
  </div>
</template>
