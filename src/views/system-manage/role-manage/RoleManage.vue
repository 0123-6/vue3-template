<script setup lang="ts">
import {useElForm} from '@/components/base-form/useElForm.ts'
import {allRoleListSelectObject, type IRole} from '@views/system-manage/role-manage/roleManageCommon.ts'
import {useElTable} from '@/components/base-table/useElTable.ts'
import {allPermissionListSelectObject} from '@views/system-manage/permission-manage/permissionManageCommon.ts'
import {useResetRef} from '@/util/hooks/useResetState.ts'
import {useElFeedback} from '@/components/base-dialog/useElFeedback.ts'
import {useRenderComp} from '@/components/base-dialog/useRenderComp.ts'
import PromptDialog from '@/components/base-dialog/PromptDialog.vue'
import {type IPromptDialog} from '@/components/base-dialog/PromptDialogInterface.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {ElMessage, type FormInstance, type TableInstance} from 'element-plus'
import {RefreshRight, Search} from '@element-plus/icons-vue'
import BaseFormItemList from '@/components/base-form/BaseFormItemList.vue'
import TableNoData from '@/components/base-table/TableNoData.vue'
import BaseTableColumnList from '@/components/base-table/BaseTableColumnList.vue'
import BaseFormFold from '@/components/base-form/BaseFormFold.vue'
import RoleManageAddAndEditDrawer from '@views/system-manage/role-manage/RoleManageAddAndEditDrawer.vue'

// 表格部分
const formObject = useElForm({
  list: [
    {
      label: '角色名称',
      prop: 'name',
      type: 'select',
      selectObject: allRoleListSelectObject,
    },
    {
      label: '权限名称',
      prop: 'permissionList',
      type: 'tree',
      selectObject: allPermissionListSelectObject,
    },
    {
      label: '简介',
      prop: 'description',
      type: 'input',
    },
  ],
  foldNumber: 3,
})

// 表格部分
const tableObject = useElTable<IRole>({
  formObject,
  fetchOptionFn: () => ({
    url: 'role/query',
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
      label: '角色名称',
      prop: 'name',
      width: 150,
      fixed: 'left',
    },
    {
      label: '简介',
      prop: 'description',
      minWidth: 400,
    },
    {
      label: '创建时间',
      prop: 'createTime',
      width: 160,
    },
    {
      label: '最后修改时间',
      prop: 'lastChangeTime',
      width: 160,
    },
    {
      label: '操作',
      operatorList: [
        {
          text: '编辑',
          type: 'primary',
          onClick: (item) => {
            tableObject.resetType(item)
            isAddOrEdit.value = 'edit'
            drawerObject.isShow = true
          },
        },
        {
          text: '删除',
          type: 'error',
          onClick: (item) => {
            tableObject.resetType(item)
            renderDeleteDialog()
          },
          disabled: () => false,
          hidden: false,
        },
      ],
    },
  ],
})
const clickSearch = async () => {
  if (!await formObject.validate()) {
    return
  }
  tableObject.reset()
  tableObject.doFetch()
}
const clickReset = () => {
  formObject.reset()
  tableObject.reset()
  tableObject.doFetch()
}

// 新增和编辑
const [isAddOrEdit, resetIsAddOrEdit] = useResetRef((): 'add' | 'edit' => 'add')
const clickBatchAdd = () => {
  tableObject.resetType('batch')
  isAddOrEdit.value = 'add'
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
  title: '删除角色',
  textList: tableObject.type === 'single'
    ? ['确定删除', {text: tableObject.selectItem.name as string, color: 'primary'}, '吗?']
    : ['确定批量删除', {text: tableObject.selectItemList.length, color: 'primary'}, '个角色吗?'],
  okButton: {
    text: '确定删除',
    fetchText: '删除中',
    type: 'danger',
  },
  fetchObject: fetchDeleteObject,
}))
const fetchDeleteObject = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'role/delete',
    mockProd: true,
    data: {
      roleList: tableObject.type === 'single'
        ? [tableObject.selectItem.name]
        : tableObject.selectItemList.map(item => item.name),
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('删除成功')
    formObject.reset({
      name: undefined,
    })
    tableObject.reset('pageNum')
    tableObject.doFetch()
    allRoleListSelectObject.doFetch()
  },
})
</script>

<template>
  <div class="hpj w-full grow rounded bg-white p-4 flex flex-col gap-y-4">
    <!--标题-->
    <span class="text-text-title font-medium text-base">角色管理</span>
    <!--form表单-->
    <div class="rounded bg-[#f6f7fc] p-4 flex flex-col">
      <!--上-->
      <el-form
        :ref="(el: FormInstance) => formObject.formRef.value = el"
        :model="formObject.data"
        inline
        label-position="right"
        :label-width="120"
        :scroll-to-error="true"
        style="width: 100%;"
        class="grid grid-cols-3"
      >
        <base-form-item-list
          :form-object="formObject"
          @change="clickSearch"
        />
      </el-form>
      <!--下-->
      <div class="ml-[120px] flex items-center gap-x-4">
        <el-button
          type="primary"
          :icon="Search"
          @click="clickSearch"
        >
          查询
        </el-button>
        <el-button
          :icon="RefreshRight"
          @click="clickReset"
        >
          重置
        </el-button>
        <base-form-fold :form-object="formObject" />
      </div>
    </div>
    <!--操作行-->
    <div class="flex items-center gap-x-4">
      <el-button
        type="primary"
        @click="clickBatchAdd"
      >
        新增
      </el-button>
      <el-button
        type="danger"
        plain
        :disabled="!tableObject.selectItemList.length"
        @click="clickBatchDelete"
      >
        批量删除
      </el-button>
    </div>
    <!--表格-->
    <el-table
      :ref="(el: TableInstance) => tableObject.tableRef.value = el"
      v-loading="tableObject.isFetching"
      :data="tableObject.data.list"
      stripe
      :row-style="{height: `${tableObject.rowHeight}px!important`,}"
      @selection-change="tableObject.resetSelectItemList($event)"
      @sort-change="tableObject.changeSort"
    >
      <base-table-column-list :list="tableObject.list" />
      <template #empty>
        <TableNoData />
      </template>
    </el-table>
    <!--总条数 + 分页器-->
    <div class="h-[32px] flex justify-between items-center">
      <span class="text-text">共 {{ tableObject.data.total }} 项数据</span>
      <el-pagination
        v-model:current-page="tableObject.params.pageNum"
        v-model:page-size="tableObject.params.pageSize"
        layout="sizes, prev, pager, next, jumper, ->"
        size="default"
        :background="true"
        :total="tableObject.data.total"
        :page-sizes="tableObject.pageSizeList"
      />
    </div>
    <!--feedback组件-->
    <el-drawer
      v-model="drawerObject.isShow"
      :append-to-body="true"
      :title="isAddOrEdit === 'add' ? '新增' : '编辑'"
      :close-on-click-modal="true"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      :size="500"
      modal-class="hpj"
      @close="drawerObject.onCancel"
    >
      <RoleManageAddAndEditDrawer
        :is-add-or-edit="isAddOrEdit"
        :item="tableObject.selectItem"
        @ok="drawerObject.onOk"
        @cancel="drawerObject.onCancel"
      />
    </el-drawer>
  </div>
</template>