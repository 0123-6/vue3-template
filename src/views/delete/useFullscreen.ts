import {onScopeDispose, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {useResetRef} from '@/util/hooks/useResetState.ts'

export interface IUseFullscreenReturn {
  isFullScreen: boolean,
}

// 是否是全屏,单例模式
const [isFullScreen] = useResetRef((): boolean => false)
isFullScreen.value = !!document.fullscreenElement
const appElement = document.documentElement
let ischanging = false
watch(isFullScreen, () => {
  if (ischanging) {
    return
  }
  if (isFullScreen.value) {
    appElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})
const fullscreenchangeEvent = () => {
  ischanging = true
  isFullScreen.value = !!document.fullscreenElement
  queueMicrotask(() => {
    ischanging = false
  })
}
document.addEventListener('fullscreenchange', fullscreenchangeEvent)
const fullscreenerrorEvent = () => {
  ElMessage.error('切换全屏操作失败!')
}
document.addEventListener('fullscreenerror', fullscreenerrorEvent)
const cancelFn = () => {
  document.removeEventListener('fullscreenchange', fullscreenchangeEvent)
  document.removeEventListener('fullscreenerror', fullscreenerrorEvent)
}

export const useFullscreen = ()
  : IUseFullscreenReturn => {
  onScopeDispose(cancelFn)

  return {
    get isFullScreen() {
      return isFullScreen.value
    },
    set isFullScreen(value) {
      isFullScreen.value = value
    },
  }
}