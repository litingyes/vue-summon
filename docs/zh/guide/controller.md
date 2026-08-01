# 控制器

每次召唤都会产生一个 `SummonController`：

```ts
interface SummonController<R, P> {
  readonly id: symbol
  readonly visible: Ref<boolean>
  readonly props: P
  resolve: (value: R | PromiseLike<R>) => void
  reject: (reason?: unknown) => void
  dismiss: () => void
  update: (patch: Partial<P>) => void
}
```

## 两种获取方式

**组件外部** —— `summon()` 返回的 `SummonPromise` 是 `Promise<R>` 与控制器的合体：

```ts
const dialog = summon(ProgressDialog, { progress: 0 })

dialog.update({ progress: 40 }) // 控制器的一面
dialog.dismiss() // 编程式关闭
await dialog // Promise 的一面
```

**组件内部** —— `useSummoned()` 组合式函数：

```ts
import { useSummoned } from 'vue-summon'

const { resolve, dismiss, props } = useSummoned<boolean>()
```

它注入由宿主提供的控制器；若组件并非由 `<SummonHost />` 渲染，调用时会抛出错误。

## 成员一览

| 成员             | 说明                                                            |
| ---------------- | --------------------------------------------------------------- |
| `id`             | 标识实例的唯一 symbol。                                         |
| `visible`        | 驱动宿主 `<Transition>` 的 `Ref<boolean>`，结算时置为 `false`。 |
| `props`          | 该实例的响应式 props 对象。                                     |
| `resolve(value)` | 兑现 Promise、触发 `onResolve`、隐藏实例。幂等。                |
| `reject(reason)` | 拒绝 Promise、触发 `onReject`、隐藏实例。幂等。                 |
| `dismiss()`      | 等价于 `reject(new SummonDismissedError())`。                   |
| `update(patch)`  | 将补丁 `Object.assign` 进响应式 props —— 实时更新已打开的组件。 |

## `update()` 实战

因为 Promise 本身就是控制器，长流程代码可以保持清晰：

```ts
const task = summon(ProgressDialog, { title: '正在上传', progress: 0 })

for await (const chunk of upload(file)) {
  task.update({ progress: chunk.percent })
}

task.resolve('done')
```

## 结算语义

- 只有**第一次**结算生效，之后的 `resolve` / `reject` 调用都是空操作。
- 结算会把 `visible` 置为 `false`；宿主在离场过渡结束后移除实例。
- 永不结算的实例会一直开着 —— 记得覆盖所有退出路径（关闭按钮、遮罩、`Escape`）。
