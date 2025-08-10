<script setup lang="ts">
// 表格部分
import {useElTable} from '@/components/base-table/useElTable.ts'
import {useRenderComp} from '@/components/base-dialog/useRenderComp.ts'
import PromptDialog from '@/components/base-dialog/PromptDialog.vue'
import {IPromptDialog} from '@/components/base-dialog/PromptDialogInterface.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {ElMessage, TableInstance} from 'element-plus'
import {Search} from '@element-plus/icons-vue'
import BaseTableColumnList from '@/components/base-table/BaseTableColumnList.vue'
import TableNoData from '@/components/base-table/TableNoData.vue'
import BaseSpanTooltip from '@/components/base-span-tooltip/BaseSpanTooltip.vue'
import {useResetRef} from '@/util/hooks/useResetState.ts'
import {useElFeedback} from '@/components/base-dialog/useElFeedback.ts'
import PermissionManageAddAndEditDrawer
  from '@views/system-manage/permission-manage/PermissionManageAddAndEditDrawer.vue'
import {IPermission} from '@views/system-manage/user-manage/userManageCommon.ts'

const tableObject = useElTable<IPermission>({
  fetchOptionFn: () => ({
    url: 'getPermissionList',
    mockProd: true,
  }),
  rowHeight: 30,
  list: [
    {
      label: '权限名称',
      prop: 'name',
      width: 200,
      align: 'left',
    },
    {
      label: '权限描述',
      prop: 'description',
      minWidth: 200,
    },
    {
      label: '创建时间',
      prop: 'createTime',
      width: 160,
    },
    {
      label: '更新时间',
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
            resetIsAddOrEdit('edit')
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
          disabled: item => !!item.children?.length,
          hidden: false,
        },
      ],
    },
  ],
})
const clickSearch = async () => {
  tableObject.reset()
  tableObject.doFetch()
}

// 新增和编辑
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
const renderDeleteDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
  width: 500,
  title: '删除权限',
  textList: tableObject.type === 'single'
    ? ['确定删除', {text: tableObject.selectItem.name as string, color: 'primary'}, '吗?']
    : ['确定批量删除', {text: tableObject.selectItemList.length, color: 'primary'}, '个权限吗?'],
  okButton: {
    text: '确定删除',
    fetchText: '删除中',
    type: 'danger',
  },
  fetchObject: fetchDeleteObject,
}))
const fetchDeleteObject = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'permission/delete',
    mockProd: true,
    data: {
      name: tableObject.selectItem.name,
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
    <span class="text-text-title font-medium text-base">权限管理</span>
    <!--form表单-->
    <div class="rounded bg-[#f6f7fc] p-4 flex flex-col">
      <!--下-->
      <div class="ml-[0px] flex items-center gap-x-4">
        <el-button
          type="primary"
          :icon="Search"
          @click="clickSearch"
        >
          查询
        </el-button>
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
    </div>
    <!--表格-->
    <el-table
      :ref="(el: TableInstance) => tableObject.tableRef.value = el"
      v-loading="tableObject.isFetching"
      :data="tableObject.data.list"
      stripe
      :row-style="{height: `${tableObject.rowHeight}px!important`,}"
      row-key="name"
      @selection-change="tableObject.resetSelectItemList($event)"
      @sort-change="tableObject.changeSort"
    >
      <base-table-column-list :list="tableObject.list">
        <template #name="scope">
          <BaseSpanTooltip :text="scope.row.name" />
        </template>
      </base-table-column-list>
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
      <PermissionManageAddAndEditDrawer
        :is-add-or-edit="isAddOrEdit"
        :item="tableObject.selectItem"
        @ok="drawerObject.onOk"
        @cancel="drawerObject.onCancel"
      />
    </el-drawer>
  </div>
</template>

<style scoped>

</style>