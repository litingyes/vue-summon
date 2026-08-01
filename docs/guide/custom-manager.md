# Custom Managers

By default, `summon()` and `<SummonHost />` share a global `defaultManager`. `createSummonManager()` gives you an isolated registry:

```ts
import { createSummonManager } from 'vue-summon'

const manager = createSummonManager()

manager.summon(ToastCard, { message: 'Saved' })
manager.dismissAll()
```

## Wiring a host

Pass the manager to a dedicated host:

```vue
<template>
  <SummonHost :manager="manager" />
</template>
```

Each host renders only the instances of its own manager. Instances from different managers stack independently and never interfere.

## Use cases

**Testing** — fresh state per test, no cross-test leakage:

```ts
let manager: SummonManager

beforeEach(() => {
  manager = createSummonManager()
})
```

**Feature scoping** — tear down a feature's overlays in one call:

```ts
const checkoutManager = createSummonManager()

function abortCheckout() {
  checkoutManager.dismissAll(new Error('checkout-aborted'))
}
```

**Micro-frontends / plugins** — ship a manager per boundary so one zone cannot dismiss another's dialogs.

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

`manager.summon` behaves exactly like the top-level `summon`, minus the shared global state.
