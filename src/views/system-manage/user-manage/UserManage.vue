<script setup lang="ts">
import {useElForm} from "@/components/base-form/useElForm.ts";
import {useElTable} from "@/components/base-table/useElTable.ts";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";
import BaseFormFold from "@/components/base-form/BaseFormFold.vue";
import {RefreshRight, Search} from "@element-plus/icons-vue";
import BaseTableColumnList from "@/components/base-table/BaseTableColumnList.vue";
import TableNoData from "@/components/base-table/TableNoData.vue";
import {useResetRef} from "@/util/hooks/useResetState.ts";
import {useElFeedback} from "@/components/base-dialog/useElFeedback.ts";
import {sexList, userStatusList} from "@views/system-manage/user-manage/userManageCommon.ts";
import UserManageAddAndEditDrawer from "@views/system-manage/user-manage/UserManageAddAndEditDrawer.vue";
import {useRenderComp} from "@/components/base-dialog/useRenderComp.ts";
import PromptDialog from "@/components/base-dialog/PromptDialog.vue";
import {IPromptDialog} from "@/components/base-dialog/PromptDialogInterface.ts";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/plugin/pinia.ts";

// 表格部分
const formObject = useElForm({
	list: [
		{
			label: '账号',
			prop: 'account',
			type: 'input',
		},
		{
			label: '昵称',
			prop: 'nickname',
			type: 'input',
		},
		{
			label: '性别',
			prop: 'sex',
			type: 'select',
			selectObject: sexList,
		},
		{
			label: '手机号',
			prop: 'phone',
			type: 'input',
		},
		{
			label: '状态',
			prop: 'status',
			type: 'select',
			selectObject: userStatusList,
		},
		{
			label: '简介',
			prop: 'description',
			type: 'input'
		},
		{
			label: '创建时间',
			prop: ['createTimeBegin', 'createTimeEnd'],
			type: 'daterange',
		},
	],
})

// 表格部分
const tableObject = useElTable({
	fetchOptionFn: () => ({
		url: 'user/getUserList',
		mockProd: true,
		data: formObject.data,
	}),
	list: [
		{
			type: 'selection',
		},
		{
			prop: 'index',
		},
		{
			label: '账号',
			prop: 'account',
			width: 150,
		},
		{
			label: '昵称',
			prop: 'nickname',
			width: 150,
		},
		{
			label: '性别',
			prop: 'sex',
			list: sexList,
		},
		{
			label: '手机号',
			prop: 'phone',
			width: 200,
		},
		{
			label: '状态',
			prop: 'status',
			list: userStatusList,
		},
		{
			label: '简介',
			prop: 'description',
			minWidth: 200,
		},
		{
			label: '创建时间',
			prop: 'createTime',
			width: 200,
		},
		{
			label: '操作',
			operatorList: [
				{
					text: '编辑',
					type: 'primary',
					onClick: (item: any) => {
						tableObject.resetType(item)
						resetIsAddOrEdit('edit')
						drawerObject.isShow = true
					},
				},
				{
					text: '删除',
					type: 'error',
					onClick: (item: any) => {
						tableObject.resetType(item)
						renderDeleteDialog()
					},
					disabled: item => item.account === useUserStore().user.account,
					hidden: false,
				},
			],
		},
	],
})
formObject.addResetHook(tableObject.reset)
const clickSearch = async () => {
	if (!await formObject.validate()) {
		return
	}
	tableObject.reset()
	tableObject.doFetch()
}
const clickReset = () => {
	formObject.reset()
	tableObject.doFetch()
}

// 新增
const {
	state: isAddOrEdit,
	resetState: resetIsAddOrEdit,
} = useResetRef((): 'add' | 'edit' => 'add')
const clickBatchAdd = () => {
	tableObject.resetType('batch')
	resetIsAddOrEdit('add')
	drawerObject.isShow = true
}
const drawerObject = useElFeedback({
	okHook: tableObject.doFetch,
})

// 删除
const clickBatchDelete = () => {
	tableObject.resetType('batch')
	renderDeleteDialog()
}
const renderDeleteDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
	width: 500,
	title: '删除用户',
	textList: tableObject.type === 'single'
		? ['确定删除', {text: tableObject.selectItem.account as string, color: 'primary',}, '吗?', ]
		: ['确定批量删除', {text: tableObject.selectItemList.length, color: 'primary', }, '个账号吗?', ],
	okButton: {
		text: '确定删除',
		fetchText: '删除中',
		type: 'danger',
	},
	fetchObject: fetchDeleteObject,
}))
const fetchDeleteObject = useBaseFetch({
	fetchOptionFn: () => ({
		url: 'user/deleteUser',
		mockProd: true,
		data: {
			accountList: tableObject.type === 'single'
				? [tableObject.selectItem.account]
				: tableObject.selectItemList.map(item => item.account)
		},
	}),
	transformResponseDataFn: () => {
		ElMessage.success('删除成功')
		tableObject.reset('pageNum')
		tableObject.doFetch()
	},
})
</script>

<template>
	<div class="hpj w-full grow rounded bg-white p-4 flex flex-col gap-y-4">
		<!--标题-->
		<span class="text-text-title font-medium text-base">用户管理</span>
		<!--form表单-->
		<div class="rounded bg-[#f6f7fc] p-4 flex flex-col">
			<!--上-->
			<el-form :ref="formObject.refName"
							 :model="formObject.data"
							 inline
							 label-position="right"
							 :label-width="120"
							 :scroll-to-error="true"
							 style="width: 100%;"
							 class="grid grid-cols-4"
			>
				<base-form-item-list :form-object="formObject"
														 @change="clickSearch"
				/>
			</el-form>
			<!--下-->
			<div class="ml-[120px] flex items-center gap-x-4">
				<el-button type="primary" :icon="Search" @click="clickSearch">查询</el-button>
				<el-button :icon="RefreshRight" @click="clickReset">重置</el-button>
				<base-form-fold :form-object="formObject"/>
			</div>
		</div>
		<!--操作行-->
		<div v-if="true"
				 class="flex items-center gap-x-4">
			<el-button v-if="true"
								 type="primary"
								 style="width: 80px;height: 32px;"
								 @click="clickBatchAdd"
			>新增</el-button>
			<el-button v-if="true"
								 type="danger"
								 plain
								 style="width: 90px;height: 32px;"
								 :disabled="!(tableObject.selectItemList.length
								  && tableObject.selectItemList.every(item => item.account !== useUserStore().user.account))"
								 @click="clickBatchDelete"
			>批量删除</el-button>
		</div>
		<!--表格-->
		<el-table :ref="tableObject.refName"
							:data="tableObject.data.list"
							v-loading="tableObject.isFetching"
							@selection-change="tableObject.resetSelectItemList($event)"
							@sort-change="tableObject.changeSort"
							stripe
							:row-style="{height: `${tableObject.rowHeight}px!important`,}"
		>
			<base-table-column-list :list="tableObject.list"/>
			<template v-slot:empty>
				<TableNoData/>
			</template>
		</el-table>
		<!--总条数 + 分页器-->
		<div class="h-[32px] flex justify-between items-center">
			<span class="text-text">共 {{tableObject.data.total}} 项数据</span>
			<el-pagination layout="sizes, prev, pager, next, jumper, ->"
										 size="default"
										 :background="true"
										 v-model:current-page="tableObject.params.pageNum"
										 v-model:page-size="tableObject.params.pageSize"
										 :total="tableObject.data.total"
										 :page-sizes="tableObject.pageSizeList"
										 @change="tableObject.doFetch"
			/>
		</div>
		<!--feedback组件-->
		<el-drawer v-model="drawerObject.isShow"
							 :append-to-body="true"
							 :title="isAddOrEdit === 'add' ? '新增' : '编辑'"
							 :close-on-click-modal="true"
							 :close-on-press-escape="false"
							 :destroy-on-close="true"
							 :size="500"
							 @close="drawerObject.onCancel"
							 modal-class="hpj"
		>
			<UserManageAddAndEditDrawer :props="{
				isAddOrEdit,
				item: tableObject.selectItem,
			}"
																	@ok="drawerObject.onOk"
																	@cancel="drawerObject.onCancel"
			/>
		</el-drawer>
	</div>
</template>























































