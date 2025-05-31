import {ISelectOption} from "@/components/base-form/useElSelect.ts";

export const sexList: ISelectOption[] = [
	{
		label: '男',
		value: 'man',
		type: 'primary',
	},
	{
		label: '女',
		value: 'woman',
		type: 'warning',
	},
]

// 用户状态
export const userStatusList: ISelectOption[] = [
	{
		label: '正常',
		value: 'normal',
		type: 'success',
	},
	{
		label: '禁用',
		value: 'disabled',
		type: 'error',
	},
]