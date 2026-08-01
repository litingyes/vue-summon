# Summoning Components

`summon()` is the heart of the library:

```ts
function summon<C extends Component, R = unknown>(
  component: C,
  props?: ComponentProps<C>,
  options?: SummonOptions,
): SummonPromise<R, ComponentProps<C>>
```

It registers an instance, renders it through `<SummonHost />`, and returns a **Promise that is also a controller** (see [The Controller](/guide/controller)).

## Passing props

Props are inferred from the component itself:

```ts
const task = summon(ProgressDialog, { title: 'Uploading', progress: 0 })
//                                   ^? { title: string; progress: number }
```

The instance's props are wrapped in `reactive()`, so updates flow into the component automatically.

## Awaiting a result

Inside the summoned component, `resolve(value)` fulfills the promise and starts the leave transition:

```ts
const confirmed = await summon(ConfirmDialog, { title: 'Continue?' })
// confirmed: boolean — whatever the dialog passed to resolve()
```

The result type defaults to `unknown`. Pin it with the type parameter for full inference:

```ts
const file = await summon<typeof FilePicker, File>(FilePicker)
// file: File
```

## `onResolve` / `onReject` props

Two reserved props act as event listeners, fired alongside promise settlement:

```ts
summon(ConfirmDialog, {
  title: 'Discard draft?',
  onResolve: (value) => analytics.track('confirmed', value),
  onReject: () => analytics.track('canceled'),
})
```

Use them for side effects (logging, analytics) while keeping `await` for control flow.

## Handling rejection

`reject(reason)` and `dismiss()` both reject the promise. `dismiss()` specifically rejects with a `SummonDismissedError`, letting you distinguish "user closed it" from real failures:

```ts
import { summon, SummonDismissedError } from 'vue-summon'

try {
  await summon(EditProfileDialog)
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // user clicked the overlay or pressed the close button
  } else {
    // something else rejected
  }
}
```

## Options

```ts
interface SummonOptions {
  key?: string
}
```

Pass a `key` to dedupe instances — see [Keys & Dismissal](/guide/key-and-dismiss).
