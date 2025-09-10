<script setup lang="ts">
import {allRoleListSelectObject, type IRole} from '@views/system-manage/role-manage/roleManageCommon.ts'
import {useElForm} from '@/components/base-form/useElForm.ts'
import {ref} from 'vue'
import {ElMessage, type FormInstance, type TreeInstance} from 'element-plus'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {allPermissionListSelectObject} from '@views/system-manage/permission-manage/permissionManageCommon.ts'
import BaseFormItemList from '@/components/base-form/BaseFormItemList.vue'
import BaseTitle from '@/components/base-drawer/BaseTitle.vue'
import BaseDrawerComp from '@/components/base-drawer/BaseDrawerComp.vue'

interface IProps {
  isAddOrEdit: 'add' | 'edit',
  item: IRole,
}
const props = defineProps<IProps>()
const emits = defineEmits(['ok', 'cancel'])

// 表单
const formObject = useElForm<IRole>({
  list: [
    {
      label: '角色名称',
      prop: 'name',
      type: 'input',
      required: true,
      disabled: props.isAddOrEdit === 'edit',
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
const treeInstance = ref<TreeInstance>()
// 新增和编辑的初始化
if (props.isAddOrEdit === 'edit' && props.item) {
  formObject.reset({
    name: props.item.name,
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
    url: 'role/add',
    mockProd: true,
    data: {
      ...formObject.data,
      permissionList: treeInstance.value.getCheckedKeys(),
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('新增角色成功')
    allRoleListSelectObject.doFetch()
    emits('ok')
  },
})
const fetchUpdate = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'role/update',
    mockProd: true,
    data: {
      ...formObject.data,
      permissionList: treeInstance.value.getCheckedKeys(),
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('更新角色成功')
    allRoleListSelectObject.doFetch()
    emits('ok')
  },
})
</script>

<template>
  <base-drawer-comp>
    <template #default>
      <base-title title="角色信息" />
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
      <div
        class="w-full flex"
      >
        <span class="w-[90px] pr-3 text-right text-sm text-text-title">权限信息</span>
        <el-tree
          :ref="(el: TreeInstance) => treeInstance = el"
          :data="allPermissionListSelectObject.data"
          default-expand-all
          node-key="value"
          show-checkbox
          check-strictly
          :default-checked-keys="props.item?.permissionList"
          class="grow"
        />
      </div>
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