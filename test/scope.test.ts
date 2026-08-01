import { expect, test, vi } from 'vitest'
import { defineComponent, effectScope, h } from 'vue'

import { createSummonManager, defaultManager, SummonDismissedError, useSummon } from '../src/index'

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

test('summons and resolves with a custom manager', async () => {
  const manager = createSummonManager()
  const scope = effectScope()

  const promise = scope.run(() => {
    const summon = useSummon({ manager })
    return summon(ConfirmDialog)
  })

  expect(manager.instances).toHaveLength(1)
  manager.instances[0].controller.resolve(true)

  expect(await promise).toBe(true)
  scope.stop()
})

test('dismisses pending instances when effect scope stops', async () => {
  const manager = createSummonManager()
  const scope = effectScope()

  const promise = scope.run(() => {
    const summon = useSummon({ manager })
    return summon(ConfirmDialog)
  })

  scope.stop()

  await expect(promise).rejects.toBeInstanceOf(SummonDismissedError)
})

test('does not re-dismiss already settled instances when scope stops', async () => {
  const manager = createSummonManager()
  const scope = effectScope()

  const promise = scope.run(() => {
    const summon = useSummon({ manager })
    return summon(ConfirmDialog)
  })

  manager.instances[0].controller.resolve('ok')
  expect(await promise).toBe('ok')

  expect(() => scope.stop()).not.toThrow()
})

test('tracks multiple instances and dismisses all on scope stop', async () => {
  const manager = createSummonManager()
  const scope = effectScope()

  const results = scope.run(() => {
    const summon = useSummon({ manager })
    return [summon(ConfirmDialog, {}, { key: 'a' }), summon(ConfirmDialog, {}, { key: 'b' })]
  })

  expect(results).toBeDefined()
  const [first, second] = results!

  expect(manager.instances).toHaveLength(2)

  scope.stop()

  await expect(first).rejects.toBeInstanceOf(SummonDismissedError)
  await expect(second).rejects.toBeInstanceOf(SummonDismissedError)
})

test('uses defaultManager when no manager is provided', async () => {
  const scope = effectScope()

  const promise = scope.run(() => {
    const summon = useSummon()
    return summon(ConfirmDialog)
  })

  expect(defaultManager.instances).toHaveLength(1)

  scope.stop()

  await expect(promise).rejects.toBeInstanceOf(SummonDismissedError)
})

test('warns and falls back to plain summon when called outside an effect scope', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const manager = createSummonManager()

  const summon = useSummon({ manager })
  const promise = summon(ConfirmDialog)

  expect(manager.instances).toHaveLength(1)
  expect(warn).toHaveBeenCalledWith(
    '[vue-summon] useSummon() should be called within an active effect scope to enable automatic cleanup on unmount.',
  )

  manager.instances[0].controller.dismiss()
  warn.mockRestore()

  return expect(promise).rejects.toBeInstanceOf(SummonDismissedError)
})
