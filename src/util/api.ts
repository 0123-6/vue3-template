import {goLoginPage} from "@/util/env";
import errorMessage from "@/util/errorMessage.ts";
import {exportFile} from "@/util/file";
import {ElMessage} from "element-plus";
import {projectConfig} from "../../project.config.ts";
import {isFalse} from "@/util/validator.ts";

// 防抖函数
export function debounce(fn: () => void, delay: number = 1000) {
	let timer: ReturnType<typeof setTimeout> | null = null

	return function () {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
		timer = setTimeout(() => {
			// @ts-ignore
			fn.apply(this, arguments)
			clearTimeout(timer!)
			timer = null
		}, delay)
	}
}

// 节流函数
export function throttle(fn: () => void, delay: number = 1000) {
	let timer: ReturnType<typeof setTimeout> | null = null

	return function () {
		if (!timer) {
			// @ts-ignore
			fn.apply(this, arguments)
			timer = setTimeout(() => {
				clearTimeout(timer!)
				timer = null
			}, delay)
		}
	}
}

export interface IBaseFetch {
	// 前端mock Url
	mockUrl?: string,
	// mock专用请求属性
	mockObject?: Record<string, any>,
	// 开发环境直接访问后端接口
	mockProd?: boolean,

	prefix?: string,
	url: string,

	method?: 'get' | 'post',
	headers?: Record<string, string>,
	signal?: AbortSignal,

	data?: Record<string, any>,
	isJson?: boolean,
	isFormData?: boolean,

	// 返回的是不是文件流
	isFile?: boolean,

	// 是否有接口权限
	permission?: boolean | (() => boolean),
}

interface IResponseData {
	// 正常情况下为200
	code: number
	// 描述信息
	msg?: string
	message?: string
	// 真正的数据
	data: Record<string, any>
}

interface IBaseFetchReturn {
	// 是否成功
	isOk: boolean,
	// 失败原因
	reason?: string,
	// 返回数据
	responseData?: IResponseData,
}

// 没有超时功能
// 没有重试机制
export async function baseFetch(props: IBaseFetch)
	: Promise<IBaseFetchReturn> {
	let {
		mockUrl = '',
		mockObject = undefined,
		mockProd = false,

		prefix = projectConfig.apiPrefix.DEFAULT,
		url,

		method = projectConfig.fetchDefaultMethod,
		headers = {},
		signal,

		data,
		isJson = true,
		isFormData = false,
		isFile = false,

		permission = true,
	} = props
	if (isFormData) {
		isJson = false
	}
	let body: string | object | undefined = undefined
	const isFetchProd = import.meta.env.PROD || mockProd
	if (!url) {
		ElMessage.error("url不可以为'',请设置初始值为'mock_'")
		return {
			isOk: false,
		}
	}
	// 保证修改完全
	if (url.startsWith('/') || mockUrl.startsWith('/')) {
		ElMessage.error('请检查url或mockUrl,不能以/开头')
		return {
			isOk: false,
		}
	}
	if (isFalse(permission)) {
		return {
			isOk: false,
		}
	}
	// 特殊处理/mock
	if (!isFetchProd && mockObject) {
		data = {
			...data,
			mockObject,
		}
	}

	// 设置data属性和content-type
	if (data) {
		if (method === 'get') {
			url += `?${new URLSearchParams(data).toString()}`
		} else if (method === 'post') {
			if (isJson) {
				body = JSON.stringify(data)
				headers = {
					...headers,
					// 小写即可
					'content-type': 'application/json',
				}
			} else if (isFormData) {
				const formData = new FormData()
				for (const [key, value] of Object.entries(data)) {
					formData.set(key, value)
				}
				body = formData
			} else {
				// 不是json，比如FormData
				body = data
			}
		}
	}

	try {
		const resource = isFetchProd ? (prefix + url) : ('/mock/' + mockUrl)
		// 添加前缀，通过代理方式解决跨域报错
		// @ts-ignore
		const response = await fetch(resource, {
			method,
			headers,
			// @ts-ignore
			body,
			signal,
		})

		// 接口无效或服务器错误
		if (!response.ok) {
			errorMessage('api请求失败：' + response.status + ' 接口无效或服务器错误')
			return {
				isOk: false,
			}
		}

		// 如果是json格式
		const contentType = response.headers.get('Content-Type')
		if (contentType && contentType.includes('application/json')) {
			// 格式为{code:'',msg:'',data: object}
			const responseData: IResponseData = await response.json()
			// 正常情况为fetchApiResponseCodeMap.success数组的一个
			if (!projectConfig.fetchApiResponseCodeMap.success.includes(responseData.code)) {
				errorMessage(responseData.msg || responseData.message || `${url}接口异常`)
				// 账号超时，需要重新登录
				if (projectConfig.fetchApiResponseCodeMap.notLogin.includes(responseData.code)) {
					goLoginPage()
				}
				return {
					isOk: false,
				}
			} else if (isFile) {
				// 文件类型得到json表示错误
				ElMessage.warning('文件下载失败: ' + responseData?.msg || responseData?.message || '')
				return {
					isOk: false,
				}
			}
			return {
				isOk: true,
				responseData,
			}
		} else {
			// 文件类型
			// 提取文件名
			const contentDisposition = response.headers.get('Content-Disposition');
			let fileName = 'downloaded-file'; // 默认文件名
			if (contentDisposition) {
				const match = contentDisposition.match(/filename\*=utf-8''([^;]+)$/i);
				if (match && match[1]) {
					fileName = decodeURIComponent(match[1]); // 解码文件名，解决乱码
				}
			}
			const responseBlob = await response.blob()
			if (responseBlob.size === 0) {
				ElMessage.warning('文件为空文件,无法下载')
				return {
					isOk: false,
				}
			}

			const file = new File([responseBlob], fileName, {type: responseBlob.type,})
			exportFile({
				file,
				callback: () => {
					ElMessage.success('文件下载成功')
				},
				callbackError: text => {
					ElMessage.error(text)
				}
			})
			return {
				isOk: true,
			}
		}
	} catch (e) {
		if ((e as Error).name === 'AbortError') {
			console.log('手动停止的错误')
			return {
				isOk: false,
				reason: 'AbortError',
			}
		} else {
			errorMessage('api请求失败：网络错误')
			return {
				isOk: false,
			}
		}
	}
}