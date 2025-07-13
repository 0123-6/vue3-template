<script lang="ts" setup>
import {nextTick, onMounted, ref} from 'vue'
import {ArrowDown, ArrowUp} from '@element-plus/icons-vue'

const styleMap = {
  primary: '#3D6FE2',
  success: '#3AC295',
  warning: '#F89741',
  error: '#E34D59',
  text: '#333333',
}

interface IProps {
  leftWidth: number,
  label: string,
  value?: any,
  color?: string,
}

const props = defineProps<IProps>()

// 控制展开/收起状态
const isExpanded = ref(false)

// 判断文本是否超出2行
const isOverflow = ref(false)
// 检测是否完成
const hasCheckedOverflow = ref(false)
const textElement = ref<HTMLSpanElement>()

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 检测文本是否溢出
const checkOverflow = () => {
  if (!textElement.value) {
    return
  }

  const lineHeight = parseFloat(getComputedStyle(textElement.value!).lineHeight)
  const maxLines = 2
  const maxHeight = lineHeight * maxLines

  isOverflow.value = (textElement.value!).offsetHeight > maxHeight
  hasCheckedOverflow.value = true
}


onMounted(() => {
  nextTick(checkOverflow)
})

</script>

<template>
  <div
    class="hpj flex items-stretch border-b border-[#F1F3F9] text-sm leading-5"
    style="transition: all 0.3s ease;"
  >
    <div
      class="py-2.5 bg-[#F9FAFD] flex justify-center items-center"
      :style="{
        width: props.leftWidth + 'px',
      }"
    >
      <span class="text-text">{{ props.label ?? '' }}</span>
    </div>
    <div
      class="px-6 py-2.5 flex"
      :style="{
        width: `calc(100% - ${props.leftWidth}px)`,
      }"
    >
      <span
        ref="textElement"
        class="text-text-title break-all whitespace-pre-wrap"
        :style="{
          width: isOverflow ? 'calc(100% - 46px)' : '100%',
          color: styleMap[props?.color || 'text'],
        }"
        :class="{
          'line-clamp-2': hasCheckedOverflow && !isExpanded,
        }"
      >{{ props.value ?? '' }}</span>
      <!--文字按钮-->
      <div
        v-if="isOverflow"
        class="pl-1 cursor-pointer select-none text-primary flex items-center hover:text-primary-hover"
        @click="toggleExpand"
      >
        <span>{{ isExpanded ? '收起' : '展开' }}</span>
        <el-icon>
          <ArrowUp v-if="isExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </div>
    </div>
  </div>
</template>