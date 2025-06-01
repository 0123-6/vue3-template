import {ISelectOption} from "@/components/base-form/useElSelect.ts";

// 用户的信息
export interface IUserInfo {
	// 账号,系统的唯一标识,不可重复
	account: string,
	// 新建时需要
	password?: string,
	// 昵称
	nickname?: string,
	// 性别
	sex?: 'man' | 'woman',
	// 手机号
	phone?: string,
	// 状态
	status: 'normal' | 'disabled',
	// 简介
	description?: string,
	// 创建时间
	createTime?: string,

	// 权限相关,分为前端权限+后端权限
	// 前端权限
	roleList?: string[],
}

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