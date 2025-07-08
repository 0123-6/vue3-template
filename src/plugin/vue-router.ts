// @ts-nocheck
import {createRouter, createWebHistory, Router, RouteRecordRaw} from "vue-router";
import NProgress from 'nprogress'
import '@/plugin/nprogress.css'
import {projectConfig} from "../../project.config.ts";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/plugin/pinia.ts";

NProgress.configure({ showSpinner: false })

// VueRouter规定 path最外层以'/'开头,
// router.push和
const routes: RouteRecordRaw[] = [
	// 登录相关
	{
		path: '/auth',
		component: () => import('@views/auth/AuthPage.vue'),

		children: [
			{
				path: 'login',
				component: () => import('@views/auth/LoginComp.vue'),
			},
			{
				path: 'login-by-phone',
				component: () => import('@views/auth/LoginByPhone.vue'),
			},
			{
				path: 'login-by-qrcode',
				component: () => import('@views/auth/LoginByQrcode.vue'),
			},
			{
				path: 'register',
				component: () => import('@views/auth/RegisterComp.vue'),
			},
			{
				path: 'forget-password',
				component: () => import('@views/auth/ForgetPassword.vue'),
			},
		],
	},
	// 普通页面
	{
		path: '/',
		component: () => import('@views/layout-page/LayoutPageContent.vue'),
		meta: {
			requiresAuth: true,
		},

		redirect: '/index',
		children: [
			// 首页
			{
				path: '/index',
				component: () => import('@views/index-page/IndexPage.vue'),
			},
			{
				path: 'system-manage',
				children: [
					{
						path: 'user-manage',
						component: () => import('@views/system-manage/user-manage/UserManage.vue'),
					},
					{
						path: 'role-manage',
						component: () => import('@views/system-manage/role-manage/RoleManage.vue'),
					},
					{
						path: 'permission-manage',
						component: () => import('@views/system-manage/permission-manage/PermissionManage.vue'),
					},
				],
			},
			{
				path: '/module-two',
				component: () => import('@views/module-two/ModuleTwo.vue'),
			},
			{
				path: '/module-two/detail/:id',
				props: true,
				component: () => import('@views/module-two/detail/ModuleTwoDetail.vue'),
			},
			{
				path: '/module-three',
				component: () => import('@views/module-three/ModuleThree.vue'),
			},
			{
				path: '/module-four',
				component: () => import('@views/module-four/ModuleFour.vue'),
			},
			// 个人中心
			{
				path: '/person-center',
				component: () => import('@views/person-center/PersonCenter.vue'),
			},
			{
				path: '/learn-g6',
				component: () => import('@views/learn-g6/LearnG6.vue'),
			},
			// 管理员页面
			{
				path: '/manage',
				meta: {
					onlyAdmin: true,
				},
				component: () => import('@views/admin/AdminPage.vue'),
				// 路由独享守卫
				// beforeEnter: (to, from) => {
				// 	const {user} = useUserStore()
				// 	if (user.value?.isAdmin) {
				// 		return
				// 	} else {
				// 		errorMessage('您没有管理员权限')
				// 		NProgress.done()
				// 		return false
				// 	}
				// }
			},
			{
				path: '/web-one',
				component: () => import('@views/web-one/WebOne.vue'),
			},
		],
	},
	// 404
	{
		path: '/:pathMatch(.*)*',
		component: () => import('@views/not-found/NotFound.vue'),
	},
	// 测试
	{
		path: '/test',
		component: () => import('@views/test/TestComp.vue'),
	},
]

const router: Router = createRouter({
	// 默认是'/'
	// 部署在非根路径,需要指定createWebHistory的参数,如果不指定,路由会以location.origin,pathname为'/'为基准,
	// 而网站有前缀'/xxx',会导致路由匹配错误,跳转路由后刷新导致网站前缀丢失,无法匹配nginx的此网站路径,所以404.
	history: createWebHistory(projectConfig.baseUrl),
	routes,
	scrollBehavior: () => ({
		left: 0,
		top: 0,
	}),
})

// 全局前置守卫
router.beforeEach((to, from) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		const userStore = useUserStore()
		if (userStore.user) {
			return
		}

		if (history.length > 1) {
			ElMessage.warning('账号超时,请重新登录')
		}
		return {
			path: '/auth/login',
			replace: true,
		}
	}
})

// 不是其它网站的子网站
if (window === window.parent) {
	// 进度条
	router.beforeEach(() => {
		// 开启进度条
		NProgress.start()
	})

	router.afterEach(() => {
		// 关闭进度条,如果next(false)执行了，该守卫不会执行
		NProgress.done()
	})
}

// 无需使用useRouter(),直接使用导出的router即可
export default router