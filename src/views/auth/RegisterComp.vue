<script setup lang="ts">
import {ElMessage, FormInstance} from "element-plus";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import router from "@/plugin/vue-router.ts";
import {useResetRef} from "@/util/hooks/useResetState.ts";
import {isPasswordRegExp} from "@/util/validator.ts";
import {useElForm} from "@/components/base-form/useElForm.ts";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";

const formObject = useElForm({
	list: [
		{
			label: '账号',
			hiddenLabel: true,
			prop: 'account',
			type: 'input',
			required: true,
		},
		{
			label: '密码',
			hiddenLabel: true,
			prop: 'password',
			placeholder: "请输入密码，只能包含数字，字母，下划线，8-16位",
			type: 'input-password',
			required: true,
			rules: [
				{pattern: isPasswordRegExp, trigger: 'change', message: '只能包含数字，字母，下划线，8-16位'},
				{
					validator: (_rule, _value, callback) => {
						formObject.validate(['password2'])
						callback()
					},
					trigger: 'change',
				},
			],
		},
		{
			label: '密码',
			hiddenLabel: true,
			prop: 'password2',
			type: 'input-password',
			placeholder: '请再次确认密码，只能包含数字，字母，下划线，8-16位',
			required: true,
			rules: [
				{pattern: isPasswordRegExp, trigger: 'change', message: '只能包含数字，字母，下划线，8-16位'},
				{
					validator: (_rule, _value, callback) => {
						if (formObject.data.password2 !== formObject.data.password) {
							callback(new Error('两次密码不一致'))
						} else {
							callback()
						}
					},
					trigger: 'change',
				},
			],
		},
	],
})
const {
	state: agree,
	resetState: _resetAgree,
} = useResetRef((): boolean => false)
const fetchRegister = useBaseFetch({
	fetchOptionFn: () => ({
		url: 'user/addUser',
		mockProd: true,
		data: formObject.data,
	}),
	transformResponseDataFn: () => {
		ElMessage.success('注册成功')
		router.replace('/auth/login')
	},
})
const clickRegister = async () => {
	if (!await formObject.validate()) {
		return
	}
	fetchRegister.doFetch()
}
const clickLogin = () => {
	router.replace('/auth/login')
}
</script>

<template>
	<div class="hpj w-[640px] h-[570px] px-[100px] py-[64px] bg-white shadow-2xl rounded-3xl flex flex-col">
		<span class="text-text-title font-bold text-[36px] leading-[36px]">创建一个账号 🚀 </span>
		<span class="mt-4 text-text ">让您的应用程序管理变得简单而有趣</span>
		<el-form :ref="(el: FormInstance) => formObject.formRef.value = el"
						 :model="formObject.data"
						 label-position="right"
						 :label-width="0"
						 :scroll-to-error="true"
						 style="width: 100%;"
						 class="mt-6 flex flex-col gap-y-2"
						 hide-required-asterisk
						 size="large"
		>
			<base-form-item-list :form-object="formObject"/>
		</el-form>
		<div class="mt-2 flex items-center">
			<el-checkbox v-model="agree"/>
			<span class="ml-2">我同意<span class="ml-1 text-primary cursor-pointer select-none">隐私政策和条款</span></span>
		</div>
		<el-button type="primary"
							 :loading="fetchRegister.isFetching"
							 :disabled="!agree"
							 style="margin-top: 20px;height: 40px;"
							 @click="clickRegister"
		>{{!fetchRegister.isFetching ? '注册' : '注册中'}}</el-button>
		<div class="mt-5 flex justify-center items-center gap-x-1">
			<span>已经有账号了?</span>
			<span class="text-primary cursor-pointer select-none"
						@click="clickLogin"
			>去登录</span>
		</div>
	</div>
</template>