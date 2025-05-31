<script setup lang="ts">
import {projectConfig} from "../../../project.config.ts";
import BaseFullscreen from "@/components/base-fullscreen/BaseFullscreen.vue";
import BaseSpanTooltip from "@/components/base-span-tooltip/BaseSpanTooltip.vue";
import LogoutIcon from "@views/layout-page/icon/LogoutIcon.vue";
import {useRenderComp} from "@/components/base-dialog/useRenderComp.ts";
import PromptDialog from "@/components/base-dialog/PromptDialog.vue";
import {IPromptDialog} from "@/components/base-dialog/PromptDialogInterface.ts";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import router from "@/plugin/vue-router.ts";
import {onMounted, ref, useTemplateRef} from "vue";
import {watchLocationPathname} from "@/util/watchLocationPathname.ts";
import overlayScrollbar from "@/util/overlayScrollbar.ts";
import {useUserStore} from "@/plugin/pinia.ts";
import {ElMessage} from "element-plus";

const isChildWeb = window !== window.parent

// 用户相关
const userStore = useUserStore()
if (!userStore.user) {
	ElMessage.warning('请先登录')
	router.replace('/auth/login')
}

const fetchLogout = useBaseFetch({
	fetchOptionFn: () => ({
		mockUrl: 'logout',
		url: 'logout',
	}),
	transformResponseDataFn: _responseData => {
		userStore.user = null
		router.replace('/auth/login')
	},
})

const renderLogoutDialog = useRenderComp(PromptDialog, {
	title: '提示',
	text: '确认退出登录吗?',
	fetchObject: fetchLogout,
	okButton: {
		type: 'primary',
		text: '退出',
		fetchText: '退出中',
	},
} as IPromptDialog)

const clickLogout = () => {
	renderLogoutDialog()
}

// 菜单相关逻辑
const activeMenu = ref(location.pathname)
watchLocationPathname(pathname => {
	console.log(pathname)
	activeMenu.value = pathname
})

// Vue无关，将滚动条改为好看的样式
const appElement = useTemplateRef('appElement')
onMounted(() => {
	const instance = overlayScrollbar({
		element: appElement.value,
		autoHide: false,
	})

	watchLocationPathname(() => {
		instance.elements()?.scrollOffsetElement?.scrollTo({
			top: 0,
			left: 0,
		})
	})
})
</script>

<template>
	<div class="w-full h-full flex flex-col shrink-0-children"
			 :style="{padding: isChildWeb
			  ? '4px 24px 0 16px'
			  : projectConfig.isShowMenu ? '' : '16px 24px 0 16px',
			 }"
	>
		<!--头部-->
		<div class="hpj w-full h-[50px] flex justify-between items-center bg-white border-b border-disabled px-4">
			<!--左-->
			<div class="flex items-center shrink-0-children">
				<img src="/logo.webp" alt="" style="width: 32px;height: 32px;" class="object-cover">
				<span class="ml-2 text-text-title text-lg font-semibold">Vue3模板网站</span>
				<div class="ml-[50px] flex items-center gap-x-2">
					<span>首页</span>
					<span>/</span>
					<span>首页</span>
				</div>
			</div>
			<!--右-->
			<div class="flex items-center gap-x-3">
				<div class="w-[120px] h-[32px] bg-disabled rounded-full flex items-center px-2 cursor-pointer hover:text-text-title">
					<el-icon><Search /></el-icon>
					<span class="ml-4">搜索菜单</span>
				</div>
				<base-fullscreen/>
				<!--个人图片-->
				<el-popover :width="240"
										placement="bottom-end"
										:show-arrow="false"
										popper-class="hpj"
										:popper-style="{padding: 0,}"
										:offset="4"
										:teleported="false"
				>
					<template v-slot:reference>
						<button class="w-[44px] h-[44px] flex justify-center items-center hover:bg-disabled rounded-full">
							<div class="w-[32px] h-[32px] rounded-full overflow-hidden">
								<img src="/default_avatar.jpg">
							</div>
						</button>
					</template>
					<template v-slot:default>
						<div class="w-[240px] flex flex-col">
							<div class="w-full p-3 flex items-center gap-x-2 border-b border-disabled">
								<div class="w-[48px] shrink-0 h-[48px] rounded-full overflow-hidden">
									<img src="/default_avatar.jpg" alt="">
								</div>
								<div class="grow h-[48px] flex flex-col justify-between">
									<base-span-tooltip style="width: 100px;"
																:text="userStore.user?.account"/>
									<span class="w-full line-clamp-1 break-all text-xs"
												style="display: -webkit-box!important;">{{userStore.user?.phone}}</span>
								</div>
							</div>
							<div class="m-1 h-[40px] p-1.5 rounded flex items-center gap-x-1 text-text-title cursor-pointer hover:bg-disabled"
									 @click="clickLogout"
							>
								<logout-icon/>
								<span>退出登录</span>
							</div>
						</div>
					</template>
				</el-popover>
			</div>
		</div>
		<!--内容-->
		<div class="w-full flex shrink-0-children"
				 style="height: calc(100% - 50px);"
		>
			<!--左边菜单-->
			<div class="w-[222px] h-full flex flex-col bg-white border-r border-disabled">
				<el-menu :router="true"
								 :default-active="activeMenu"
				>
					<el-menu-item index="/index"
												route="/index">
						<template v-slot:title>
							<el-icon><House /></el-icon>
							<span>首页</span>
						</template>
					</el-menu-item>
					<el-sub-menu index="系统管理">
						<template v-slot:title>
							<el-icon><Operation /></el-icon>
							<span>系统管理</span>
						</template>
						<template v-slot:default>
							<el-menu-item index="/system-manage/user-manage"
														route="/system-manage/user-manage">
								<template v-slot:title>
									<el-icon><User /></el-icon>
									<span>用户管理</span>
								</template>
							</el-menu-item>
							<el-menu-item index="/system-manage/role-manage"
														route="/system-manage/role-manage">
								<template v-slot:title>
									<el-icon><Discount /></el-icon>
									<span>角色管理</span>
								</template>
							</el-menu-item>
							<el-menu-item index="/system-manage/permission-manage"
														route="/system-manage/permission-manage">
								<template v-slot:title>
									<el-icon><Key /></el-icon>
									<span>权限管理</span>
								</template>
							</el-menu-item>
						</template>
					</el-sub-menu>
				</el-menu>
			</div>
			<div class="h-full"
					 ref="appElement"
					 style="width: calc(100% - 222px);"
			>
				<div class="w-full min-w-[1440px] h-full min-h-[700px] flex flex-col"
						 style="padding: 16px 24px 0 16px;"
				>
					<RouterView></RouterView>
					<div class="h-[16px] shrink-0"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.el-menu {
	border-right: unset;
}
</style>