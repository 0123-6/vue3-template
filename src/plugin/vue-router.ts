import {createRouter, createWebHistory, type Router, type RouteRecordRaw} from 'vue-router'
import NProgress from 'nprogress'
import '@/plugin/nprogress.css'
import {projectConfig} from '../../project.config.ts'
import {fetchUserInfoObject, useUserStore} from '@/plugin/pinia.ts'
import {Discount, House, Key, Operation, User} from '@element-plus/icons-vue'

NProgress.configure({showSpinner: false})

// VueRouter规定 path最外层以'/'开头,

export const menuRouteList: RouteRecordRaw[] = [
  // 首页
  {
    path: '/index',
    name: '首页',
    component: () => import('@views/index-page/IndexPage.vue'),
    meta: {
      icon: House,
    },
  },
  {
    path: '/system-manage',
    name: '系统管理',
    meta: {
      icon: Operation,
    },
    children: [
      {
        path: '/system-manage/user-manage',
        name: '用户管理',
        component: () => import('@views/system-manage/user-manage/UserManage.vue'),
        meta: {
          icon: User,
        },
      },
      {
        path: '/system-manage/role-manage',
        name: '角色管理',
        component: () => import('@views/system-manage/role-manage/RoleManage.vue'),
        meta: {
          icon: Discount,
        },
      },
      {
        path: '/system-manage/permission-manage',
        name: '权限管理',
        component: () => import('@views/system-manage/permission-manage/PermissionManage.vue'),
        meta: {
          icon: Key,
        },
      },
    ],
  },
  // 业务目录一
  {
    path: '/business-directory-one',
    name: '业务目录一',
    meta: {
      icon: House,
    },
    children: [
      {
        path: '/business-directory-one/business-menu-one-one',
        name: '业务菜单1-1',
        component: () => import('@views/business-directory-one/business-menu-one-one/BusinessMenuOneOne.vue'),
        meta: {
          icon: House,
        },
      },
      {
        path: '/business-directory-one/business-menu-one-two',
        name: '业务菜单1-2',
        component: () => import('@views/business-directory-one/business-menu-one-two/BusinessMenuOneTwo.vue'),
        meta: {
          icon: House,
        },
      },
      {
        path: '/business-directory-one/business-menu-one-three',
        name: '业务菜单1-3',
        component: () => import('@views/business-directory-one/business-menu-one-three/BusinessMenuOneThree.vue'),
        meta: {
          icon: House,
        },
      },
      {
        path: '/business-directory-one/business-menu-one-four',
        name: '业务菜单1-4',
        component: () => import('@views/business-directory-one/business-menu-one-four/BusinessMenuOneFour.vue'),
        meta: {
          icon: House,
        },
      },
    ],
  },
  // 业务目录二
  {
    path: '/business-directory-two',
    name: '业务目录二',
    meta: {
      icon: House,
    },
    children: [
      {
        path: '/business-directory-two/business-menu-two-one',
        name: '业务菜单2-1',
        component: () => import('@views/business-directory-two/business-menu-two-one/BusinessMenuTwoOne.vue'),
        meta: {
          icon: House,
        },
      },
      {
        path: '/business-directory-two/business-menu-two-two',
        name: '业务菜单2-2',
        component: () => import('@views/business-directory-two/business-menu-two-two/BusinessMenuTwoTwo.vue'),
        meta: {
          icon: House,
        },
      },
    ],
  },
]

// 获取用户第1个有效的路由
export const goFirstRoute = async () => {
  const userStore = useUserStore()
  let ok = false
  for (let i = 0; i < menuRouteList.length && !ok; i++) {
    if (!userStore.user.permissionList.includes(menuRouteList[i].name as string)) {
      continue
    }

    // 目录
    if (menuRouteList[i].children?.length) {
      for (let j = 0; j < menuRouteList[i].children.length && !ok; j++) {
        if (!userStore.user.permissionList.includes(menuRouteList[i].children[j].name as string)) {
          continue
        }

        router.push(menuRouteList[i].children[j].path)
        ok = true
      }
    } else if (menuRouteList[i].component) {
      // 菜单
      router.push(menuRouteList[i].path)
      ok = true
    }
  }
  // 没有任何权限,重定向到/index
  if (!ok) {
    router.push('/index')
  }
}

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

    children: [
      ...menuRouteList,
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
        // beforeEnter: () => {
        //   const {user} = useUserStore()
        //   if (user.value?.isAdmin) {
        //     return
        //   } else {
        //     errorMessage('您没有管理员权限')
        //     NProgress.done()
        //     return false
        //   }
        // },
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
    name: '404',
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
router.beforeEach(async (to) => {
  console.log(to)
  // 不需要权限的页面,比如登录页面,注册页面
  if (!to.meta.requiresAuth) {
    return
  }

  // 需要权限的页面
  const userStore = useUserStore()
  // 用户未登录
  if (!userStore.user) {
    await fetchUserInfoObject.doFetch()
  }

  if (!userStore.user) {
    return {
      path: '/auth/login',
      replace: true,
    }
  }

  if (to.path === '/') {
    goFirstRoute()
    return false
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