# 常见问题
- 低版本nodejs安装报错
解决方案: 如果是vite的esbuild安装脚本报错,那么需要将vite降级到nodejs支持的版本即可.
@vitejs/plugin-vue同步降级.
- package.json不能含有version属性,否则webstorm无法解析Vue单文件组件

"@toast-ui/editor": "^3.2.2",
@toast-ui/editor的依赖项存在漏洞,且该包不再维护,不要使用