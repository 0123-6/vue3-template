<script lang="ts" setup>
import {onBeforeUnmount, onMounted} from 'vue'
import {microWebChild} from '@/util/microWeb.ts'
import router from '@/plugin/vue-router.ts'
import {usePermissionsStore} from '@/plugin/pinia'

const isChildWeb = window !== window.parent
if (isChildWeb) {
  const microWebChildInstance = microWebChild({
    router,
    initEvent: (initData: Record<string, any>) => {
      const permissionsStore = usePermissionsStore()
      permissionsStore.permissions = initData.permissions
    },
  })
  onMounted(microWebChildInstance.ready)
  onBeforeUnmount(microWebChildInstance.cancel)
}
</script>


<template>
  <RouterView />
</template>