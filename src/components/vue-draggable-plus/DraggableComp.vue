<script setup lang="ts">
import {ref} from 'vue'
import {useDraggable} from 'vue-draggable-plus'

// state
const elRef = ref<HTMLElement>()
const list = ref([
  {
    name: 'Joao',
    id: 1,
  },
  {
    name: 'Jean',
    id: 2,
  },
  {
    name: 'Johanna',
    id: 3,
  },
  {
    name: 'Juan',
    id: 4,
  },
])
// methods
// 返回值是一个对象，包含了一些方法，比如 start、destroy、pause 等
const {start} = useDraggable(elRef, list, {
  animation: 150,
  ghostClass: 'ghost',
  onStart() {
    console.log('start')
  },
  onUpdate() {
    console.log('update')
  },
})
</script>

<template>
  <div class="hpj flex flex-col">
    <button @click="start()">
      start
    </button>
    <div class="flex">
      <div
        ref="elRef"
        class="flex flex-col gap-2 p-4 w-300px h-300px m-auto bg-gray-500/5 rounded"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="h-30 bg-gray-500/5 rounded p-3 cursor-move"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>