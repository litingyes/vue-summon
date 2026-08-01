---
layout: home

hero:
  name: Vue Summon
  text: 随时随地召唤组件
  tagline: 在 Vue 3 中以命令式渲染对话框、通知与模态框 —— 不再污染模板，结果以 Promise 返回。
  image:
    src: /logo.svg
    alt: Vue Summon
  actions:
    - theme: brand
      text: 快速上手
      link: /zh/guide/getting-started
    - theme: alt
      text: 在线示例
      link: /zh/examples/
    - theme: alt
      text: GitHub
      link: https://github.com/litingyes/vue-summon

features:
  - icon: ⚡
    title: 命令式 API
    details: 在事件回调、状态仓库、路由守卫中调用 summon(Component, props)，甚至在组件之外。
  - icon: 🤝
    title: Promise 化结果
    details: 每次召唤都返回 Promise，直接 await 用户的选择，告别 v-model 与回调接线。
  - icon: 🧩
    title: 模板零污染
    details: 不再在每个页面预置隐藏的对话框，一个 <SummonHost /> 渲染所有实例。
  - icon: 🔄
    title: 实时更新 props
    details: controller.update() 响应式地修补 props —— 进度条、向导与表单的绝配。
  - icon: 🔑
    title: Key 去重
    details: 传入 key 保证单实例；重复召唤返回已存在的控制器。
  - icon: 🎞️
    title: 内置过渡动画
    details: 实例经 Teleport 挂载到 body 并包裹 Transition，离场后安全移除。
  - icon: 🏝️
    title: 多管理器隔离
    details: createSummonManager() 按功能、按测试、按微前端隔离实例。
  - icon: 🦾
    title: 完整类型推断
    details: 基于 vue-component-type-helpers，从组件自动推断 props 与返回值类型。
---

## 30 秒完成第一次召唤

```vue [ConfirmDialog.vue]
<script setup lang="ts">
import { useSummoned } from 'vue-summon'

const { resolve } = useSummoned<boolean>()
</script>

<template>
  <div class="overlay">
    <div class="dialog">
      <p>要删除这个文件吗？</p>
      <button @click="resolve(false)">取消</button>
      <button @click="resolve(true)">删除</button>
    </div>
  </div>
</template>
```

```ts [anywhere.ts]
import { summon } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

const confirmed = await summon(ConfirmDialog)
if (confirmed) {
  await deleteFile()
}
```

这就是全部心智模型：**像调用函数一样召唤组件，像等待 Promise 一样等待答案。** 不需要 `v-model:visible`，不需要管理 teleport 目标，也不需要跨三层父组件传递事件。
