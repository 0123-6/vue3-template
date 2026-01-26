# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Vue 3 企业级后台管理系统模板项目，使用 TypeScript 开发，集成了 Element Plus UI 框架。

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (默认端口由 project.config.ts 配置)
pnpm dev

# 生产构建
pnpm build

# ESLint 检查
pnpm lint
```

## 代码规范

项目使用 ESLint + TypeScript ESLint + eslint-plugin-vue，主要规则：
- 2空格缩进
- 单引号
- 无分号
- 多行尾逗号

Git 提交时会通过 husky + lint-staged 自动运行 lint 检查。

## 项目架构

### 配置体系

- `project.config.ts` - 项目核心配置（API前缀、登录模式、代理设置等）
- `vite.config.ts` - Vite构建配置，包含CDN配置和分包策略
- `tsconfig.json` - TypeScript配置，strict 模式关闭

### 路径别名

- `@/` → `src/`
- `@views/` → `src/views/`

### 核心目录结构

```
src/
├── index.ts          # 应用入口
├── directive.ts      # 自定义指令 (v-scrollbar)
├── plugin/           # 插件配置
│   ├── index.ts      # Element Plus + Router + Pinia 初始化
│   ├── vue-router.ts # 路由定义和守卫
│   └── pinia.ts      # 全局状态 (用户信息、权限)
├── util/             # 工具函数
│   ├── api.ts        # baseFetch 封装
│   └── hooks/        # 组合式函数
├── components/       # 通用组件
└── views/            # 页面组件
```

### 核心模式

**API 请求**：使用 `baseFetch` 函数（`src/util/api.ts`），统一处理响应码、错误提示、登录超时跳转。请求封装使用 `useBaseFetch` hook（`src/util/hooks/useBaseFetch.ts`）。

**状态管理**：Pinia stores 定义在 `src/plugin/pinia.ts`，使用 `pinia-plugin-persistedstate` 持久化。

**路由守卫**：在 `src/plugin/vue-router.ts` 中实现登录验证和权限控制，未登录用户重定向到 `/auth/login`。

**CDN 模式**：生产环境可选启用 CDN（`project.config.ts` 中 `isUseCdn`），将 Vue、Element Plus 等大型依赖通过 CDN 加载。

### 微前端支持

项目支持作为子应用嵌入，通过 `src/util/microWeb.ts` 与父应用通信，接收权限等初始化数据。
