# API Reference

## Functions

### `summon(component, props?, options?)`

Summon a component through the default manager. Returns a [`SummonPromise`](#summonpromise).

| Parameter   | Type                              | Description                                                                                     |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `component` | `C extends Component`             | The component to render.                                                                        |
| `props`     | `ComponentProps<C>`               | Props, fully inferred from the component. Supports reserved `onResolve` / `onReject` listeners. |
| `options`   | [`SummonOptions`](#summonoptions) | Optional. `{ key?: string }` for dedupe.                                                        |

```ts
const confirmed = await summon(ConfirmDialog, { title: 'Sure?' })
```

### `dismiss(idOrKey?)`

Dismiss instances on the default manager by `id` (symbol) or `key` (string). With no argument, dismisses all. Rejects with `SummonDismissedError`.

### `dismissAll(reason?)`

Reject every open instance on the default manager with an optional custom reason.

### `createSummonManager()`

Create an isolated [`SummonManager`](#summonmanager). See [Custom Managers](/guide/custom-manager).

### `useSummoned<R, P>()`

Composable used **inside** a summoned component to access its [`SummonController`](#summoncontroller). Throws when called outside a host-rendered component.

```ts
const { resolve, dismiss, props } = useSummoned<boolean>()
```

### `useSummon(options?)`

Composable used **outside** the host to spawn instances that are automatically dismissed when the calling effect scope is disposed (for example, when a component unmounts or a Pinia store action scope is stopped).

```ts
const summon = useSummon() // same signature as the top-level summon()

async function onDelete() {
  const confirmed = await summon(ConfirmDialog, { title: 'Delete?' })
  if (confirmed) {
    /* ... */
  }
}
```

| Parameter | Type                          | Description                             |
| --------- | ----------------------------- | --------------------------------------- |
| `options` | `{ manager?: SummonManager }` | Optional. Defaults to `defaultManager`. |

It must be called inside an active effect scope to enable automatic cleanup. Outside a scope, it falls back to plain `summon()` with a warning.

## Components

### `<SummonHost />`

Renders all instances of a manager, teleported to `<body>`, each wrapped in a `<Transition>`.

| Prop      | Type            | Default          | Description               |
| --------- | --------------- | ---------------- | ------------------------- |
| `manager` | `SummonManager` | `defaultManager` | Which registry to render. |

Mount once per manager, typically in `App.vue`.

## Types

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

Await it like a promise, drive it like a controller.

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

## Classes & constants

### `SummonDismissedError`

`Error` subclass used as the rejection reason for `dismiss()`. Check with `error instanceof SummonDismissedError`.

### `defaultManager`

The shared `SummonManager` backing the top-level `summon` / `dismiss` / `dismissAll`.

### `summonContextKey`

The `InjectionKey<SummonController>` used internally by `useSummoned()` — exported for advanced composition.
