<script setup lang="ts">
import {ElMessage} from "element-plus";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import router from "@/plugin/vue-router.ts";
import IconWeiXin from "@views/auth/icon/IconWeiXin.vue";
import IconQQ from "@views/auth/icon/IconQQ.vue";
import IconGithub from "@views/auth/icon/IconGithub.vue";
import IconGoogle from "@views/auth/icon/IconGoogle.vue";
import {useElForm} from "@/components/base-form/useElForm.ts";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";
import {useUserStore} from "@/plugin/pinia.ts";

const formObject = useElForm({
	list: [
		{
			label: '账号',
			placeholder: '请输入账号,admin可用',
			hiddenLabel: true,
			prop: 'account',
			type: 'input',
			required: true,
		},
		{
			label: '密码',
			placeholder: '请输入密码,password可用',
			hiddenLabel: true,
			prop: 'password',
			type: 'input-password',
			required: true,
		},
		{
			label: '记住账号',
			hiddenLabel: true,
			prop: 'remember',
			type: 'checkbox',
		},
	],
})
const fetchLogin = useBaseFetch({
	fetchOptionFn: () => ({
    // 登录相关接口直接调用线上接口,而不是mock接口
    mockProd: true,
		url: 'login',
		mockUrl: 'login',
		data: formObject.data,
	}),
	transformResponseDataFn: (user) => {
		// 保存到全局状态
		const useStore = useUserStore()
		useStore.user = user
		ElMessage.success('登录成功')
		router.replace('/index')
	},
})
const clickLogin = async () => {
	if (!await formObject.validate()) {
		return
	}
	fetchLogin.doFetch()
}
const clickLoginByPhone = () => {
	router.replace('/auth/login-by-phone')
}
const clickLoginByQrcode = () => {
	router.replace('/auth/login-by-qrcode')
}
const clickForgetPassword = () => {
	router.replace('/auth/forget-password')
}
const clickRegister = () => {
	router.replace('/auth/register')
}
</script>

<template>
	<div class="hpj w-[640px] h-[670px] px-[100px] py-[64px] bg-white shadow-2xl rounded-3xl flex flex-col">
		<span class="text-text-title font-bold text-[36px] leading-[36px]">欢迎回来 👋🏻</span>
		<span class="mt-4">请输入你的账户信息以开始管理你的项目</span>
		<el-form :ref="el => formObject.formRef = el"
						 :model="formObject.data"
						 label-position="right"
						 :label-width="0"
						 :scroll-to-error="true"
						 style="width: 100%;"
						 class="mt-6 flex flex-col gap-y-2"
						 hide-required-asterisk
						 size="large"
		>
			<base-form-item-list :form-object="formObject"
													 :range="[0, 2]"
			/>
			<div class="-mt-2 w-full flex justify-between items-center">
				<base-form-item-list :form-object="formObject"
														 :range="[2]"
				/>
				<button class="h-[40px] self-start text-primary"
								@click.prevent="clickForgetPassword"
				>忘记密码?</button>
			</div>
		</el-form>
		<el-button type="primary"
							 :loading="fetchLogin.isFetching"
							 style="height: 40px;"
							 @click="clickLogin"
		>{{!fetchLogin.isFetching ? '登录' : '登录中'}}</el-button>
		<div class="mt-5 h-[40px] flex items-center gap-x-4">
			<el-button style="width: 50%;height: 100%;"
								 @click="clickLoginByPhone"
			>手机号登录</el-button>
			<el-button style="width: 50%;height: 100%;"
								 @click="clickLoginByQrcode"
			>扫码登录</el-button>
		</div>
		<div class="mt-5 flex items-center">
			<div class="w-[160px] h-[1px] bg-disabled"></div>
			<div class="flex-1 flex justify-center items-center text-text-desc">
				<span>其它登录方式</span>
			</div>
			<div class="w-[160px] h-[1px] bg-disabled"></div>
		</div>
		<div class="mt-4 flex justify-center items-center gap-x-3 text-text text-base">
			<div class="w-[36px] h-[36px] hover:bg-bg rounded-full flex justify-center items-center cursor-pointer hover:text-text-title">
				<icon-wei-xin/>
			</div>
			<div class="w-[36px] h-[36px] hover:bg-bg rounded-full flex justify-center items-center cursor-pointer hover:text-text-title">
				<icon-q-q/>
			</div>
			<div class="w-[36px] h-[36px] hover:bg-bg rounded-full flex justify-center items-center cursor-pointer hover:text-text-title">
				<icon-github/>
			</div>
			<div class="w-[36px] h-[36px] hover:bg-bg rounded-full flex justify-center items-center cursor-pointer hover:text-text-title">
				<icon-google/>
			</div>
		</div>
		<div class="mt-6 flex justify-center items-center">
			<span class="text-base">还没有账号?</span>
			<button class="ml-2 text-primary text-base"
							@click="clickRegister"
			>创建账号</button>
		</div>
	</div>
</template>































