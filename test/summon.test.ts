import { expect, test, vi, beforeEach } from 'vitest'
import { render } from 'vitest-browser-vue'
import { defineComponent, h } from 'vue'

import {
  SummonHost,
  createSummonManager,
  defaultManager,
  dismiss,
  dismissAll,
  summon,
  useSummoned,
  SummonDismissedError,
} from '../src/index'
import type { SummonManager } from '../src/index'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  ;[...defaultManager.instances].forEach((instance) => defaultManager.remove(instance.id))
})

const createTestApp = (manager?: SummonManager) =>
  defineComponent({
    setup() {
      return () => h('div', [h(SummonHost, manager ? { manager } : {}), h('span', 'ready')])
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

test('top-level summon/dismiss/dismissAll use defaultManager', async () => {
  const screen = await render(createTestApp())

  const promise = summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()

  await screen.getByRole('button', { name: 'yes' }).click()
  expect(await promise).toBe(true)

  const promise2 = summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()
  dismiss()
  await expect(promise2).rejects.toBeInstanceOf(SummonDismissedError)

  const promise3 = summon(ConfirmDialog)
  await expect.element(screen.getByTestId('dialog')).toBeVisible()
  dismissAll('reason')
  await expect(promise3).rejects.toBe('reason')
})

test('useSummoned throws when called outside SummonHost', async () => {
  const BadChild = defineComponent({
    setup() {
      useSummoned()
      return () => h('div')
    },
  })
  const App = defineComponent({
    setup() {
      return () => h('div', [h(BadChild)])
    },
  })

  let error: Error | undefined
  try {
    await render(App)
  } catch (e) {
    error = e as Error
  }
  expect(error?.message).toBe(
    '[vue-summon] useSummoned() must be called inside a component rendered by <SummonHost />.',
  )
})
test('rejects value emitted via onReject', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const promise = manager.summon(ConfirmDialog)
  const rejection = expect(promise).rejects.toBe(false)

  await screen.getByRole('button', { name: 'no' }).click()
  await rejection
})

test('chains user-provided onReject listener', async () => {
  const manager = createSummonManager()
  const screen = await render(createTestApp(manager))

  const listener = vi.fn()
  const promise = manager.summon(ConfirmDialog, { onReject: listener })
  const rejection = expect(promise).rejects.toBe(false)

  await screen.getByRole('button', { name: 'no' }).click()

  await rejection
  expect(listener).toHaveBeenCalledWith(false)
})

test('dismiss by key and id, and ignores unknown keys', async () => {
  const manager = createSummonManager()
  await render(createTestApp(manager))

  const keyed = manager.summon(ConfirmDialog, {}, { key: 'keyed' })
  const keyedRejection = expect(keyed).rejects.toBeInstanceOf(SummonDismissedError)
  manager.dismiss('keyed')
  await keyedRejection

  const unkeyed = manager.summon(ConfirmDialog)
  const unkeyedRejection = expect(unkeyed).rejects.toBeInstanceOf(SummonDismissedError)
  manager.dismiss(unkeyed.id)
  await unkeyedRejection

  manager.remove(keyed.id)
  manager.remove(unkeyed.id)

  manager.dismiss(Symbol('unknown'))
  expect(manager.instances).toHaveLength(0)
})

test('resolve and reject are no-ops after settled', async () => {
  const manager = createSummonManager()
  await render(createTestApp(manager))

  const resolved = manager.summon(ConfirmDialog)
  resolved.resolve(true)
  resolved.resolve(false)
  expect(await resolved).toBe(true)

  const rejected = manager.summon(ConfirmDialog)
  rejected.reject('first')
  rejected.reject('second')
  await expect(rejected).rejects.toBe('first')
})

test('remove ignores unknown ids and instance.remove removes itself', async () => {
  const manager = createSummonManager()
  await render(createTestApp(manager))

  void manager.summon(ConfirmDialog)
  expect(manager.instances).toHaveLength(1)

  manager.remove(Symbol('unknown'))
  expect(manager.instances).toHaveLength(1)

  const instance = manager.instances[0] as { remove: () => void }
  instance.remove()
  expect(manager.instances).toHaveLength(0)
})

test('SummonDismissedError can carry a custom message', () => {
  const error = new SummonDismissedError('custom message')
  expect(error.name).toBe('SummonDismissedError')
  expect(error.message).toBe('custom message')
})
