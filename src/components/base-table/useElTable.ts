import {useTemplateRef} from "vue";
import {ElMessage, TableInstance} from "element-plus";
import {formatterValue, generateMockObject, IBaseFetch, IBaseItem} from "@/util/api.ts";
import {IUseBaseFetchReturn, useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import {camelToSnake} from "@/util/stringUtil.ts";
import {useResetReactive, useResetRef} from "@/util/hooks/useResetState.ts";

export interface IBaseTableColumn extends IBaseItem{
	type?: 'selection',
	width?: number,
	minWidth?: number,
	align?: 'left' | 'center' | 'right',
	fixed?: 'left' | 'right',
	children?: IBaseTableColumn[],
	hidden?: boolean | (() => boolean),
	// 操作列
	operatorList?: IOperatorItem[],
}

export interface IOperatorItem {
	text: string,
	type: 'primary' | 'success' | 'warning' | 'error' | 'text',
	hidden?: boolean | (() => boolean),
	disabled?: (item: any) => boolean,
	disabledText?: string | ((item: any) => string),
	onClick?: (item: any) => void,
}

export interface IUseElTableProps {
	ref?: string,
	// 行高
	rowHeight?: number,
	// 分页
	pageSizeList?: number[],
	// 因为这是要多次执行的,所以不能传递一个一次性值,而是一个函数,获取当时的期待值
	// 通过接口获取数据时必填
	fetchOptionFn?: () => IBaseFetch,
	// 现成的数据
	preparedData?: any[],
	// 列属性数组,支持嵌套1次(二维数组)
	list: IBaseTableColumn[],
}

type IParams = {
	pageNum: number,
	pageSize: number,
	// 排序属性
	orderFiled: string,
	// '', asc升序,desc降序
	orderStatus: string,
}

export interface IUseElTableReturn {
	refName: string,
	rowHeight: number,
	pageSizeList: number[],
	list: IBaseTableColumn[],
	params: IParams,
	reset: (newValue?: Partial<IParams> | 'pageNum') => void,
	data: {
		total: number,
		list: any[],
	},
	changeSort: (args: { prop: string; order?: string }) => Promise<void>,

	// 用来为表格的单个 / 批量操作服务
	readonly type: 'single' | 'batch' | undefined,
	readonly selectItem: Record<string, string | number | boolean>,
	readonly selectItemList: Record<string, string | number | boolean>[],
	resetSelectItemList: (newVlaue?: Record<string, string | number | boolean>[]) => void,
	resetType: (newValue ?: 'batch' | Record<string, string | number | boolean>) => void,

	beforeFetchHookSet: Set<Function>,
	readonly isFetching: boolean,
	beforeFetch: () => void,
	doFetch: () => Promise<boolean>,
}

export const useElTable = (props: IUseElTableProps)
	: IUseElTableReturn => {
	const {
		rowHeight = 48,
		pageSizeList = [10, 20, 30],
		fetchOptionFn,
		list,
		preparedData,
	} = props
	const refName = props.ref ?? 'tableRef'
	const tableRef = useTemplateRef<TableInstance>(refName)

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
		tableRef.value!.setScrollLeft(0)
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
		}
	}

	const {
		state: data,
		resetState: resetData,
	} = useResetReactive(() => ({
		total: 0,
		list: [],
	}))

	const solveRawData = (responseData: any) => {
		if (!responseData) {
			resetData()
			return
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

		responseData.list = (responseData.list as Array<Record<string, any>>)
			.filter(Boolean)
			.map((item, index) => ({
				...formatterValue(item, list),
				index: index + 1 + params.pageSize * (params.pageNum - 1)
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
			microTask: true,
		})
	} else {
		fetchTable = {
			beforeFetchHookSet: undefined,
			isFetching: false,
			beforeFetch: () => {},
			doFetch: async ()
				: Promise<boolean> => {
				return new Promise((resolve, _reject) => {
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
	} = useResetRef((): Record<string, string | number | boolean> => null)
	const {
		state: selectItemList,
		resetState: resetSelectItemList,
	} = useResetRef((): Record<string, string | number | boolean>[] => [])
	const resetType = (newValue ?: 'batch' | Record<string, string | number | boolean>) => {
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
		refName,
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

		beforeFetchHookSet: fetchTable.beforeFetchHookSet,
		get isFetching() {
			return fetchTable.isFetching
		},
		beforeFetch: fetchTable.beforeFetch,
		doFetch: fetchTable.doFetch,
	}
}