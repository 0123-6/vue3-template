<script setup lang="ts">
import {useElForm} from '@/components/base-form/useElForm.ts'
import {
  allPermissionListSelectObject,
  IPermission,
} from '@views/system-manage/permission-manage/permissionManageCommon.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {ElMessage, FormInstance} from 'element-plus'
import BaseDrawerComp from '@/components/base-drawer/BaseDrawerComp.vue'
import BaseFormItemList from '@/components/base-form/BaseFormItemList.vue'
import BaseTitle from '@/components/base-drawer/BaseTitle.vue'

interface IProps {
  isAddOrEdit: 'add' | 'edit',
  item: IPermission,
}
const props = defineProps<IProps>()
const emits = defineEmits(['ok', 'cancel'])

const formObject = useElForm({
  list: [
    {
      label: '权限名称',
      prop: 'name',
      type: 'input',
      selectObject: undefined,
      multiple: undefined,
      required: true,
      disabled: props.isAddOrEdit === 'edit',
      hidden: undefined,
    },
    {
      label: '上级权限',
      prop: 'parent',
      type: 'tree',
      selectObject: allPermissionListSelectObject,
      multiple: false,
      required: undefined,
      disabled: undefined,
      hidden: undefined,
    },
    {
      label: '权限描述',
      prop: 'description',
      type: 'textarea',
      selectObject: undefined,
      multiple: undefined,
      required: undefined,
      disabled: undefined,
      hidden: undefined,
      rows: 3,
      maxLength: 300,
    },
  ],
})

// 新增和编辑的初始化
if (props.isAddOrEdit === 'edit') {
  formObject.reset({
    name: props.item.name,
    parent: props.item.parent,
    description: props.item.description,
  })
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
    url: 'permission/add',
    mockProd: true,
    data: formObject.data,
  }),
  transformResponseDataFn: () => {
    ElMessage.success('新增权限成功')
    allPermissionListSelectObject.doFetch()
    emits('ok')
  },
})
const fetchUpdate = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'permission/update',
    mockProd: true,
    data: formObject.data,
  }),
  transformResponseDataFn: () => {
    ElMessage.success('更新权限成功')
    allPermissionListSelectObject.doFetch()
    emits('ok')
  },
})
</script>

<template>
  <base-drawer-comp>
    <template #default>
      <base-title title="权限信息" />
      <el-form
        :ref="(el: FormInstance) => formObject.formRef.value = el"
        :model="formObject.data"
        label-position="right"
        :label-width="90"
        :scroll-to-error="true"
        style="width: 100%;"
        class="mt-4 w-full grid grid-cols-1 gap-y-1"
      >
        <base-form-item-list :form-object="formObject" />
      </el-form>
    </template>
    <template #footer>
      <el-button
        style="width: 80px;"
        @click="clickCancel"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        style="margin-left: 16px;width: 80px;"
        :loading="props.isAddOrEdit === 'add' ? fetchAdd.isFetching : fetchUpdate.isFetching"
        @click="clickOk"
      >
        {{ props.isAddOrEdit === 'add' ? '新增' : '更新' }}
      </el-button>
    </template>
  </base-drawer-comp>
</template>