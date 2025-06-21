<script setup lang="ts">
import {ElMessage, FormInstance, TableInstance} from "element-plus";
import {useElForm} from "@/components/base-form/useElForm.ts";
import {useElTable} from "@/components/base-table/useElTable.ts";
import {RefreshRight, Search} from "@element-plus/icons-vue";
import TableNoData from "@/components/base-table/TableNoData.vue";
import {
	ISelectOption,
	useElSelect
} from "@/components/base-form/useElSelect.ts";
import {useRenderComp} from "@/components/base-dialog/useRenderComp.ts";
import PromptDialog from "@/components/base-dialog/PromptDialog.vue";
import {IPromptDialog} from "@/components/base-dialog/PromptDialogInterface.ts";
import {useBaseFetch} from "@/util/hooks/useBaseFetch.ts";
import BaseFormItemList from "@/components/base-form/BaseFormItemList.vue";
import BaseFormFold from "@/components/base-form/BaseFormFold.vue";
import BaseTableColumnList from "@/components/base-table/BaseTableColumnList.vue";

// 表单部分
const moduleStatusList: ISelectOption[] = [
	{
		label: '未接入',
		value: '未接入',
		type: 'warning',
	},
	{
		label: '已接入',
		value: '已接入',
		type: 'primary',
	},
	{
		label: '下线',
		value: '下线',
		type: 'error',
	},
]

const formObject = useElForm({
	list: [
		{
			label: '产品名称',
			prop: 'sysCodeList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: (item: any) => `${item.sysName}(${item.sysCode})`,
					valueName: 'sysCode',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentSysSelectList',
				}),
			}),
		},
		{
			label: '产品模块',
			prop: 'moduleNameList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: 'moduleName',
					valueName: 'moduleName',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentModuleSelectList',
				}),
			}),
		},
		{
			label: '产品别名',
			prop: 'functionalDeptNameList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: 'functionalDeptName',
					valueName: 'functionalDeptName',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentFunctionalDeptNameSelectLis',
				}),
			}),
		},
		{
			label: '模块状态',
			prop: 'moduleStatusList',
			type: 'select',
			selectObject: moduleStatusList,
		},
		{
			label: '总部职能部门',
			prop: 'headquartersDeptList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: 'headquartersDept',
					valueName: 'headquartersDept',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentHeadQuartersDeptSelectList',
				}),
			}),
		},
		{
			label: '分公司职能部门',
			prop: 'provincequartersDeptList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: 'provincequartersDept',
					valueName: 'provincequartersDept',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentProvinceDeptSelectList',
				}),
			}),
		},
		{
			label: '建设单位',
			prop: 'constructionUnitList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: 'constructionUnit',
					valueName: 'constructionUnit',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentConstructionUnitSelectList',
				}),
			}),
		},
		{
			label: '建设团队',
			prop: 'constructionDeptList',
			type: 'select',
			selectObject: useElSelect({
				config: {
					labelName: 'constructionDept',
					valueName: 'constructionDept',
				},
				fetchOptionFn: () => ({
					url: 'pwarn-product-department/getProductDepartmentConstructionDeptSelectList',
				}),
			}),
		},
	],
})

// 表格部分
const tableObject = useElTable({
	fetchOptionFn: () => ({
		url: 'pwarn-product-department/queryData',
		data: formObject.data,
	}),
	list: [
		{
			type: 'selection',
			hidden: true,
		},
		{
			prop: 'index',
		},
		{
			label: '产品标识',
			prop: 'sysCode',
			minWidth: 180,
		},
		{
			label: '产品名称',
			prop: 'sysName',
			minWidth: 180,
		},
		{
			label: '产品模块',
			prop: 'moduleName',
			minWidth: 130,
		},
		{
			label: '产品别名',
			prop: 'functionalDeptName',
			minWidth: 130,
		},
		{
			label: '建设单位',
			prop: 'constructionUnit',
			minWidth: 170,
		},
		{
			label: '建设团队',
			prop: 'constructionDept',
			minWidth: 170,
		},
		{
			label: '总部职能部门',
			prop: 'headquartersDept',
			minWidth: 170,
		},
		{
			label: '使用部门',
			prop: 'usageDepCode',
			minWidth: 170,
		},
		{
			label: '分公司职能部门',
			prop: 'provincequartersDept',
			minWidth: 170,
		},
		{
			label: '模块状态',
			prop: 'moduleStatus',
			list: moduleStatusList,
		},
		{
			label: '模块接入时间',
			prop: 'moduleAccessTime',
			width: 170,
		},
		{
			label: '模块下线时间',
			prop: 'moduleOfflineTime',
			width: 170,
		},
		{
			label: '产品经理工号',
			prop: 'pmWorkNo',
			width: 140,
		},
		{
			label: '产品经理姓名',
			prop: 'pmName',
			width: 120,
		},
		{
			label: '操作',
			hidden: true,
			operatorList: [
				{
					text: '编辑',
					type: 'primary',
				},
				{
					text: '删除',
					type: 'error',
					onClick: (item: any) => {
						tableObject.resetType(item)
						renderDeleteDialog()
					},
				},
			],
		},
	]
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

// 删除弹框
const fetchDeleteObject = useBaseFetch({
	fetchOptionFn: () => ({
		url: 'mock_',
		data: {
			idList: tableObject.type === 'single'
				? [tableObject.selectItem.id]
				: tableObject.selectItemList.map(item => item.id)
		},
	}),
	transformResponseDataFn(_responseData) {
		ElMessage.success('删除成功')
		tableObject.reset('pageNum')
		tableObject.doFetch()
	},
})
const renderDeleteDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
	title: '删除财务系统职能部门',
	textList: [
		'确定删除',
		{
			text: tableObject.type === 'single' ? 1 : tableObject.selectItemList.length,
			color: 'primary',
		},
		'项财务系统职能部门设置？删除后设置将不再使用，请谨慎操作',
	],
	okButton: {
		text: '确认删除',
		fetchText: '删除中',
		type: 'danger',
	},
	fetchObject: fetchDeleteObject,
}))
const clickBatchDelete = () => {
	tableObject.resetType('batch')
	renderDeleteDialog()
}
// 新增和编辑功能待开发
</script>

<template>
	<div class="hpj w-full grow rounded bg-white p-4 flex flex-col gap-y-4">
		<!--标题-->
		<span class="text-text-title font-medium text-base">科技产品职能部门设置</span>
		<!--form表单-->
		<div class="rounded bg-[#f6f7fc] p-4 flex flex-col">
			<!--上-->
			<el-form :ref="(el: FormInstance) => formObject.formRef.value = el"
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
		<div v-if="false"
				 class="flex items-center gap-x-4">
			<el-button type="primary"
								 style="width: 80px;height: 32px;"
								 :disabled="true"
			>新增</el-button>
			<el-button type="danger"
								 plain
								 style="width: 80px;height: 32px;"
								 :disabled="tableObject.selectItemList.length === 0 || true"
								 @click="clickBatchDelete"
			>删除</el-button>
		</div>
		<!--表格-->
		<el-table :ref="(el: TableInstance) => tableObject.tableRef.value = el"
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
		<!--feedback交互组件-->
	</div>
</template>