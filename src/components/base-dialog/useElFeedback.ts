import {useResetRef} from '@/util/hooks/useResetState.ts'

export interface IUseElFeedbackProps {
  okHook?: (...args: any[]) => void,
  cancelHook?: () => void,
}

export interface IUseElFeedbackReturn {
  isShow: boolean,
  onOk: (...args: any[]) => void,
  onCancel: () => void,
}

// Drawer,Dialog组件使用
export const useElFeedback = (props: IUseElFeedbackProps = {})
  : IUseElFeedbackReturn => {
  const {
    cancelHook = () => {},
    okHook = () => {},
  } = props

  const {
    state: isShow,
    resetState: resetIsShow,
  } = useResetRef((): boolean => false)

  const onOk = (...args: any[]) => {
    okHook(...args)
    onCancel()
  }

  const onCancel = () => {
    resetIsShow(false)
    cancelHook()
  }

  return {
    get isShow() {
      return isShow.value
    },
    set isShow(newValue) {
      resetIsShow(newValue)
    },
    onOk,
    onCancel,
  }
}