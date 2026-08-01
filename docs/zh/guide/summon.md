# 召唤组件

`summon()` 是整个库的核心：

```ts
function summon<C extends Component, R = unknown>(
  component: C,
  props?: ComponentProps<C>,
  options?: SummonOptions,
): SummonPromise<R, ComponentProps<C>>
```

它会注册一个实例、通过 `<SummonHost />` 渲染，并返回一个**同时是控制器的 Promise**（见[控制器](/zh/guide/controller)）。

## 传递 props

props 类型从组件自身推断：

```ts
const task = summon(ProgressDialog, { title: '正在上传', progress: 0 })
//                                   ^? { title: string; progress: number }
```

实例的 props 被包裹在 `reactive()` 中，因此后续更新会自动流入组件。

## 等待结果

在被召唤的组件内部，`resolve(value)` 会兑现 Promise 并触发离场过渡：

```ts
const confirmed = await summon(ConfirmDialog, { title: '继续吗？' })
// confirmed: boolean —— 即对话框传给 resolve() 的值
```

结果类型默认为 `unknown`。通过类型参数固定它以获得完整推断：

```ts
const file = await summon<typeof FilePicker, File>(FilePicker)
// file: File
```

## `onResolve` / `onReject` props

这两个保留 props 相当于事件监听器，与 Promise 结算一同触发：

```ts
summon(ConfirmDialog, {
  title: '丢弃草稿？',
  onResolve: (value) => analytics.track('confirmed', value),
  onReject: () => analytics.track('canceled'),
})
```

用它们处理副作用（日志、埋点），把 `await` 留给控制流。

## 处理拒绝

`reject(reason)` 与 `dismiss()` 都会拒绝 Promise。其中 `dismiss()` 固定以 `SummonDismissedError` 拒绝，便于区分「用户关闭了它」与真正的异常：

```ts
import { summon, SummonDismissedError } from 'vue-summon'

try {
  await summon(EditProfileDialog)
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // 用户点击了遮罩或关闭按钮
  } else {
    // 其他原因导致的拒绝
  }
}
```

## 选项

```ts
interface SummonOptions {
  key?: string
}
```

传入 `key` 可以对实例去重 —— 见 [Key 与关闭](/zh/guide/key-and-dismiss)。
