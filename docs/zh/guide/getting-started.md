# 快速上手

## 安装

::: code-group

```bash [pnpm]
pnpm add vue-summon
```

```bash [npm]
npm install vue-summon
```

```bash [yarn]
yarn add vue-summon
```

:::

Vue Summon 只有一个 peer 依赖：`vue@3`。

## 1. 挂载宿主

`<SummonHost />` 负责渲染所有被召唤的实例。在应用根部挂载一次即可：

```vue [App.vue]
<script setup lang="ts">
import { SummonHost } from 'vue-summon'
</script>

<template>
  <RouterView />
  <SummonHost />
</template>
```

宿主会把实例 teleport 到 `<body>`，并为每个实例包裹 `<Transition>` 以实现进出场动画。你可以通过 `transition` prop 定制过渡动画：

```vue
<SummonHost transition="fade" />

<!-- 也可以透传完整的 Transition props 对象 -->
<SummonHost :transition="{ name: 'zoom', mode: 'out-in' }" />
```

## 2. 编写可召唤的组件

在由宿主渲染的组件内部，调用 `useSummoned()` 获取控制器：

```vue [ConfirmDialog.vue]
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

## 3. 召唤它

可以在任何组件、状态仓库或普通模块中召唤：

```ts
import { summon } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

async function onDelete() {
  try {
    const confirmed = await summon(ConfirmDialog, {
      title: '要删除这个文件吗？',
      message: '此操作无法撤销。',
    })
    if (confirmed) {
      await deleteFile()
    }
  } catch (error) {
    // 用户未做选择，对话框被关闭
  }
}
```

props 通过 `ComponentProps<C>` 获得完整类型推断 —— 传入未声明的 prop，TypeScript 会立即报错。

## 下一步

- [召唤组件](/zh/guide/summon) —— 返回值、`onResolve` / `onReject` props、错误处理
- [控制器](/zh/guide/controller) —— `update()`、`visible`、`dismiss()` 等成员
- [在线示例](/zh/examples/) —— 在本站直接运行的交互演示
