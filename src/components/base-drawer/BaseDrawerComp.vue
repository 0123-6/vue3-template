<script lang="ts" setup>
</script>

<template>
  <div
    v-scrollbar
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