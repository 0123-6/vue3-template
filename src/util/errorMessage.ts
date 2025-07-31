import {ElMessage} from 'element-plus'

export default function (message: string) {
  ElMessage({
    type: 'error',
    message,
    showClose: true,
    duration: 0,
  })
}