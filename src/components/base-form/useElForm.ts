import {FormInstance, FormItemRule} from 'element-plus'
import {ref, Ref} from 'vue'
import {useResetReactive} from '@/util/hooks/useResetState.ts'
import {ISelectOption, IUseElSelectReturn} from '@/components/base-form/useElSelect.ts'
import {isFalse} from '@/util/validator.ts'

export interface IElFormItem {
  // 自定义参数
  type: 'input' | 'input-password' | 'select' | 'tree' | 'radio'
    | 'checkbox' | 'textarea' | 'date' | 'daterange'
    | 'datetime' | 'datetimerange' | 'number',
  hidden?: boolean | (() => boolean),
  required?: boolean | (() => boolean),
  // 作为el-form-item组件的参数
  prop: string | (string[]),
  label: string,
  hiddenLabel?: boolean,
  rules?: FormItemRule | FormItemRule[],
  // 表单组件通用参数
  placeholder?: string,
  disabled?: boolean | (() => boolean),
  size?: 'large' | 'default' | 'small',
  // select, radio, tree专用,不包括lazy为true的tree
  selectObject?: IUseElSelectReturn | ISelectOption[],
  // select, tree专用
  multiple?: boolean,
  // tree专用
  lazy?: boolean,
  load?: (node: any, resolve: (data: []) => void) => void,
  // textarea专用
  rows?: number,
  minLength?: number,
  maxLength?: number,
  // 日期组件专用
  disabledDateFn?: (data: Date) => boolean,
  // 默认最近1周,最近1月,最近1年
  shortcuts?: {text: string, value: Date | Function}[],
}

export interface IUseElFormProps {
  list: IElFormItem[],
  foldNumber?: number,
  mode?: 'query' | 'edit',
}

export interface IUseElFormReturn {
  formRef: Ref<FormInstance>,
  list: IElFormItem[],
  canFold: boolean,
  isFold: Ref<boolean>,
  foldNumber: number,
  data: Record<string, any>,
  reset: (newValue?: Record<string, any>) => void,
  addResetHook: (fn: Function) => void,
  validate: (propertyList?: string[]) => Promise<boolean>,
}

const getItemDefaultValue = (item: IElFormItem): any => {
  const {
    type,
    multiple,
  } = item
  if (type === 'input' || type === 'input-password' || type === 'textarea') {
    return ''
  }
  if (type === 'select') {
    return multiple ? [] : null
  }
  return null
}

export const useElForm = (props: IUseElFormProps)
  : IUseElFormReturn => {
  const {
    foldNumber = 4,
    mode = 'query',
  } = props
  let {
    list = [] as IElFormItem[],
  } = props
  const formRef = ref<FormInstance>(null)

  list = list.filter(Boolean).filter(_item => isFalse(_item.hidden))

  const dataFn = (): Record<string, any> => {
    const data = Object.create(null)
    for (const item of list.filter(Boolean).filter(_item => isFalse(_item.hidden))) {
      if (Array.isArray(item.prop)) {
        item.prop.forEach(_item => data[_item] = undefined)
      } else {
        data[item.prop] = mode === 'query'
          ? undefined
          : getItemDefaultValue(item)
      }
    }
    return data
  }

  const {
    state: data,
    resetState: resetData,
  } = useResetReactive(dataFn)

  const isFold = ref<boolean>(false)
  const canFold = list.length > foldNumber

  // 订阅reset的函数,在reset执行时自动执行
  const resetHookSet = new Set<Function>()
  const addResetHook = (fn: Function) => {
    if (resetHookSet.has(fn)) {
      console.log(fn, '该函数已添加到hookSet,无需重复添加,请检查代码逻辑!')
      return
    }
    resetHookSet.add(fn)
  }

  // 重置表单组件
  const reset = (newValue?: Record<string, any>) => {
    // 赋值
    if (newValue) {
      resetData(newValue)
    } else {
      // ??? clearValidate or resetFields
      formRef.value!.resetFields()
      resetData()
      // 执行订阅的函数
      for (const hook of resetHookSet) {
        hook()
      }
    }
  }

  const validate = async (propertyList?: string[]): Promise<boolean> => {
    try {
      if (propertyList) {
        await formRef.value!.validateField(propertyList)
        return true
      } else {
        await formRef.value!.validate()
        return true
      }
    } catch (error) {
      console.log('校验失败', error)
      return false
    }
  }

  return {
    formRef,
    list,
    canFold,
    isFold,
    foldNumber,
    data,
    reset,
    addResetHook,
    validate,
  }
}