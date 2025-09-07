import type {App, DirectiveBinding} from 'vue'
import overlayScrollbar from '@/util/overlayScrollbar.ts'

// 产生不占位滚动条指令
const instanceMap = new WeakMap<HTMLElement, any>()
const scrollbarDirective = {
  mounted(el: HTMLElement, _binding: DirectiveBinding) {
    el.setAttribute('data-overlayscrollbars-initialize', 'true')
    const instance = overlayScrollbar({
      element: el,
    })
    instanceMap.set(el, instance)
  },
  unmounted(el: HTMLElement) {
    el.removeAttribute('data-overlayscrollbars-initialize')
    const instance = instanceMap.get(el)
    if (instance) {
      instance.destroy()
      instanceMap.delete(el)
    }
  },
}

export const setDirectiveForApp = (app: App) => {
  app.directive('scrollbar', scrollbarDirective)
}