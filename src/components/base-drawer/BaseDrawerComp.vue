<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import type {OverlayScrollbars} from 'overlayscrollbars'
import overlayScrollbar from '@/util/overlayScrollbar.ts'

const divRef = ref<HTMLDivElement>(null)
let divRefScrollbar: OverlayScrollbars
onMounted(() => {
  divRefScrollbar = overlayScrollbar({
    element: divRef.value,
    autoHide: false,
  })
})
onUnmounted(() => {
  divRefScrollbar?.destroy()
})
</script>

<template>
  <div
    :ref="(el: HTMLDivElement) => divRef = el"
    class="hpj w-full py-4 pr-6 flex flex-col"
    style="height: calc(100% - 88px)"
  >
    <slot name="default" />
  </div>
  <!--尾部插槽-->
  <div class="hpj footer">
    <slot name="footer" />
  </div>
</template>
