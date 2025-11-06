<script setup lang="ts">
import {watchLocationPathname} from '@/util/watchLocationPathname.ts'
import {onUnmounted, ref} from 'vue'
import router from '@/plugin/vue-router.ts'

const menuList = ref<string[]>([])
const getMenuList = () => {
  queueMicrotask(() => {
    menuList.value = router.currentRoute.value.matched.slice(1).map(route => (route.name as string))
  })
}
getMenuList()
const stop = watchLocationPathname(getMenuList)
onUnmounted(stop)

</script>

<template>
  <div class="flex items-center gap-x-2">
    <span>{{ menuList?.[0] }}</span>
    <template
      v-for="(item, index) in menuList.slice(1)"
      :key="index"
    >
      <span>/</span>
      <span>{{ item }}</span>
    </template>
  </div>
</template>
