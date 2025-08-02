<script setup lang="ts">
import {useElForm} from '@/components/base-form/useElForm.ts'
import {useElTable} from '@/components/base-table/useElTable.ts'
import BaseFormItemList from '@/components/base-form/BaseFormItemList.vue'
import BaseFormFold from '@/components/base-form/BaseFormFold.vue'
import {RefreshRight, Search} from '@element-plus/icons-vue'
import BaseTableColumnList from '@/components/base-table/BaseTableColumnList.vue'
import TableNoData from '@/components/base-table/TableNoData.vue'
import {useResetRef} from '@/util/hooks/useResetState.ts'
import {useElFeedback} from '@/components/base-dialog/useElFeedback.ts'
import {
  getUserAccountListSelectObject, onlineSelectObject,
  sexList,
  userStatusList,
} from '@views/system-manage/user-manage/userManageCommon.ts'
import UserManageAddAndEditDrawer from '@views/system-manage/user-manage/UserManageAddAndEditDrawer.vue'
import {useRenderComp} from '@/components/base-dialog/useRenderComp.ts'
import PromptDialog from '@/components/base-dialog/PromptDialog.vue'
import {IPromptDialog} from '@/components/base-dialog/PromptDialogInterface.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {ElMessage, FormInstance, TableInstance} from 'element-plus'
import {useUserStore} from '@/plugin/pinia.ts'
import {excelExport} from '@/util/excel.ts'
import UserManageUploadDialog from '@views/system-manage/user-manage/UserManageUploadDialog.vue'

// 表格部分
const formObject = useElForm({
  list: [
    {
      label: '账号',
      prop: 'account',
      type: 'select',
      selectObject: getUserAccountListSelectObject,
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
      label: '是否在线',
      prop: 'isOnline',
      type: 'select',
      selectObject: onlineSelectObject,
    },
    {
      label: '简介',
      prop: 'description',
      type: 'input',
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
      fixed: 'left',
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
      label: '是否在线',
      prop: 'isOnline',
      width: 120,
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
      label: '最新活跃时间',
      prop: 'lastActiveTime',
      width: 160,
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
const clickBatchDelete = () => {
  tableObject.resetType('batch')
  renderDeleteDialog()
}
const renderDeleteDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
  width: 500,
  title: '删除用户',
  textList: tableObject.type === 'single'
    ? ['确定删除', {text: tableObject.selectItem.account as string, color: 'primary'}, '吗?']
    : ['确定批量删除', {text: tableObject.selectItemList.length, color: 'primary'}, '个账号吗?'],
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
        : tableObject.selectItemList.map(item => item.account),
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('删除成功')
    formObject.reset({
      account: undefined,
    })
    tableObject.reset('pageNum')
    tableObject.doFetch()
    getUserAccountListSelectObject.doFetch()
  },
})

// 导入
const clickBatchImport = () => {
  uploadFileDialogObject.isShow = true
}
const uploadFileDialogObject = useElFeedback({
  okHook: clickSearch,
})

// 导出
const clickBatchExport = () => {
  tableObject.resetType('batch')
  renderExportDialog()
}
const renderExportDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
  text: '确认导出当前页面数据吗?',
  okButton: {
    text: '导出',
    fetchText: '导出中',
    type: 'success',
  },
  dialogObject: exportDialogObject,
}))
const exportDialogObject = useElFeedback({
  okHook: () => {
    try {
      excelExport({
        fileName: '用户管理列表',
        data: tableObject.data.list,
        callback() {
          ElMessage.success('导出成功')
        },
        callbackError(text) {
          ElMessage.error(text)
        },
      })
    } catch (error) {
      ElMessage.error('导出失败', error)
    }
  },
})

// 改变状态
const clickSingleChangeStatusButton = (item: any) => {
  tableObject.resetType(item)
  renderChangeStatusDialog()
}
const renderChangeStatusDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
  width: 500,
  title: `${tableObject.selectItem.status === 'normal' ? '停用' : '启用'}账号`,
  textList: [
    '确定',
    tableObject.selectItem.status === 'normal' ? '停用' : '启用',
    {
      text: tableObject.selectItem.account as string,
      color: 'primary',
    },
    '账号吗?',
  ],
  okButton: {
    text: tableObject.selectItem.status === 'normal' ? '停用' : '启用',
    fetchText: tableObject.selectItem.status === 'normal' ? '停用中' : '启用中',
  },
  fetchObject: fetchChangeStatusObject,
}))
const fetchChangeStatusObject = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'user/editUser',
    mockProd: true,
    data: {
      ...tableObject.selectItem,
      status: tableObject.selectItem.status === 'normal' ? 'disabled' : 'normal',
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success(`${tableObject.selectItem.status === 'normal' ? '停用' : '启用'}账号成功`)
    tableObject.selectItem.status = tableObject.selectItem.status === 'normal' ? 'disabled' : 'normal'
  },
})

// 改变其它账号在线状态
const clickSingleChangeIsOnlineButton = (item: any) => {
  tableObject.resetType(item)
  renderChangeIsOnlineDialog()
}
const renderChangeIsOnlineDialog = useRenderComp(PromptDialog, (): IPromptDialog => ({
  width: 500,
  title: '下线账号',
  textList: [
    '确定下线',
    {
      text: tableObject.selectItem.account as string,
      color: 'primary',
    },
    '账号吗?',
  ],
  okButton: {
    text: '下线',
    fetchText: '下线中',
  },
  fetchObject: fetchChangeIsOnlineObject,
}))
const fetchChangeIsOnlineObject = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'user/logout',
    mockProd: true,
    data: {
      accountList: [tableObject.selectItem.account],
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('下线成功')
    tableObject.selectItem.isOnline = false
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
      <el-form
        :ref="(el: FormInstance) => formObject.formRef.value = el"
        :model="formObject.data"
        inline
        label-position="right"
        :label-width="120"
        :scroll-to-error="true"
        style="width: 100%;"
        class="grid grid-cols-4"
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
        v-if="true"
        type="danger"
        plain
        :disabled="!(tableObject.selectItemList.length
          && tableObject.selectItemList.every(item => item.account !== useUserStore().user.account))"
        @click="clickBatchDelete"
      >
        批量删除
      </el-button>
      <el-button
        v-if="true"
        type="primary"
        @click="clickBatchImport"
      >
        批量导入
      </el-button>
      <el-button
        v-if="true"
        type="success"
        :disabled="tableObject.data.total === 0"
        @click="clickBatchExport"
      >
        批量导出
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
      <base-table-column-list :list="tableObject.list">
        <template #status="scope">
          <el-switch
            v-if="scope.row.status === 'normal' || scope.row.status === 'disabled'"
            active-value="normal"
            inactive-value="disabled"
            :width="36"
            :model-value="scope.row.status"
            @click="clickSingleChangeStatusButton(scope.row)"
          />
        </template>
        <template #isOnline="scope">
          <el-switch
            v-if="scope.row.isOnline === true || scope.row.isOnline === false"
            :active-value="true"
            :inactive-value="false"
            :width="36"
            :model-value="scope.row.isOnline"
            :disabled="!scope.row.isOnline"
            @click="scope.row.isOnline ? clickSingleChangeIsOnlineButton(scope.row) : undefined"
          />
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
        @change="tableObject.doFetch"
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
      <UserManageAddAndEditDrawer
        :props="{
          isAddOrEdit,
          item: tableObject.selectItem,
        }"
        @ok="drawerObject.onOk"
        @cancel="drawerObject.onCancel"
      />
    </el-drawer>
    <el-dialog
      v-model="uploadFileDialogObject.isShow"
      title="上传文件"
      width="560"
      :close-on-click-modal="true"
      :close-on-press-escape="false"
      :draggable="true"
      :align-center="true"
      :destroy-on-close="true"
      modal-class="hpj"
      @close="uploadFileDialogObject.onCancel"
    >
      <UserManageUploadDialog
        :props="{}"
        @ok="uploadFileDialogObject.onOk"
        @cancel="uploadFileDialogObject.onCancel"
      />
    </el-dialog>
  </div>
</template>























































