<script setup lang="ts">
import {IUseFullscreenReturn, useFullscreen} from '@/components/base-fullscreen/useFullscreen.ts'
import FullScreenIcon from '@/components/base-fullscreen/icon/FullScreenIcon.vue'
import NotFullScreenIcon from '@/components/base-fullscreen/icon/NotFullScreenIcon.vue'

const fullscreenObject: IUseFullscreenReturn = useFullscreen()
</script>

<template>
  <button
    class="w-[32px] h-[32px] rounded-full hover:bg-disabled flex justify-center items-center"
    @click="fullscreenObject.isFullScreen = !fullscreenObject.isFullScreen"
  >
    <full-screen-icon v-show="!fullscreenObject.isFullScreen" />
    <not-full-screen-icon v-show="fullscreenObject.isFullScreen" />
  </button>
</template>