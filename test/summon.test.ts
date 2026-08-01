import { expect, test, vi, beforeEach } from 'vitest'
import { render } from 'vitest-browser-vue'
import { defineComponent, h } from 'vue'

import { SummonHost, createSummonManager, useSummoned, SummonDismissedError } from '../src/index'
import type { SummonManager } from '../src/index'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

const createTestApp = (manager: SummonManager) =>
  defineComponent({
    setup() {
      return () => h('div', [h(SummonHost, { manager }), h('span', 'ready')])
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

const FormDialog = defineComponent({
  props: {
    label: { type: String, required: true },
  },
  setup(props) {
    const { resolve, dismiss } = useSummoned<string>()
    return () =>
      h('div', { 'data-testid': 'form' }, [
        h('span', props.label),
        h('button', { onClick: () => resolve('submitted') }, 'submit'),
        h('button', { onClick: () => dismiss() }, 'cancel'),
      ])
  },
})

const ProgressDialog = defineComponent({
  props: {
    percent: { type: Number, required: true },
  },
  setup(props) {
    return () => h('div', { 'data-testid': 'progress' }, `${props.percent}%`)
  },
})

test('resolves value emitted via onResolve', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const promise = manager.summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()

  await screen.getByRole('button', { name: 'yes' }).click()
  expect(await promise).toBe(true)
})

test('chains user-provided onResolve listener', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const listener = vi.fn()
  const promise = manager.summon(ConfirmDialog, { onResolve: listener })

  await screen.getByRole('button', { name: 'yes' }).click()

  expect(await promise).toBe(true)
  expect(listener).toHaveBeenCalledWith(true)
})

test('useSummoned provides controller and props reactively', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const promise = manager.summon(FormDialog, { label: 'hello' })
  await expect.element(screen.getByText('hello')).toBeVisible()

  await screen.getByRole('button', { name: 'submit' }).click()
  expect(await promise).toBe('submitted')
})

test('dismiss rejects with SummonDismissedError', async () => {
  const manager = createSummonManager()
  await render(createTestApp(manager))

  const promise = manager.summon(FormDialog, { label: 'dismiss' })
  manager.dismiss()

  await expect(promise).rejects.toBeInstanceOf(SummonDismissedError)
})

test('same key returns the same instance', () => {
  const manager = createSummonManager()

  const a = manager.summon(ConfirmDialog, {}, { key: 'singleton' })
  const b = manager.summon(ConfirmDialog, {}, { key: 'singleton' })

  expect(a.id).toBe(b.id)
})

test('update patches props reactively', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const promise = manager.summon(ProgressDialog, { percent: 10 })
  await expect.element(screen.getByTestId('progress')).toHaveTextContent('10%')

  promise.update({ percent: 75 })
  await expect.element(screen.getByTestId('progress')).toHaveTextContent('75%')

  promise.dismiss()
  await expect(promise).rejects.toBeInstanceOf(SummonDismissedError)
})
