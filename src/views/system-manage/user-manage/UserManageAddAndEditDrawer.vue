<script setup lang="ts">
import {useElForm} from "@/components/base-form/useElForm.ts";
import {isPasswordRegExp, isPhoneRegExp} from "@/util/validator.ts";
import {sexList} from "@views/system-manage/user-manage/userManageCommon.ts";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import {ElMessage} from "element-plus";
import BaseDrawerComp from "@/components/base-drawer/BaseDrawerComp.vue";
import BaseTitle from "@/components/base-drawer/BaseTitle.vue";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";

interface IProps {
	props: {
		list: any[],
		isAddOrEdit: 'add' | 'edit',
	},
}
const {props} = defineProps<IProps>()
const emits = defineEmits(['ok', 'cancel'])

const formObject = useElForm({
	list: [
		{
			label: '账号',
			prop: 'account',
			type: 'input',
			required: true,
		},
		{
			label: '密码',
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
		{
			label: '昵称',
			prop: 'nickname',
			type: 'input',
		},
		{
			label: '性别',
			prop: 'sex',
			type: 'radio',
			selectObject: sexList,
		},
		{
			label: '手机号码',
			prop: 'phone',
			type: 'input',
			rules: {
				pattern: isPhoneRegExp,
				trigger: 'change',
				message: '手机格式不正确',
			},
		},
		{
			label: '简介',
			prop: 'description',
			type: 'textarea',
			rows: 4,
			maxLength: 300,
		},
	],
})
if (props.isAddOrEdit === 'edit' && props.list.length === 1) {
	formObject.reset(props.list[0])
}

const clickOk = async () => {
	if (!await formObject.validate()) {
		return
	}
	if (props.isAddOrEdit === 'add') {
		fetchAdd.doFetch()
	} else {
		fetchUpdate.doFetch()
	}
}
const clickCancel = () => {
	emits('cancel')
}
const fetchAdd = useBaseFetch({
	fetchOptionFn: () => ({
		url: 'user/addUser',
		mockProd: true,
		data: formObject.data,
	}),
	transformResponseDataFn: _responseData => {
		ElMessage.success('新增用户成功')
		emits('ok')
	},
})
const fetchUpdate = useBaseFetch({
	fetchOptionFn: () => ({
		url: 'user/editUser',
		mockProd: true,
		data: formObject.data,
	}),
	transformResponseDataFn: _responseData => {
		ElMessage.success('更新用户成功')
		emits('ok')
	},
})
</script>

<template>
	<base-drawer-comp>
		<template v-slot:default>
			<base-title title="用户信息"/>
			<el-form :ref="formObject.refName"
							 :model="formObject.data"
							 label-position="right"
							 :label-width="80"
							 :scroll-to-error="true"
							 style="width: 100%;"
							 class="mt-4 w-full grid grid-cols-1 gap-y-1"
			>
				<base-form-item-list :form-object="formObject"/>
			</el-form>
		</template>
		<template v-slot:footer>
			<el-button style="width: 80px;"
								 @click="clickCancel"
			>取消</el-button>
			<el-button type="primary"
								 style="margin-left: 16px;width: 80px;"
								 :loading="props.isAddOrEdit === 'add' ? fetchAdd.isFetching : fetchUpdate.isFetching"
								 @click="clickOk"
			>{{props.isAddOrEdit === 'add' ? '新增' : '更新'}}</el-button>
		</template>
	</base-drawer-comp>
</template>











































