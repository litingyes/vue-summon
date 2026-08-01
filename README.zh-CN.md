<div align="center">
  <img src="./docs/public/logo.svg" width="120" alt="Vue Summon logo" />
  <h1>Vue Summon</h1>
  <p>从任何地方命令式地渲染 Vue 组件——对话框、toast、弹窗，无需让模板变得杂乱。</p>
  <p>
    <a href="https://www.npmjs.com/package/vue-summon"><img src="https://img.shields.io/npm/v/vue-summon" alt="npm version" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/npm/l/vue-summon" alt="license" /></a>
  </p>
</div>

[English](./README.md) | **简体中文**

## 特性

- **命令式 API** — 从事件处理函数、store、路由中，甚至组件 setup 外部调用 `summon(Component, props)`
- **基于 Promise 的结果** — 每次召唤都会返回一个 Promise；直接 `await` 用户的选择，无需绑定 `v-model` 和回调
- **零模板冗余** — 无需在每个页面中隐藏对话框块；一个 `<SummonHost />` 即可渲染所有实例
- **实时 prop 更新** — `controller.update()` 会响应式地补丁 props，非常适合进度条、向导和表单
- **基于 key 的去重** — 传入 `key` 可保证唯一实例；重复召唤会返回已有的控制器
- **内置过渡** — 实例会被 teleport 到 `body` 并包裹在 `<Transition>` 中，在离开动画结束后安全移除
- **多管理器隔离** — `createSummonManager()` 可为每个功能、每个测试或每个微前端单独管理实例
- **完整类型推导** — 通过 `vue-component-type-helpers` 从组件自动推断 props 和结果类型

## 安装

```bash
pnpm add vue-summon
# 或
npm install vue-summon
# 或
yarn add vue-summon
```

Vue Summon 只有一个 peer dependency：`vue@3`。

## 快速开始

**1. 挂载宿主组件**，放在应用根节点附近即可：

```vue
<!-- App.vue -->
<script setup lang="ts">
import { SummonHost } from 'vue-summon'
</script>

<template>
  <RouterView />
  <SummonHost />
</template>
```

**2. 创建一个可被召唤的组件** — `useSummoned()` 会为其提供控制器：

```vue
<!-- ConfirmDialog.vue -->
<script setup lang="ts">
import { useSummoned } from 'vue-summon'

defineProps<{ title: string; message?: string }>()

const { resolve, dismiss } = useSummoned<boolean>()
</script>

<template>
  <div class="overlay" @click.self="dismiss()">
    <div class="dialog">
      <h3>{{ title }}</h3>
      <p v-if="message">{{ message }}</p>
      <button @click="resolve(false)">取消</button>
      <button @click="resolve(true)">确认</button>
    </div>
  </div>
</template>
```

**3. 从任意组件、store 或普通模块中召唤它**：

```ts
import { summon, SummonDismissedError } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

try {
  const confirmed = await summon(ConfirmDialog, { title: '确定要删除此文件吗？' })
  if (confirmed) {
    await deleteFile()
  }
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // 用户未做出选择就关闭了对话框
  }
}
```

核心心智模型就是如此：**召唤一个组件，await 它的答案。**

## AI 智能体技能

本仓库附带一个 [Agent Skill](https://agentskills.io)（`skills/vue-summon`），用于教导 Claude Code、OpenCode、Codex、Cursor 等 70 余种 AI 编码智能体如何在你的项目中正确集成和使用 Vue Summon。

使用 [skills CLI](https://github.com/vercel-labs/skills) 安装：

```bash
npx skills add litingyes/vue-summon
```

查看 [Agent Skill 指南](./docs/guide/agent-skill.md) 了解可用选项和详情。

## 文档

完整文档位于 [`./docs`](./docs)（VitePress，英文 + 简体中文）：

```bash
pnpm docs:dev
```

- [入门](./docs/zh/guide/getting-started.md)
- [召唤组件](./docs/zh/guide/summon.md)
- [控制器](./docs/zh/guide/controller.md)
- [Key 与关闭](./docs/zh/guide/key-and-dismiss.md)
- [自定义管理器](./docs/zh/guide/custom-manager.md)
- [API 参考](./docs/zh/api/index.md)

## 许可证

[MIT](./LICENSE)
