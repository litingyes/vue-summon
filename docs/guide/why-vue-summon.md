# Why Vue Summon

Dialogs, toasts, drawers and modals share an awkward trait: **they are triggered by logic, not by layout.** Yet the declarative Vue way forces you to pre-declare them in templates.

## The declarative tax

A single confirm dialog typically costs you:

```vue
<script setup>
const visible = ref(false)
let resolver

function askDelete() {
  visible.value = true
  return new Promise((resolve) => {
    resolver = resolve
  })
}
</script>

<template>
  <button @click="askDelete">Delete</button>
  <Teleport to="body">
    <Dialog
      v-if="visible"
      @confirm="
        resolver(true)
        visible = false
      "
      @cancel="
        resolver(false)
        visible = false
      "
    />
  </Teleport>
</template>
```

Multiply this by every dialog in every page, add teleport targets, transitions, stacking and cleanup — and the incidental complexity dwarfs the actual feature.

## The summon model

Vue Summon flips the flow: **call the component like a function, await it like a promise.**

```ts
import { summon } from 'vue-summon'

const confirmed = await summon(ConfirmDialog, { title: 'Delete this file?' })
```

- The component is rendered by a single `<SummonHost />` mounted once at the app root.
- `resolve(value)` inside the component fulfills the promise and closes the instance.
- `reject(reason)` / `dismiss()` rejects it, so `try/catch` maps naturally to user cancellation.
- Props are reactive and can be patched after the fact with `controller.update()`.

## When it shines

- **Confirm / alert flows** — `await` the answer inline, right where the action happens.
- **Toasts & notifications** — fire and forget, or await dismissal.
- **Wizards & async tasks** — push progress via `update()` while the task runs.
- **Store / router / interceptor code** — summon UI from outside components entirely.

## When declarative is still better

Persistent, layout-bound UI (sidebars, inline popovers, form fields) belongs in templates. Vue Summon targets **transient, logic-driven overlays** — use each tool where it fits.
