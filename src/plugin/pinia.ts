import {ref} from 'vue'
import {defineStore} from 'pinia'
import {IUserInfo} from "@views/system-manage/user-manage/userManageCommon.ts";

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

// 添加浏览器事件,处理刷新和退出事件
// window.addEventListener('beforeunload', () => {
// 	localStorage.setItem('vuexState', JSON.stringify(store.state))
// })