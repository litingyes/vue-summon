# API 参考

## 函数

### `summon(component, props?, options?)`

通过默认管理器召唤组件，返回 [`SummonPromise`](#summonpromise)。

| 参数        | 类型                              | 说明                                                              |
| ----------- | --------------------------------- | ----------------------------------------------------------------- |
| `component` | `C extends Component`             | 要渲染的组件。                                                    |
| `props`     | `ComponentProps<C>`               | 从组件完整推断的 props，支持保留监听器 `onResolve` / `onReject`。 |
| `options`   | [`SummonOptions`](#summonoptions) | 可选。`{ key?: string }` 用于去重。                               |

```ts
const confirmed = await summon(ConfirmDialog, { title: '确定吗？' })
```

### `dismiss(idOrKey?)`

按 `id`（symbol）或 `key`（string）关闭默认管理器上的实例；不传参数则关闭全部。以 `SummonDismissedError` 拒绝。

### `dismissAll(reason?)`

以可选的自定义原因拒绝默认管理器上所有打开的实例。

### `createSummonManager()`

创建一个隔离的 [`SummonManager`](#summonmanager)。见[自定义管理器](/zh/guide/custom-manager)。

### `useSummoned<R, P>()`

在**被召唤的组件内部**使用的组合式函数，返回其 [`SummonController`](#summoncontroller)。在非宿主渲染的组件中调用会抛错。

```ts
const { resolve, dismiss, props } = useSummoned<boolean>()
```

### `useSummon(options?)`

在**宿主外部**使用的组合式函数，用于创建与当前 effect scope 生命周期绑定的实例：当 scope 被销毁（如组件卸载、Pinia store action scope 停止）时，会自动关闭这些实例。

```ts
const summon = useSummon() // 与顶层 summon() 同签名

async function onDelete() {
  const confirmed = await summon(ConfirmDialog, { title: '确定删除吗？' })
  if (confirmed) {
    /* ... */
  }
}
```

| 参数      | 类型                          | 说明                              |
| --------- | ----------------------------- | --------------------------------- |
| `options` | `{ manager?: SummonManager }` | 可选，默认使用 `defaultManager`。 |

必须在活跃的 effect scope 中调用才会自动清理；否则退化为普通 `summon()` 并输出警告。

## 组件

### `<SummonHost />`

渲染某个管理器下的所有实例，teleport 到 `<body>`，每个实例包裹 `<Transition>`。

| Prop         | 类型                        | 默认值           | 说明                                                                       |
| ------------ | --------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `manager`    | `SummonManager`             | `defaultManager` | 渲染哪个注册表。                                                           |
| `transition` | `string \| TransitionProps` | `undefined`      | 所有实例的默认过渡动画。字符串会设置 `name`；对象会透传给 `<Transition>`。 |

每个管理器挂载一次，通常在 `App.vue` 中。

## 类型

### `SummonOptions`

```ts
interface SummonOptions {
  key?: string
}
```

### `SummonController`

```ts
interface SummonController<R = unknown, P extends Record<string, any> = Record<string, any>> {
  readonly id: symbol
  readonly visible: Ref<boolean>
  readonly props: P
  resolve: (value: R | PromiseLike<R>) => void
  reject: (reason?: unknown) => void
  dismiss: () => void
  update: (patch: Partial<P>) => void
}
```

### `SummonPromise`

```ts
type SummonPromise<R, P> = Promise<R> & SummonController<R, P>
```

既能像 Promise 一样 await，也能像控制器一样驱动。

### `SummonManager`

```ts
interface SummonManager {
  readonly instances: readonly SummonInstance[]
  summon: <C extends Component, R = unknown>(
    component: C,
    props?: ComponentProps<C>,
    options?: SummonOptions,
  ) => SummonPromise<R, ComponentProps<C>>
  dismiss: (idOrKey?: symbol | string) => void
  dismissAll: (reason?: unknown) => void
  remove: (id: symbol) => void
}
```

### `SummonInstance`

```ts
interface SummonInstance<R = unknown, P extends Record<string, any> = Record<string, any>> {
  id: symbol
  key: string | undefined
  component: Component
  props: P
  visible: Ref<boolean>
  controller: SummonController<R, P>
  settled: boolean
  remove: () => void
}
```

## 类与常量

### `SummonDismissedError`

`Error` 子类，作为 `dismiss()` 的拒绝原因。用 `error instanceof SummonDismissedError` 判断。

### `defaultManager`

支撑顶层 `summon` / `dismiss` / `dismissAll` 的共享 `SummonManager`。

### `summonContextKey`

`useSummoned()` 内部使用的 `InjectionKey<SummonController>`，为高级组合场景导出。
