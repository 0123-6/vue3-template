import {ref} from 'vue'
import {defineStore} from 'pinia'
import {type IUserInfo} from '@views/system-manage/user-manage/userManageCommon.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'

export const useUserStore = defineStore('user', () => {
  const user = ref(null as IUserInfo)

  return {
    user,
  }
})

// 保存全局权限
export const usePermissionsStore = defineStore('permissions', () => {
  // 按钮权限数组
  const permissions = ref([])
  // 是否有某个权限
  const isPermission = permission => {
    return permissions.value.includes(permission) || import.meta.env.DEV
  }

  return {
    permissions,
    isPermission,
  }
})

// 是否没有某个权限
export const isPermission = permission => {
  const {isPermission} = usePermissionsStore()
  return isPermission(permission)
}

// 获取用户信息
export const fetchUserInfoObject = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'user/getUserInfo',
    mockProd: true,
  }),
  transformResponseDataFn: (responseData: IUserInfo) => {
    const userStore = useUserStore()
    userStore.user = responseData
  },
})
