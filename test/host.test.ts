import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import type { TransitionProps } from 'vue'
import { defineComponent, h } from 'vue'

import { SummonHost, createSummonManager, SummonDismissedError } from '../src/index'
import type { SummonManager } from '../src/index'

const createTestApp = (manager: SummonManager, transition?: string | TransitionProps) =>
  defineComponent({
    setup() {
      return () => h('div', [h(SummonHost, { manager, transition }), h('span', 'ready')])
    },
  })

const ConfirmDialog = defineComponent({
  emits: ['resolve', 'reject'],
  setup(_props, { emit }) {
    return () =>
      h('div', { 'data-testid': 'dialog' }, [
        h('span', 'confirm?'),
        h('button', { onClick: () => emit('resolve', true) }, 'yes'),
        h('button', { onClick: () => emit('reject', false) }, 'no'),
      ])
  },
})

test('works without transition prop', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const promise = manager.summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()

  await screen.getByRole('button', { name: 'yes' }).click()
  expect(await promise).toBe(true)
})

test('works with string transition', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager, 'fade'))

  const promise = manager.summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()

  await screen.getByRole('button', { name: 'yes' }).click()
  expect(await promise).toBe(true)
})

test('works with object transition', async () => {
  const manager = createSummonManager()
  const transition: TransitionProps = { css: false }
  const screen = await render(createTestApp(manager, transition))

  const promise = manager.summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()

  await screen.getByRole('button', { name: 'yes' }).click()
  expect(await promise).toBe(true)
})

test('dismisses with object transition', async () => {
  const manager = createSummonManager()
  const transition: TransitionProps = { css: false }
  const screen = await render(createTestApp(manager, transition))

  const promise = manager.summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()

  manager.instances[0].controller.dismiss()
  await expect(promise).rejects.toBeInstanceOf(SummonDismissedError)
})
