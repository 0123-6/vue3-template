<script setup lang="ts">
import {goFirstRoute} from '@/plugin/vue-router.ts'

</script>

<template>
  <!--最外层-->
  <div class="hpj w-full grow flex flex-col">
    <span class="text-[30px] leading-[30px]">404</span>
    <button @click="goFirstRoute">
      跳转到首页
    </button>
  </div>
</template>

