# Scoped Summoning

`summon()` is global: if you call it from a component and then that component unmounts, the summoned dialog stays open. `useSummon()` ties the lifecycle of the instances it creates to the active effect scope.

## Usage

```vue
<script setup lang="ts">
import { useSummon } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

const summon = useSummon()

async function onDelete() {
  const confirmed = await summon(ConfirmDialog, { title: 'Delete this file?' })
  if (confirmed) {
    await deleteFile()
  }
}
</script>
```

When the component unmounts, every instance created by `summon()` in this scope is automatically dismissed.

## Works with any effect scope

`useSummon()` is not limited to component setup. It works wherever there is an active effect scope:

```ts
import { effectScope } from 'vue'
import { useSummon } from 'vue-summon'
import Toast from './Toast.vue'

const scope = effectScope()

scope.run(() => {
  const summon = useSummon()
  summon(Toast, { message: 'Saved' })
})

// later
scope.stop() // all summoned instances created in this scope are dismissed
```

## Custom managers

Pass `manager` to target a custom [`SummonManager`](/guide/custom-manager):

```ts
const summon = useSummon({ manager: myManager })
```

## Caveat

`useSummon()` must be called inside an active effect scope. Outside a scope it still works, but it falls back to plain `summon()` and emits a console warning.

## Next steps

- [The Controller](/guide/controller) — drive instances manually
- [Custom Managers](/guide/custom-manager) — when multiple isolated summon registries are needed
