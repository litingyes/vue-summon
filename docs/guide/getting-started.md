# Getting Started

## Installation

::: code-group

```bash [pnpm]
pnpm add vue-summon
```

```bash [npm]
npm install vue-summon
```

```bash [yarn]
yarn add vue-summon
```

:::

Vue Summon has a single peer dependency: `vue@3`.

## 1. Mount the host

`<SummonHost />` renders every summoned instance. Mount it once, near your app root:

```vue [App.vue]
<script setup lang="ts">
import { SummonHost } from 'vue-summon'
</script>

<template>
  <RouterView />
  <SummonHost />
</template>
```

The host teleports instances to `<body>` and wraps each one in a `<Transition>` for enter/leave animations.

## 2. Build a summoneable component

Inside a component rendered by the host, call `useSummoned()` to get its controller:

```vue [ConfirmDialog.vue]
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

## 3. Summon it

From any component, store, or plain module:

```ts
import { summon } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

async function onDelete() {
  try {
    const confirmed = await summon(ConfirmDialog, {
      title: 'Delete this file?',
      message: 'This action cannot be undone.',
    })
    if (confirmed) {
      await deleteFile()
    }
  } catch (error) {
    // dismissed without a choice
  }
}
```

Props are fully typed via `ComponentProps<C>` — pass an unknown prop and TypeScript will complain.

## Next steps

- [Summoning components](/guide/summon) — results, `onResolve` / `onReject` props, error handling
- [The controller](/guide/controller) — `update()`, `visible`, `dismiss()` and friends
- [Live examples](/examples/) — interactive demos running on this site
