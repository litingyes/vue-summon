# 自定义管理器

默认情况下，`summon()` 与 `<SummonHost />` 共享全局的 `defaultManager`。`createSummonManager()` 可以创建相互隔离的注册表：

```ts
import { createSummonManager } from 'vue-summon'

const manager = createSummonManager()

manager.summon(ToastCard, { message: '已保存' })
manager.dismissAll()
```

## 绑定宿主

把管理器传给专属的宿主：

```vue
<template>
  <SummonHost :manager="manager" />
</template>
```

每个宿主只渲染自己管理器下的实例。不同管理器的实例各自独立层叠，互不干扰。

## 使用场景

**测试** —— 每个用例一份全新状态，杜绝跨用例泄漏：

```ts
let manager: SummonManager

beforeEach(() => {
  manager = createSummonManager()
})
```

**功能域隔离** —— 一次调用清理某个功能的所有浮层：

```ts
const checkoutManager = createSummonManager()

function abortCheckout() {
  checkoutManager.dismissAll(new Error('checkout-aborted'))
}
```

**微前端 / 插件** —— 每个边界一个管理器，一个区域无法误关另一个区域的对话框。

## API

```ts
interface SummonManager {
  readonly instances: readonly SummonInstance[]
  summon<C extends Component, R = unknown>(
    component: C,
    props?: ComponentProps<C>,
    options?: SummonOptions,
  ): SummonPromise<R, ComponentProps<C>>
  dismiss: (idOrKey?: symbol | string) => void
  dismissAll: (reason?: unknown) => void
  remove: (id: symbol) => void
}
```

`manager.summon` 的行为与顶层 `summon` 完全一致，只是不共享全局状态。
