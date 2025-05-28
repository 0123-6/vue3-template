<script setup lang="ts">
import {useElForm} from "@/components/base-form/useElForm.ts";
import {ISelectOption} from "@/components/base-form/useElSelect.ts";
import {useElTable} from "@/components/base-table/useElTable.ts";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";
import BaseFormFold from "@/components/base-form/BaseFormFold.vue";
import {RefreshRight, Search} from "@element-plus/icons-vue";
import BaseTableColumnList from "@/components/base-table/BaseTableColumnList.vue";
import TableNoData from "@/components/base-table/TableNoData.vue";

// 表格部分
const sexList: ISelectOption[] = [
	{
		label: '男',
		value: 'man',
		type: 'primary',
	},
	{
		label: '女',
		value: 'woman',
		type: 'warning',
	},
]
const formObject = useElForm({
	list: [
		{
			label: '姓名',
			prop: 'username',
			type: 'input',
		},
		{
			label: '性别',
			prop: 'sex',
			type: 'select',
			selectObject: sexList,
		},
	],
})

// 表格部分
const tableObject = useElTable({
	fetchOptionFn: () => ({
		url: 'user/getList',
		data: formObject.data,
	}),
	list: [
		{
			type: 'selection',
		},
		{
			label: 'ID',
			prop: 'id',
			width: 70,
		},
		{
			label: '姓名',
			prop: 'username',
			width: 150,
		},
		{
			label: '性别',
			prop: 'sex',
			list: sexList,
		},
		{
			label: '简介',
			prop: 'desc',
			minWidth: 200,
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
	</div>
</template>