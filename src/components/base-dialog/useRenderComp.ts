import {createVNode, render} from 'vue'

// 渲染一个Vue组件并挂载到 body
export const useRenderComp = (comp: any, props: Record<string, any> | (() => Record<string, any>))
  : () => void => {
  const container = document.createElement('div') as HTMLDivElement
  container.className = 'hpj'

  return () => {
    const innerProps = typeof props === 'object' ? {...props} : {...props()}
    const vnode = createVNode(comp, {
      ...innerProps,
      cancel: () => {
        render(null, container)
        document.body.removeChild(container)
      },
    })
    render(vnode, container)
    document.body.appendChild(container)
  }
}