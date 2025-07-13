<script setup lang="ts">
import {IUseElFormReturn} from "@/components/base-form/useElForm.ts";
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";

interface IProps {
	formObject: IUseElFormReturn,
}
const props = defineProps<IProps>()

const changeFold = () => {
	props.formObject.isFold.value = !props.formObject.isFold.value
}
</script>

<template>
  <button
    v-if="formObject.canFold"
    class="hpj text-primary flex items-center gap-x-1"
    @click="changeFold"
  >
    <span>{{ !formObject.isFold.value ? '收起' : '展开' }}</span>
    <el-icon>
      <ArrowUp v-show="!formObject.isFold.value" />
      <ArrowDown v-show="formObject.isFold.value" />
    </el-icon>
  </button>
</template>