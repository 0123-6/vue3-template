// 用户的信息
export interface IUserInfo {
	// 系统级别基本信息,必须存在
	// 系统的唯一标识
	id: string,
	// 用户名,不可重复
	account: string,
	// 密码
	password: string,
	// 状态
	status: 'normal' | 'stop',

	// 用户选填的一些个人信息
	phone?: string,
	// 邮箱
	email?: string,
	// 性别
	sex?: 'man' | 'woman',
	// 年龄
	age?: number,

	// 权限相关,分为前端权限+后端权限
	// 前端权限
	roleList: string[],
}