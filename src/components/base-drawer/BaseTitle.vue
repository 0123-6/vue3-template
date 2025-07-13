<script lang="ts" setup>
interface IProps {
  title: string
  size?: 16 | 14,
}

const props = defineProps<IProps>()
</script>

<template>
  <div class="hpj flex items-center gap-x-4">
    <div
      class="w-[4px] bg-primary rounded-r-sm"
      :style="{height: `${size ?? 16}px`,}"
    />
    <span
      class="text-text-title font-medium"
      :class="[size === 14 ? 'text-sm' : 'text-base']"
    >{{ props.title }}</span>
  </div>
</template>