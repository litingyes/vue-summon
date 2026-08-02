<div align="center">
  <img src="https://raw.githubusercontent.com/litingyes/vue-summon/release/docs/public/logo.svg" width="120" alt="Vue Summon logo" />
  <h1>Vue Summon</h1>
  <p>Imperatively render Vue components from anywhere — dialogs, toasts, modals, without cluttering your templates.</p>
  <p>
    <a href="https://www.npmjs.com/package/vue-summon"><img src="https://img.shields.io/npm/v/vue-summon" alt="npm version" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/npm/l/vue-summon" alt="license" /></a>
  </p>
</div>

**English** | [简体中文](https://github.com/litingyes/vue-summon/blob/release/README.zh-CN.md)

## Features

- **Imperative API** — call `summon(Component, props)` from event handlers, stores, routers — even outside component setup
- **Promise-based results** — every summons returns a Promise; `await` the user's choice instead of wiring `v-model` and callbacks
- **Zero template clutter** — no hidden dialog blocks in every page; one `<SummonHost />` renders everything
- **Live prop updates** — `controller.update()` patches props reactively, perfect for progress bars, wizards and forms
- **Key-based dedupe** — pass a `key` to guarantee a single instance; re-summoning returns the existing controller
- **Transitions built-in** — instances are teleported to `body` and wrapped in `<Transition>`, removed safely after leave
- **Multi-manager isolation** — `createSummonManager()` scopes instances per feature, per test, or per micro-frontend
- **Fully typed** — props and results are inferred from your component via `vue-component-type-helpers`

## Installation

```bash
pnpm add vue-summon
# or
npm install vue-summon
# or
yarn add vue-summon
```

Vue Summon has a single peer dependency: `vue@3`.

## Quick Start

**1. Mount the host** once, near your app root:

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

**2. Build a summoneable component** — `useSummoned()` gives it a controller:

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

**3. Summon it** from any component, store, or plain module:

```ts
import { summon, SummonDismissedError } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

try {
  const confirmed = await summon(ConfirmDialog, { title: 'Delete this file?' })
  if (confirmed) {
    await deleteFile()
  }
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // user closed the dialog without choosing
  }
}
```

That is the whole mental model: **summon a component, await its answer.**

## AI Agent Skill

This repository ships an [Agent Skill](https://agentskills.io) (`skills/vue-summon`) that teaches AI coding agents — Claude Code, OpenCode, Codex, Cursor and 70+ more — how to integrate and use Vue Summon correctly in your project.

Install it with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add litingyes/vue-summon
```

See the [Agent Skill guide](https://github.com/litingyes/vue-summon/blob/release/docs/guide/agent-skill.md) for options and details.

## Documentation

Full documentation lives in [`./docs`](https://github.com/litingyes/vue-summon/tree/release/docs) (VitePress, English + 简体中文):

```bash
pnpm docs:dev
```

- [Getting Started](https://github.com/litingyes/vue-summon/blob/release/docs/guide/getting-started.md)
- [Summoning Components](https://github.com/litingyes/vue-summon/blob/release/docs/guide/summon.md)
- [The Controller](https://github.com/litingyes/vue-summon/blob/release/docs/guide/controller.md)
- [Keys & Dismissal](https://github.com/litingyes/vue-summon/blob/release/docs/guide/key-and-dismiss.md)
- [Custom Managers](https://github.com/litingyes/vue-summon/blob/release/docs/guide/custom-manager.md)
- [API Reference](https://github.com/litingyes/vue-summon/blob/release/docs/api/index.md)

## License

[MIT](./LICENSE)
