import {ISelectOption, useElSelect} from '@/components/base-form/useElSelect.ts'

// 用户的信息
export interface IUserInfo {
  // 账号,唯一标识
  account: string,
  // 密码
  password: string,
  // 昵称
  nickname?: string,
  // 性别
  sex?: 'man' | 'woman',
  // 手机号,唯一
  phone?: string,
  // 状态
  status: 'normal' | 'disabled',
  // 说明
  description?: string,
  // 创建日期
  createTime: string,
  // 权限信息
  permissionList: string[],

  // 权限相关,分为前端权限+后端权限
  // 前端权限
  // roleList?: string[],
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

// 获取账号列表
export const getUserAccountListSelectObject = useElSelect({
  fetchOptionFn: () => ({
    url: 'user/getAccountList',
    mockProd: true,
  }),
})