# 为什么需要 Vue Summon

对话框、通知、抽屉和模态框有一个共同的尴尬之处：**它们由逻辑触发，而非由布局决定。** 但 Vue 的声明式写法却强迫你把它们预先声明在模板里。

## 声明式的代价

哪怕只是一个确认框，通常也要付出这些成本：

```vue
<script setup>
const visible = ref(false)
let resolver

function askDelete() {
  visible.value = true
  return new Promise((resolve) => {
    resolver = resolve
  })
}
</script>

<template>
  <button @click="askDelete">删除</button>
  <Teleport to="body">
    <Dialog
      v-if="visible"
      @confirm="
        resolver(true)
        visible = false
      "
      @cancel="
        resolver(false)
        visible = false
      "
    />
  </Teleport>
</template>
```

再乘以每个页面的每个对话框，加上 teleport 目标、过渡动画、层叠与清理 —— 这些附带的复杂度很快淹没了真正的业务功能。

## 召唤模型

Vue Summon 把流程翻转过来：**像调用函数一样调用组件，像等待 Promise 一样等待它。**

```ts
import { summon } from 'vue-summon'

const confirmed = await summon(ConfirmDialog, { title: '要删除这个文件吗？' })
```

- 组件由挂载在应用根部的唯一 `<SummonHost />` 统一渲染。
- 组件内部调用 `resolve(value)` 即可兑现 Promise 并关闭实例。
- `reject(reason)` / `dismiss()` 拒绝 Promise，`try/catch` 天然对应用户取消。
- props 是响应式的，召唤后还能用 `controller.update()` 修补。

## 适用场景

- **确认 / 警告流程** —— 在动作发生的地方直接 `await` 答案。
- **Toast 与通知** —— 发后即忘，或等待关闭原因。
- **向导与异步任务** —— 任务运行期间用 `update()` 推送进度。
- **仓库 / 路由 / 拦截器代码** —— 在组件之外召唤 UI。

## 什么时候仍该用声明式

常驻的、与布局绑定的 UI（侧边栏、行内气泡、表单字段）应该留在模板里。Vue Summon 面向的是**短暂的、由逻辑驱动的浮层** —— 让每种工具各得其所。
