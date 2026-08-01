---
name: vue-summon
description: Imperatively render Vue 3 components — confirm dialogs, modals, toasts, drawers, form dialogs, multi-step wizards — from anywhere and await the user's choice as a Promise, using the vue-summon library. Use this skill whenever the user wants Promise-based dialog results, a confirm-before-delete flow, a toast/notification system, a modal opened from a store/router/plain module, or wants to replace v-model:visible, teleport-target, or event-plumbing dialog boilerplate in a Vue 3 app — or whenever they mention vue-summon, summon(), SummonHost, or useSummoned, even if they don't explicitly name the library.
---

# Vue Summon

Vue Summon renders Vue 3 components imperatively: call `summon(Component, props)` from anywhere — event handlers, Pinia stores, router guards, plain modules — and `await` the result as a Promise. One `<SummonHost />` mounted at the app root renders every instance (teleported to `<body>`, wrapped in `<Transition>`), so page templates stay free of hidden dialog blocks, `v-model:visible` flags, and callback plumbing.

The whole mental model: **summon a component, await its answer.**

## Setup (both steps are required)

1. Install (peer dependency: `vue@3`):

```bash
pnpm add vue-summon
```

2. Mount `<SummonHost />` once, near the app root. Without it nothing renders — this is the most common integration mistake:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { SummonHost } from 'vue-summon'
</script>

<template>
  <RouterView />
  <SummonHost />
</template>
```

## Core workflow

A summoneable component is an ordinary SFC that calls `useSummoned()` to get its controller. `resolve(value)` fulfills the promise; `dismiss()` rejects it with `SummonDismissedError`:

```vue
<!-- ConfirmDialog.vue -->
<script setup lang="ts">
import { useSummoned } from 'vue-summon'

defineProps<{ title: string; message?: string }>()

const { resolve, dismiss } = useSummoned<boolean>()
</script>

<template>
  <div class="overlay" @click.self="dismiss()">
    <div class="dialog">
      <h3>{{ title }}</h3>
      <p v-if="message">{{ message }}</p>
      <button @click="resolve(false)">Cancel</button>
      <button @click="resolve(true)">Confirm</button>
    </div>
  </div>
</template>
```

Summon it from anywhere and `await` the answer:

```ts
import { summon, SummonDismissedError } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

try {
  const confirmed = await summon(ConfirmDialog, { title: 'Delete this file?' })
  if (confirmed) await deleteFile()
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // user closed it without choosing — usually safe to ignore
  } else {
    throw error
  }
}
```

Props are fully typed via `ComponentProps<C>` — unknown props fail typecheck. The result type defaults to `unknown`; pin it either on `useSummoned<boolean>()` inside the component or at the call site: `summon<typeof FilePicker, File>(FilePicker)`.

## API quick reference

| Export                                | Purpose                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `summon(component, props?, options?)` | Render an instance; returns `SummonPromise` — a `Promise<R>` that is also the controller         |
| `useSummoned<R>()`                    | Inside the summoned component: inject its controller. Throws if not rendered by `<SummonHost />` |
| `<SummonHost :manager?>`              | Renders all instances of a manager (default: the global one). Mount once per manager             |
| `dismiss(idOrKey?)`                   | Dismiss one instance by id/key, or all when called with no argument                              |
| `dismissAll(reason?)`                 | Reject every open instance                                                                       |
| `createSummonManager()`               | Isolated manager for tests, features, or micro-frontends                                         |
| `SummonDismissedError`                | Error type thrown by `dismiss()` — distinguishes "user closed it" from real failures             |

Controller members (available both as `useSummoned()`'s return and on the promise returned by `summon()`):

| Member           | Behavior                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| `resolve(value)` | Fulfill, fire `onResolve`, start leave transition. Idempotent — first settle wins   |
| `reject(reason)` | Reject, fire `onReject`, start leave transition. Idempotent                         |
| `dismiss()`      | `reject(new SummonDismissedError())`                                                |
| `update(patch)`  | `Object.assign` into the instance's reactive props — live-update the open component |
| `visible`        | `Ref<boolean>` driving the host's `<Transition>`; flipped to `false` on settle      |
| `props`          | The instance's reactive props object                                                |

Reserved props `onResolve` / `onReject` act as event listeners alongside promise settlement — use them for side effects (analytics, logging) while keeping `await` for control flow.

## Recipes

**Form dialog returning data** — resolve with the form model:

```ts
const profile = await summon<typeof EditProfileDialog, Profile>(EditProfileDialog, {
  initial: currentProfile,
})
```

**Progress / long-running flows** — the promise is the controller, so drive it from the call site:

```ts
const task = summon(ProgressDialog, { title: 'Uploading', progress: 0 })
for await (const chunk of upload(file)) {
  task.update({ progress: chunk.percent })
}
task.resolve('done')
```

**Singleton instances** — pass `options.key` to dedupe; re-summoning with the same key returns the existing controller instead of mounting a duplicate:

```ts
summon(SettingsDialog, {}, { key: 'settings' })
dismiss('settings') // close it later by key
```

**Isolated tests or features** — scope instances to their own manager and host:

```ts
const manager = createSummonManager()
// <SummonHost :manager="manager" />
manager.summon(ConfirmDialog, { title: '...' })
```

## Pitfalls

- Always mount `<SummonHost />` before summoning; a summons with no host never appears and its promise never settles.
- Call `useSummoned()` only in components rendered by the host — it throws elsewhere.
- Handle every exit path (close button, overlay click, `Escape`); an instance that is never settled stays open forever and the promise never resolves.
- Wrap `await summon(...)` in try/catch when dismissal is possible — `dismiss()` rejects with `SummonDismissedError`, which becomes an unhandled rejection if ignored.
- Settle exactly once; later `resolve`/`reject` calls are no-ops, so decide the result before calling `resolve`.
- Instances are teleported to `<body>` — scoped styles of the calling component do not apply; style summoneable components in their own SFC `<style>`.

## Going deeper

Full guides (transitions, keys, custom managers, testing) live in the library's docs: https://github.com/litingyes/vue-summon/tree/release/docs — read `docs/guide/` and `docs/api/index.md` when a task goes beyond these patterns.
