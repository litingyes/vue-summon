---
layout: home

hero:
  name: Vue Summon
  text: Summon components from anywhere
  tagline: Imperatively render dialogs, toasts and modals in Vue 3 — no template clutter, results delivered as Promises.
  image:
    src: /logo.svg
    alt: Vue Summon
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Live Examples
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/litingyes/vue-summon

features:
  - icon: ⚡
    title: Imperative API
    details: Call summon(Component, props) from event handlers, stores, routers — even outside component setup.
  - icon: 🤝
    title: Promise-based results
    details: Every summons returns a Promise. await the user's choice instead of wiring v-model and callbacks.
  - icon: 🧩
    title: Zero template clutter
    details: No more hidden dialog blocks in every page. One <SummonHost /> renders everything for you.
  - icon: 🔄
    title: Live prop updates
    details: controller.update() patches props reactively — perfect for progress bars, wizards and forms.
  - icon: 🔑
    title: Key-based dedupe
    details: Pass a key to guarantee a single instance; re-summoning returns the existing controller.
  - icon: 🎞️
    title: Transitions built-in
    details: Instances are teleported to body and wrapped in Transition, removed safely after leave.
  - icon: 🏝️
    title: Multi-manager isolation
    details: createSummonManager() scopes instances per feature, per test, or per micro-frontend.
  - icon: 🦾
    title: Fully typed
    details: Props and results are inferred from your component via vue-component-type-helpers.
---

## 30 seconds to your first summon

```vue [ConfirmDialog.vue]
<script setup lang="ts">
import { useSummoned } from 'vue-summon'

const { resolve } = useSummoned<boolean>()
</script>

<template>
  <div class="overlay">
    <div class="dialog">
      <p>Delete this file?</p>
      <button @click="resolve(false)">Cancel</button>
      <button @click="resolve(true)">Delete</button>
    </div>
  </div>
</template>
```

```ts [anywhere.ts]
import { summon } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

const confirmed = await summon(ConfirmDialog)
if (confirmed) {
  await deleteFile()
}
```

That is the whole mental model: **summon a component, await its answer.** No `v-model:visible`, no teleport targets to manage, no event plumbing through three layers of parents.
