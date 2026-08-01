# Live Examples

Everything on this page runs against the real library — click and see.

## Confirm dialog

The classic: `await` a boolean from the user. Clicking the overlay dismisses and rejects with `SummonDismissedError`.

<DemoConfirm />

::: details View source
<<< @/.vitepress/theme/components/DemoConfirm.vue
<<< @/.vitepress/theme/components/ConfirmDialog.vue
:::

## Toast

Fire-and-forget, or await how it ended — auto-closed or clicked away.

<DemoToast />

::: details View source
<<< @/.vitepress/theme/components/DemoToast.vue
<<< @/.vitepress/theme/components/ToastCard.vue
:::

## Progress with `update()`

The promise is also the controller: patch props while the task runs, resolve when done.

<DemoProgress />

::: details View source
<<< @/.vitepress/theme/components/DemoProgress.vue
<<< @/.vitepress/theme/components/ProgressDialog.vue
:::

## Key dedupe

Summoning twice with the same `key` returns the same controller — only one instance ever renders.

<DemoKey />

::: details View source
<<< @/.vitepress/theme/components/DemoKey.vue
<<< @/.vitepress/theme/components/KeyDialog.vue
:::
