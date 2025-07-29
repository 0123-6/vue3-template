<script setup lang="ts">
import {ElMessage, FormInstance} from 'element-plus'
import {isPhoneRegExp, isVerificationCodeRegExp} from '@/util/validator.ts'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import router from '@/plugin/vue-router.ts'
import {useElForm} from '@/components/base-form/useElForm.ts'
import {useCountdown} from '@/components/base-form/useCountdown.ts'
import BaseFormItemList from '@/components/base-form/BaseFormItemList.vue'

const formObject = useElForm({
  list: [
    {
      label: '手机号码',
      hiddenLabel: true,
      prop: 'phone',
      type: 'input',
      required: true,
      rules: {
        pattern: isPhoneRegExp,
        trigger: 'change',
        message: '手机格式不正确',
      },
    },
    {
      label: '验证码',
      hiddenLabel: true,
      prop: 'code',
      type: 'input',
      required: true,
      rules: {
        pattern: isVerificationCodeRegExp,
        trigger: 'change',
        message: '验证码格式不正确',
      },
    },
  ],
})
const fetchLogin = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'mock_',
    data: formObject.data,
  }),
  transformResponseDataFn: () => {
    ElMessage.success('登录成功')
    router.replace('/')
  },
})
const countdownObject = useCountdown()
const fetchSendCode = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'mock_',
    data: {
      phone: formObject.data.phone,
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('发送成功')
    countdownObject.begin()
  },
})
const clickSendCode = async () => {
  if (!await formObject.validate(['phone'])) {
    return
  }
  fetchSendCode.doFetch()
}
const clickLogin = async () => {
  if (!await formObject.validate()) {
    return
  }
  fetchLogin.doFetch()
}
const clickReturn = () => {
  router.replace('/auth/login')
}
</script>

<template>
  <div class="hpj w-[640px] h-[470px] px-[100px] py-[64px] bg-white shadow-2xl rounded-3xl flex flex-col">
    <span class="text-text-title font-bold text-[36px] leading-[36px]">欢迎回来 📲 </span>
    <span class="mt-4 text-text ">请输入您的手机号码以开始管理您的项目</span>
    <el-form
      :ref="(el: FormInstance) => formObject.formRef.value = el"
      :model="formObject.data"
      label-position="right"
      :label-width="0"
      :scroll-to-error="true"
      style="width: 100%;"
      class="mt-6 flex flex-col gap-y-2"
      hide-required-asterisk
      size="large"
    >
      <base-form-item-list
        :form-object="formObject"
        :range="[0, 1]"
      />
      <div class="w-full flex justify-between items-center gap-x-4">
        <base-form-item-list
          :form-object="formObject"
          :range="[1]"
        />
        <el-button
          style="width: 200px;height: 40px;"
          class="self-start text-text-title"
          :loading="fetchSendCode.isFetching"
          :disabled="countdownObject.isRunning"
          @click="clickSendCode"
        >
          {{ !countdownObject.isRunning ? '获取验证码' : `${countdownObject.countdown}秒后重新获取` }}
        </el-button>
      </div>
    </el-form>
    <el-button
      class="mt-5"
      type="primary"
      size="large"
      :loading="fetchLogin.isFetching"
      @click="clickLogin"
    >
      {{ !fetchLogin.isFetching ? '登录' : '登录中' }}
    </el-button>
    <el-button
      class="mt-5"
      size="large"
      @click="clickReturn"
    >
      返回
    </el-button>
  </div>
</template>








































