import {ISelectOption, useElSelect} from '@/components/base-form/useElSelect.ts'
import {useResetRef} from '@/util/hooks/useResetState.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'

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
  // 最新活跃时间
  lastActiveTime: string,
  // 权限信息
  permissionList: string[],
  // 在线状态,动态设置,非用户自身信息
  isOnline?: boolean,

  // 权限相关,分为前端权限+后端权限
  // 前端权限
  // roleList?: string[],
}

// 权限基本结构
type IPermissionType = 'directory' | 'menu' | 'button'

export interface IPermission {
  // 唯一的名字
  name: string,
  // 类型
  type: IPermissionType,
  // 父节点,不存在代表顶层结构
  parent?: string,
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

// true & false
export const onlineSelectObject: ISelectOption[] = [
  {
    label: '在线',
    value: true,
    type: 'primary',
  },
  {
    label: '不在线',
    value: false,
    type: 'text',
  },
]

// 获取账号列表
export const getUserAccountListSelectObject = useElSelect({
  fetchOptionFn: () => ({
    url: 'user/getAccountList',
    mockProd: true,
  }),
})

// 获取全量权限列表
const {
  state: allPermissionList,
  resetState: resetAllPermissionList,
} = useResetRef((): IPermission[] => [])
const fetchAllPermissionList = useBaseFetch({
  beforeFetchResetFn: resetAllPermissionList,
  fetchOptionFn: () => ({
    url: 'getAllPermissionList',
    mockProd: true,
  }),
  transformResponseDataFn: (responseData: IPermission[]) => {
    allPermissionList.value = responseData
  },
  microTask: true,
})