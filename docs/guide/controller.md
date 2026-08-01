# The Controller

Every summons produces a `SummonController`:

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

## Two ways to reach it

**Outside the component** — `summon()` returns a `SummonPromise`, which is `Promise<R>` merged with the controller:

```ts
const dialog = summon(ProgressDialog, { progress: 0 })

dialog.update({ progress: 40 }) // controller surface
dialog.dismiss() // close it programmatically
await dialog // promise surface
```

**Inside the component** — the `useSummoned()` composable:

```ts
import { useSummoned } from 'vue-summon'

const { resolve, dismiss, props } = useSummoned<boolean>()
```

It injects the controller provided by the host, and throws if the component was not rendered by `<SummonHost />`.

## Members

| Member           | Description                                                                     |
| ---------------- | ------------------------------------------------------------------------------- |
| `id`             | Unique symbol identifying the instance.                                         |
| `visible`        | `Ref<boolean>` driving the host's `<Transition>`. Flipped to `false` on settle. |
| `props`          | The reactive props object of this instance.                                     |
| `resolve(value)` | Fulfill the promise, fire `onResolve`, hide the instance. Idempotent.           |
| `reject(reason)` | Reject the promise, fire `onReject`, hide the instance. Idempotent.             |
| `dismiss()`      | Shortcut for `reject(new SummonDismissedError())`.                              |
| `update(patch)`  | `Object.assign` into the reactive props — live-update the open component.       |

## `update()` in action

Because the promise _is_ the controller, long-running flows stay readable:

```ts
const task = summon(ProgressDialog, { title: 'Uploading', progress: 0 })

for await (const chunk of upload(file)) {
  task.update({ progress: chunk.percent })
}

task.resolve('done')
```

## Settlement semantics

- Only the **first** settle wins — later `resolve` / `reject` calls are no-ops.
- Settling flips `visible` to `false`; the host removes the instance after the leave transition finishes.
- An instance that is never settled stays open — remember to handle every exit path (close buttons, overlays, `Escape`).
