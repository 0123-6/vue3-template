<script setup lang="ts">
import {useResetRef} from '@/util/hooks/useResetState.ts'
import {onMounted, onUnmounted, ref} from 'vue'
import {ableSelectFileByClick, ableSelectFileByDrag, type ISelectFileProps} from '@/util/file.ts'
import {ElMessage} from 'element-plus'
import {useBaseFetch} from '@/util/hooks/useBaseFetch.ts'
import {Delete, UploadFilled} from '@element-plus/icons-vue'
import {type IUserInfo} from '@views/system-manage/user-manage/userManageCommon.ts'
import {excelParse} from '@/util/excel.ts'

const emits = defineEmits(['ok', 'cancel'])

interface IFileAndData {
  file: File,
  list: IUserInfo[],
}

const [fileList] = useResetRef((): IFileAndData[] => [])

const fetchUploadFile = useBaseFetch({
  fetchOptionFn: () => ({
    url: 'user/addUserList',
    mockProd: true,
    data: {
      list: fileList.value.map(item => item.list).flat(),
    },
  }),
  transformResponseDataFn: () => {
    ElMessage.success('新增用户成功')
    emits('ok')
  },
})

const uploadFileRef = ref<HTMLDivElement>()
const selectFileObject: ISelectFileProps = {
  element: () => uploadFileRef.value!,
  accept: '.xls, .xlsx',
  maxSize: 10 * 1024 * 1024,
  multiple: true,
  callback: async (params) => {
    for (let i = 0; i < params.fileList.length; i++) {
      // 解析文件
      await excelParse({
        file: params.fileList[i],
        expectedKeyList: ['账号', '密码', '昵称', '性别', '手机号', '状态', '简介'],
        callback: (list: any[]) => {
          const newUserList: IUserInfo[] = []
          for (let j = 0; j < list.length; j++) {
            // 验证信息是否完整
            if (!(
              list[j]['账号'] != null
              && list[j]['密码'] != null
              && (list[j]['状态'] === '正常' || list[j]['状态'] === '禁用')
            )) {
              ElMessage({
                type: 'error',
                duration: 10000,
                message: `${params.fileList[i].name}数据不规范,导入失败`,
                showClose: true,
              })
              return
            }

            const newUser: IUserInfo = {
              account: list[j]['账号'] + '',
              password: list[j]['密码'] + '',
              nickname: list[j]['昵称'] ? list[j]['昵称'] + '' : undefined,
              sex: list[j]['性别'] ? (list[j]['性别'] === '男' ? 'man' : 'woman') : undefined,
              phone: list[j]['手机号'] ? list[j]['手机号'] + '' : undefined,
              status: list[j]['状态'] === '正常' ? 'normal' : 'disabled',
              description: list[j]['简介'] ? list[j]['简介'] + '' : undefined,
            }
            newUserList.push(newUser)
          }

          fileList.value.push({
            file: params.fileList[i],
            list: newUserList,
          })
        },
        callbackError: () => {
          ElMessage({
            type: 'error',
            duration: 10000,
            message: `${params.fileList[i].name}数据不规范,导入失败`,
            showClose: true,
          })
        },
      })
    }
  },
  callbackError: text => {
    ElMessage.error(text)
  },
}
const clearFnList: Function[] = []
onMounted(() => {
  const cancelFn1 = ableSelectFileByClick(selectFileObject)
  const cancelFn2 = ableSelectFileByDrag(selectFileObject)
  clearFnList.push(cancelFn1, cancelFn2)
})
onUnmounted(() => {
  clearFnList.forEach(item => item())
})

const clickOk = async () => {
  fetchUploadFile.doFetch()
}
const clickCancel = () => {
  emits('cancel')
}
</script>

<template>
  <div class="hpj mt-4 flex flex-col gap-y-4">
    <div
      ref="uploadFileRef"
      class="w-full h-[116px] relative border border-dotted border-[#dcdcdc] rounded-xl text-primary flex flex-col justify-center items-center gap-y-1"
      :class="['cursor-pointer hover:border-primary',]"
    >
      <el-icon :size="30">
        <UploadFilled />
      </el-icon>
      <div class="flex items-center gap-x-2">
        <span class="text-primary">点击上传</span>
        <span class="text-text">/</span>
        <span class="text-text">拖拽到此区域</span>
      </div>
      <span class="text-text-desc text-xs self-center">请上传Excel文件，大小在10M以内</span>
    </div>
    <a
      href="/用户列表模板.xlsx"
      download
      class="flex items-center gap-x-2 cursor-pointer group"
    >
      <img
        src="./icon/excel-png.png"
        alt=""
        style="width: 28px;height: 28px;"
      >
      <span class="text-sm group-hover:text-primary">下载模板</span>
    </a>
    <div class="flex items-center font-medium text-text-title">
      <span>已选择</span>
      <span class="px-1 text-primary font-bold">{{ fileList.length }}</span>
      <span>个文件</span>
    </div>
    <div
      v-scrollbar
      class="w-full h-[300px]"
    >
      <div class="w-full flex flex-col gap-y-4">
        <div
          v-for="(file, index) in fileList.map(item => item.file)"
          :key="index"
          class="w-full h-[88px] px-6 bg-[#f8f8f8] rounded flex justify-between items-center"
        >
          <div class="grow h-[40px] pr-6 flex items-center gap-x-3">
            <img
              src="./icon/excel-png.png"
              alt=""
            >
            <div class="grow h-[40px] flex flex-col justify-between">
              <span class="w-full line-clamp-1 break-all text-[#000000]">{{ file.name }}</span>
              <span class="text-text-desc text-xs">文件大小: {{ Number(file.size / 1024 / 1024).toFixed(2) }}M</span>
            </div>
          </div>
          <el-icon
            class="p-1 cursor-pointer hover:text-error"
            @click="fileList.splice(index, 1)"
          >
            <el-icon :size="14">
              <Delete />
            </el-icon>
          </el-icon>
        </div>
      </div>
    </div>
    <div class="flex justify-end items-center">
      <el-button
        style="width: 60px;"
        @click="clickCancel"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        :disabled="!fileList.length"
        :loading="fetchUploadFile.isFetching"
        style="margin-left: 8px;width: 88px;"
        @click="clickOk"
      >
        {{ !fetchUploadFile.isFetching ? '确认上传' : '上传中' }}
      </el-button>
    </div>
  </div>
</template>




































