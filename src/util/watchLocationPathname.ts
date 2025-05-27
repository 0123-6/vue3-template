// 监听location.pathname的变化
export const watchLocationPathname = (callback: (pathname: string) => void) => {
	// 保存原生 pushState 和 replaceState 方法
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;
	// 上一次的location.pathname
	let lastPathname = location.pathname

	const triggerCallback = () => {
		if (lastPathname === location.pathname) {
			return
		}
		lastPathname = location.pathname
		callback(location.pathname)
	}

	// 覆盖 pushState
	history.pushState = (...args) => {
		Reflect.apply(originalPushState, history, args)
		triggerCallback()
	}

	// 覆盖 replaceState
	history.replaceState = (...args) => {
		Reflect.apply(originalReplaceState, history, args)
		triggerCallback()
	}

	// 监听 popstate 事件（后退、前进按钮触发）
	window.addEventListener('popstate', triggerCallback)

	// 返回取消函数,恢复history的方法
	return () => {
		history.pushState = originalPushState
		history.replaceState = originalReplaceState
		window.removeEventListener('popstate', triggerCallback)
	}
}