import {useResetRef} from '@/util/hooks/useResetState.ts'
import {onScopeDispose} from 'vue'

interface IUseCountdownReturn {
  readonly isRunning: boolean,
  readonly countdown: number,
  begin: () => void,
}

export const useCountdown = (sum: number = 60)
  : IUseCountdownReturn => {
  if (sum <= 0) {
    throw new Error('useCountdown的参数需为正整数,请检查参数')
  }
  const [countdown, resetCountdown] = useResetRef((): number => Math.floor(sum))
  const [isRunning, resetIsRunning] = useResetRef((): boolean => false)
  let timer: ReturnType<typeof setInterval> | undefined = undefined

  const cancel = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
    resetIsRunning()
    resetCountdown()
  }

  const begin = () => {
    if (isRunning.value) {
      return
    }
    isRunning.value = true
    timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value === 0) {
        cancel()
      }
    }, 1000)
  }

  onScopeDispose(cancel)

  return {
    get isRunning() {
      return isRunning.value
    },
    get countdown() {
      return countdown.value
    },
    begin,
  }
}