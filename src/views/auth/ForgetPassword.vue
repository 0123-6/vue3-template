<script setup lang="ts">
import {ElMessage} from "element-plus";
import {isEmailRegExp} from "@/util/validator.ts";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import router from "@/plugin/vue-router.ts";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";
import {useElForm} from "@/components/base-form/useElForm.ts";

const formObject = useElForm({
	list: [
		{
			label: '邮箱',
			hiddenLabel: true,
			prop: 'email',
			type: 'input',
			required: true,
			rules: {
				pattern: isEmailRegExp,
				trigger: 'change',
				message: '邮箱格式不正确',
			},
		},
	],
})
const fetchSendEmail = useBaseFetch({
	fetchOptionFn: () => ({
		url: 'mock_',
		data: formObject.data,
	}),
	transformResponseDataFn: () => {
		ElMessage.success('重置密码邮件已发送到你的邮箱')
	},
})
const clickSendEmail = async () => {
	if (!await formObject.validate()) {
		return
	}
	fetchSendEmail.doFetch()
}
const clickReturn = () => {
	router.replace('/auth/login')
}
</script>

<template>
	<div class="hpj w-[640px] h-[400px] px-[100px] py-[64px] bg-white shadow-2xl rounded-3xl flex flex-col">
		<span class="text-text-title font-bold text-[36px] leading-[36px]">忘记密码? 🤦🏻‍♂️ </span>
		<span class="mt-4 text-text ">输入您的电子邮件，我们将向您发送重置密码的连接</span>
		<el-form :ref="el => formObject.formRef = el"
						 :model="formObject.data"
						 label-position="right"
						 :label-width="0"
						 :scroll-to-error="true"
						 style="width: 100%;"
						 class="mt-6 flex flex-col gap-y-2"
						 hide-required-asterisk
		>
			<base-form-item-list :form-object="formObject"/>
		</el-form>
		<el-button type="primary"
							 :loading="fetchSendEmail.isFetching"
							 style="margin-top: 4px;height: 40px;"
							 @click="clickSendEmail"
		>{{!fetchSendEmail.isFetching ? '发送重置链接' : '发送中'}}</el-button>
		<el-button size="large"
							 @click="clickReturn"
							 style="margin-top: 20px;"
		>返回</el-button>
	</div>
</template>