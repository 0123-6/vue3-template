<script setup lang="ts">
import {isFalse} from '@/util/validator.ts'
import {type IBaseTableColumn} from '@/components/base-table/useElTable.ts'
import {nextTick, onMounted, ref, watch} from 'vue'
import BaseCopy from '@/components/base-copy/BaseCopy.vue'

interface IProps {
  item: IBaseTableColumn,
  scope: Record<string, any>,
}

const props = defineProps<IProps>()

const textRef = ref<HTMLElement>()
const divRef = ref<HTMLDivElement>()
const isOverflow = ref(false)
const lineClamp = ref(-1)

const checkOverflow = () => {
  if (!(textRef.value && divRef.value)) {
    return
  }
  const lineHeight = 20
  // - .el-table__cell的padding-top + padding-bottom - border-bottom = 15
  if (lineClamp.value === -1) {
    lineClamp.value = Math.floor((divRef.value.parentElement.parentElement.clientHeight - 15) / lineHeight)
  }
  const maxHeight = lineClamp.value * lineHeight
  isOverflow.value = textRef.value.scrollHeight > maxHeight
}

if (!(props.item?.list?.length || props.item.operatorList?.length)) {
  watch(() => props.scope.row[props.item.prop], async () => {
    await nextTick()
    checkOverflow()
  })

  onMounted(checkOverflow)
}
</script>

<template>
  <div
    v-if="item?.list?.length"
    class="w-full h-full flex justify-center items-center"
  >
    <div
      class="h-[32px] rounded flex justify-center items-center"
      :style="{
        width: `${14 * Math.max(...(item.list.map(_item => _item.label.length))) + 16*2}px`,
      }"
      :class="[
        item.list[item.list.findIndex(_item => _item.value === scope.row[item.prop])]?.type === 'primary' ? 'bg-primary-light text-primary' : '',
        item.list[item.list.findIndex(_item => _item.value === scope.row[item.prop])]?.type === 'success' ? 'bg-success-light text-success' : '',
        item.list[item.list.findIndex(_item => _item.value === scope.row[item.prop])]?.type === 'warning' ? 'bg-warning-light text-warning' : '',
        item.list[item.list.findIndex(_item => _item.value === scope.row[item.prop])]?.type === 'error' ? 'bg-error-light text-error' : '',
        item.list[item.list.findIndex(_item => _item.value === scope.row[item.prop])]?.type === 'text' ? 'bg-text-light text-text-desc' : '',
      ]"
    >
      <span>{{ item.list[item.list.findIndex(_item => _item.value === scope.row[item.prop])]?.label }}</span>
    </div>
  </div>
  <div
    v-else-if="item.operatorList?.length"
    class="w-full h-full flex justify-center items-center"
  >
    <div class="flex items-center gap-x-2">
      <button
        v-for="(_item, index2) in item.operatorList.filter(__item => isFalse(__item.hidden))"
        :key="index2"
        :class="[
          !_item?.disabled?.(scope.row) && _item.type === 'primary' ? 'text-primary' : '',
          !_item?.disabled?.(scope.row) && _item.type === 'success' ? 'text-success' : '',
          !_item?.disabled?.(scope.row) && _item.type === 'warning' ? 'text-warning' : '',
          !_item?.disabled?.(scope.row) && _item.type === 'error' ? 'text-error' : '',
          !_item?.disabled?.(scope.row) && _item.type === 'text' ? 'text-text-title' : '',
          _item?.disabled?.(scope.row) ? 'text-text-desc' : '',
        ]"
        :disabled="_item?.disabled?.(scope.row)"
        @click="_item?.onClick?.(scope.row, scope.$index)"
      >
        {{ _item.text }}
      </button>
    </div>
  </div>
  <div
    v-else
    ref="divRef"
    class="hpj group relative w-full h-full flex justify-center items-center"
  >
    <BaseCopy
      v-if="item.copy"
      class="hidden group-hover:flex absolute right-0"
      :value="item.formatter?.(scope.row[item.prop]) ?? scope.row[item.prop]"
    />
    <el-tooltip
      effect="dark"
      placement="top"
      :disabled="!isOverflow"
      :content="scope.row[item.prop]+''"
      popper-class="hpj"
    >
      <span
        ref="textRef"
        class="text-left tracking-tight break-all leading-[20px]"
        :class="[
          (lineClamp === 1 || lineClamp === -1) ? 'line-clamp-1' : '',
          lineClamp === 2 ? 'line-clamp-2' : '',
          lineClamp === 3 ? 'line-clamp-3' : '',
          lineClamp === 4 ? 'line-clamp-4' : '',
          lineClamp === 5 ? 'line-clamp-5' : '',
          lineClamp === 6 ? 'line-clamp-6' : '',
        ]"
      >{{ item.formatter?.(scope.row[item.prop]) ?? scope.row[item.prop] }}</span>
    </el-tooltip>
  </div>
</template>