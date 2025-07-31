<script setup lang="ts">
import {useElForm} from '@/components/base-form/useElForm.ts'
import {isPasswordRegExp, isPhoneRegExp} from '@/util/validator.ts'
import {
  allPermissionList,
  getUserAccountListSelectObject,
  sexList,
  userStatusList,
} from '@views/system-manage/user-manage/userManageCommon.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {ElMessage, FormInstance} from 'element-plus'
import BaseDrawerComp from '@/components/base-drawer/BaseDrawerComp.vue'
import BaseTitle from '@/components/base-drawer/BaseTitle.vue'
import BaseFormItemList from '@/components/base-form/BaseFormItemList.vue'
import {useUserStore} from '@/plugin/pinia.ts'

interface IProps {
  props: {
    isAddOrEdit: 'add' | 'edit',
    item: any,
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
      disabled: props.isAddOrEdit === 'edit',
    },
    {
      label: '密码',
      prop: 'password',
      placeholder: '请输入密码，只能包含数字，字母，下划线，8-16位',
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
      hidden: props.isAddOrEdit === 'edit',
    },
    {
      label: '确认密码',
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
      hidden: props.isAddOrEdit === 'edit',
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
      label: '状态',
      prop: 'status',
      type: 'radio',
      multiple: false,
      selectObject: userStatusList,
      required: true,
      // 不允许修改当前用户自己的状态
      disabled: props.isAddOrEdit === 'edit' && props.item.account === useUserStore().user.account,
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

// 新增和编辑的初始化
if (props.isAddOrEdit === 'add') {
  formObject.reset({
    status: 'normal',
  })
} else {
  formObject.reset({
    account: props.item.account,
    nickname: props.item.nickname,
    sex: props.item.sex,
    phone: props.item.phone,
    status: props.item.status,
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
    url: 'user/addUser',
    mockProd: true,
    data: formObject.data,
  }),
  transformResponseDataFn: () => {
    ElMessage.success('新增用户成功')
    getUserAccountListSelectObject.doFetch()
    emits('ok')
  },
})
const fetchUpdate = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'user/editUser',
    mockProd: true,
    data: formObject.data,
  }),
  transformResponseDataFn: () => {
    ElMessage.success('更新用户成功')
    emits('ok')
  },
})
</script>

<template>
  <base-drawer-comp>
    <template #default>
      <base-title title="用户信息" />
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
      <el-tree
        :data="allPermissionList"
        node-key="name"
        :props="{label: 'name',}"
        default-expand-all
        show-checkbox
        :default-checked-keys="props.item?.permissionList"
      />
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











































