// 导入Vue
import {createApp} from 'vue'
import {setDirectiveForApp} from '@/directive.ts'
import {setPluginForApp} from '@/plugin'
// tailwindcss入口文件，包含tailwindcss定义和全局base css
// 放在后面,使其可以覆盖之前的CSS
import '@/index.css'
import LayoutPage from '@/views/layout-page/LayoutPage.vue'
// 使用Vue
const app = createApp(LayoutPage)
// 设置指令
setDirectiveForApp(app)
// 设置插件
setPluginForApp(app)
// 将app绑定到DOM
const appElement: HTMLDivElement = document.getElementById('app') as HTMLDivElement
app.mount(appElement)

// 请注意,如果后期添加了按钮权限,需要先等待接口返回后,再加载路由页面.
// 否则如果先渲染,此时按钮权限接口还没有返回获取结果,按钮判断权限时会判断没有权限(实际有权限,只是接口还没有返回)从而不渲染按钮.