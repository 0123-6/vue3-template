import {Ref, ref} from 'vue'
import {ElMessage, TableInstance} from 'element-plus'
import {generateMockObject, IBaseFetch, IBaseItem, transformValue} from '@/util/api.ts'
import {IUseBaseFetchReturn, useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {camelToSnake} from '@/util/stringUtil.ts'
import {useResetReactive, useResetRef} from '@/util/hooks/useResetState.ts'

export interface IBaseTableColumn<T = any> extends IBaseItem {
  type?: 'selection',
  width?: number,
  minWidth?: number,
  align?: 'left' | 'center' | 'right',
  fixed?: 'left' | 'right',
  children?: IBaseTableColumn<T>[],
  // 操作列
  operatorList?: IOperatorItem<T>[],
  sortable?: 'custom',
}

export interface IOperatorItem<T> {
  text: string,
  type: 'primary' | 'success' | 'warning' | 'error' | 'text',
  hidden?: boolean | (() => boolean),
  disabled?: (item: T) => boolean,
  disabledText?: string | ((item: T) => string),
  onClick?: (item: T, index: number) => void,
}

export interface IUseElTableProps<T extends Record<string, any> = any> {
  // 行高
  rowHeight?: number,
  // 分页
  pageSizeList?: number[],
  // 因为这是要多次执行的,所以不能传递一个一次性值,而是一个函数,获取当时的期待值
  // 通过接口获取数据时必填
  fetchOptionFn?: () => IBaseFetch,
  microTask?: boolean,
  // 现成的数据
  preparedData?: T[],
  // 列属性数组,支持嵌套1次(二维数组)
  list: IBaseTableColumn<T>[],
}

type IParams = {
  pageNum: number,
  pageSize: number,
  // 排序属性
  orderFiled: string,
  // '', asc升序,desc降序
  orderStatus: string,
}

export interface IUseElTableReturn<T extends Record<string, any> = any> {
  tableRef: Ref<TableInstance>,
  rowHeight: number,
  pageSizeList: number[],
  list: IBaseTableColumn<T>[],
  params: IParams,
  reset: (newValue?: Partial<IParams> | 'pageNum') => void,
  data: {
    total: number,
    list: T[],
  },
  changeSort: (args: { prop: string; order?: string }) => Promise<void>,

  // 用来为表格的单个 / 批量操作服务
  readonly type: 'single' | 'batch' | undefined,
  readonly selectItem: T,
  readonly selectItemList: T[],
  resetSelectItemList: (newVlaue?: T[]) => void,
  resetType: (newValue ?: 'batch' | T) => void,

  readonly isFetching: boolean,
  beforeFetch: () => void,
  doFetch: () => Promise<boolean>,
}

export const useElTable = <T extends Record<string, any>>(props: IUseElTableProps<T>)
  : IUseElTableReturn<T> => {
  const {
    rowHeight = 48,
    pageSizeList = [10, 20, 30],
    fetchOptionFn,
    microTask = true,
    list,
    preparedData = [],
  } = props
  const tableRef = ref<TableInstance>(null)

  const {
    state: params,
    resetState: resetParams,
  } = useResetReactive(() => ({
    pageNum: 1,
    pageSize: 10,
    // 排序属性
    orderFiled: '',
    // '', asc升序,desc降序
    orderStatus: '',
  }))
  // 只重置params,不重置data,因为分页器依赖total属性
  // undefined: 重置一切
  // object: 更新params
  // true: 重置位置,selectItem相关属性,内部使用,外部不可使用
  // 表单部分reset()
  // 表格删除reset({pageNum: 1,})或reset('pageNum')
  // 表格非删除,无需调用reset,直接doFetch()就行
  const reset = (newValue?: Partial<IParams> | 'pageNum' | boolean) => {
    // 重置位置
    tableRef.value!.setScrollTop(0)
    tableRef.value!.clearSelection()
    resetType()
    // undefined: 重置一切
    if (newValue === undefined) {
      resetParams()
      tableRef.value!.clearSort()
      tableRef.value!.clearFilter()
    } else if (typeof newValue === 'object') {
      resetParams(newValue)
    } else if (newValue === 'pageNum') {
      resetParams({
        pageNum: 1,
      })
    } else if (newValue === true) {
      // do nothing
    }
  }

  const {
    state: data,
    resetState: resetData,
  } = useResetReactive((): {total: number, list: T[],} => ({
    total: 0,
    list: [],
  }))

  const solveRawData = (responseData: any) => {
    if (!responseData) {
      resetData()
      return
    }
    // 兼容数组类型
    if (Array.isArray(responseData)) {
      responseData = {
        list: responseData,
        total: responseData.length,
      }
    }
    if (typeof responseData !== 'object') {
      ElMessage.warning('表格请求接口返回值类型不合法,请检查接口')
      resetData()
      return
    }
    if (responseData.total == null || responseData.list == null || responseData.total < 0) {
      resetData()
      return
    }
    if (!Number.isInteger(responseData.total) || !Array.isArray(responseData.list)) {
      ElMessage.warning('表格请求接口返回值类型不合法,请检查接口')
      resetData()
      return
    }

    responseData.list = (responseData.list as Array<T>)
      .filter(Boolean)
      .map((item, index) => ({
        ...transformValue(item, list),
        index: index + 1 + params.pageSize * (params.pageNum - 1),
      }))
    resetData(responseData)
  }

  let fetchTable: IUseBaseFetchReturn
  if (fetchOptionFn) {
    fetchTable = useBaseFetch({
      beforeFetchResetFn: () => reset(true),
      fetchOptionFn: () => ({
        ...fetchOptionFn(),
        mockUrl: 'getTableList',
        mockObject: generateMockObject(list),
        data: {
          ...params,
          ...(fetchOptionFn().data),
        },
      }),
      transformResponseDataFn: solveRawData,
      microTask,
    })
  } else {
    fetchTable = {
      isFetching: false,
      beforeFetch: () => {
      },
      doFetch: async ()
        : Promise<boolean> => {
        return new Promise((resolve) => {
          // 需要等待dom结构出来后再渲染数据,否则组件判断文字是否溢出有bug,永远为溢出.
          setTimeout(() => {
            reset(true)
            solveRawData({
              list: preparedData,
              total: preparedData.length,
            })
            resolve(true)
          }, 0)
        })
      },
    }
    fetchTable.doFetch()
  }

  // 排序
  const changeSort = async ({prop, order = ''}) => {
    if (order === 'ascending') {
      order = 'asc'
    } else if (order === 'descending') {
      order = 'desc'
    }
    reset({
      pageNum: 1,
      pageSize: 10,
      orderFiled: order ? camelToSnake(prop) : '',
      orderStatus: order,
    })
    await fetchTable.doFetch()
  }

  // 用来为表格的单个 / 批量操作服务
  const {
    state: innerType,
    resetState: resetInnerType,
  } = useResetRef((): 'single' | 'batch' | undefined => undefined)
  const {
    state: selectItem,
    resetState: resetSelectItem,
  } = useResetRef((): T => null)
  const {
    state: selectItemList,
    resetState: resetSelectItemList,
  } = useResetRef((): T[] => [])
  const resetType = (newValue ?: 'batch' | T) => {
    if (newValue === undefined) {
      resetInnerType()
      resetSelectItem()
      resetSelectItemList()
    } else if (newValue === 'batch') {
      resetInnerType('batch')
      // 单个选择是即时生效,不缓存
      resetSelectItem()
    } else {
      resetSelectItem(newValue)
      resetInnerType('single')
    }
  }

  return {
    tableRef,
    rowHeight,
    pageSizeList,
    list,
    params,
    reset,
    data,
    changeSort,

    // 用来为表格的单个 / 批量操作服务
    get type() {
      return innerType.value
    },
    get selectItem() {
      return selectItem.value
    },
    get selectItemList() {
      return selectItemList.value
    },
    resetSelectItemList,
    resetType,

    get isFetching() {
      return fetchTable.isFetching
    },
    beforeFetch: fetchTable.beforeFetch,
    doFetch: fetchTable.doFetch,
  }
}