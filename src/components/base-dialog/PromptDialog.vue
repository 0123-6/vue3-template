<script setup lang="ts">
import {IUseElFeedbackReturn, useElFeedback} from "@/components/base-dialog/useElFeedback.ts";
import {ElDialog, ElButton} from 'element-plus';
import {
	IPromptDialog,
	IPromptDialogOkButton,
	IPromptDialogTextItem
} from "@/components/base-dialog/PromptDialogInterface.ts";

const styleMap = {
	default: '#646464',
	primary: '#3D6FE2',
	success: '#3AC295',
	warning: '#F89741',
	error: '#E34D59',
	text: '#333333',
	desc: '#979797',
}

let {
	title = '提示',
	width = 400,
	text = undefined,
	textList = [] as (string | number | IPromptDialogTextItem)[],
	okButton = {} as IPromptDialogOkButton,
	cancel,
	fetchObject,
	dialogObject = useElFeedback() as IUseElFeedbackReturn,
} = defineProps<IPromptDialog>()
// 初始化text和textList
if (text && textList.length
	|| !text && (textList.length === 0)) {
	if (import.meta.env.DEV) {
		alert('PromptDialog组件： text和textList需要有且只有1项')
	}
	console.error('PromptDialog组件： text和textList需要有且只有1项')
}
if (text) {
	textList.push(text)
} else {
	// 啥都不用做
}
// 初始化okButton
okButton.type = okButton.type ?? 'primary'
okButton.plain = okButton.plain ?? false
okButton.width = okButton.width ?? 88
okButton.text = okButton.text ?? '确定'
okButton.fetchText = okButton.fetchText ?? '确定'

dialogObject.isShow = true

const clickOk = async () => {
	if (fetchObject) {
		const isOk = await fetchObject.doFetch()
		if (!isOk) {
			return
		}
		dialogObject.onOk()
	} else {
		dialogObject.onOk()
	}
}
</script>

<template>
	<el-dialog v-model="dialogObject.isShow"
						 :title="title"
						 :width="width"
						 :close-on-click-modal="true"
						 :close-on-press-escape="false"
						 :draggable="true"
						 :align-center="true"
						 :destroy-on-close="true"
						 @close="dialogObject.onCancel"
						 @closed="cancel"
						 modal-class="hpj"
	>
		<div class="flex flex-col gap-y-4">
			<!--文本-->
			<div class="w-full">
				<span v-for="(item, index) in textList"
							:key="index"
							class="text-text break-all"
							:style="{
								color: typeof item === 'object' ? (styleMap[item.color] ?? styleMap['default']) : styleMap['default'],
								fontWeight: (typeof item !== 'object' || item.color === 'default') ? 400: 600,
							}"
				>{{typeof item === 'object' ? ` ${item.text} ` : item}}</span>
			</div>
			<!--按钮-->
			<div class="flex justify-end items-center">
				<el-button style="width: 60px;"
									 @click="dialogObject.onCancel"
				>取消</el-button>
				<el-button :type="okButton.type"
									 style="margin-left: 8px;"
									 :style="{
										 width: okButton.width + 'px',
									 }"
									 :loading="fetchObject?.isFetching"
									 @click="clickOk"
				>{{!fetchObject?.isFetching ? okButton.text : (okButton.fetchText ?? okButton.text)}}</el-button>
			</div>
		</div>
	</el-dialog>
</template>