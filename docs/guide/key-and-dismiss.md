# Keys & Dismissal

## Key-based dedupe

Pass `options.key` to guarantee at most one instance per key:

```ts
const a = summon(SettingsDialog, {}, { key: 'settings' })
const b = summon(SettingsDialog, {}, { key: 'settings' })

a === b // true — the second call returns the existing controller
```

This is ideal for singleton UI: settings panels, "already running" guards, or one-at-a-time toasts.

## Dismissing from anywhere

The default manager is also addressable through top-level helpers:

```ts
import { dismiss, dismissAll } from 'vue-summon'

dismiss('settings') // dismiss by key
dismiss(controller.id) // or by instance id
dismiss() // no argument: dismiss every instance
```

`dismiss()` rejects each promise with `SummonDismissedError`, so awaiting code can tell it apart from genuine rejections.

## `dismissAll(reason?)`

Rejects **all** open instances with an optional custom reason:

```ts
import { dismissAll } from 'vue-summon'

router.beforeEach(() => {
  dismissAll(new Error('route-changed'))
})
```

```ts
try {
  await summon(SearchPalette, {}, { key: 'palette' })
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // closed via dismiss() — overlay click, close button, dismiss('palette')
  } else {
    // closed via dismissAll('route-changed') or a custom reject(reason)
  }
}
```

## SummonDismissedError

```ts
class SummonDismissedError extends Error {
  name = 'SummonDismissedError'
}
```

Thrown (as a rejection) whenever an instance is dismissed rather than resolved. It is the library's only opinionated rejection type — everything else is yours to define.
