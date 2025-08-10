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
  defaultExpandAll?: boolean,
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

export interface IUseElFormReturn<T extends Record<string, any>> {
  formRef: Ref<FormInstance>,
  list: IElFormItem[],
  canFold: boolean,
  isFold: Ref<boolean>,
  foldNumber: number,
  data: T,
  reset: (newValue?: Partial<T>) => void,
  validate: (propertyList?: (keyof T)[]) => Promise<boolean>,
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

export const useElForm = <T extends Record<string, any>>(props: IUseElFormProps)
  : IUseElFormReturn<T> => {
  const {
    foldNumber = 4,
    mode = 'query',
  } = props
  let {
    list = [] as IElFormItem[],
  } = props
  const formRef = ref<FormInstance>()

  list = list.filter(Boolean).filter(_item => isFalse(_item.hidden))

  const dataFn = (): T => {
    const data = Object.create(null) as T
    for (const item of list.filter(Boolean).filter(_item => isFalse(_item.hidden))) {
      if (Array.isArray(item.prop)) {
        item.prop.forEach(_item => data[_item as keyof T] = undefined)
      } else {
        data[item.prop as keyof T] = mode === 'query'
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

  // 重置表单组件
  const reset = (newValue?: Partial<T>) => {
    resetData(newValue)
    // 赋值
    if (newValue) {
      // ??? 需要这样吗,感觉不优雅
      if (formRef.value) {
        validate(Object.keys(newValue))
      }
    } else {
      // ??? clearValidate or resetFields
      formRef.value!.resetFields()
    }
  }

  const validate = async (propertyList?: (keyof T)[]): Promise<boolean> => {
    if (!formRef.value) {
      console.warn('formRef.value不存在,请检查代码')
      return false
    }

    try {
      if (propertyList) {
        await formRef.value.validateField(propertyList as string[])
        return true
      } else {
        await formRef.value.validate()
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
    validate,
  }
}