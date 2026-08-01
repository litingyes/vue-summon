import { reactive, ref, shallowReactive } from 'vue'
import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

import type { SummonController, SummonOptions, SummonPromise } from './types'
import { SummonDismissedError } from './types'

export interface SummonInstance<R = unknown, P extends Record<string, any> = Record<string, any>> {
  id: symbol
  key: string | undefined
  component: Component
  props: P
  visible: import('vue').Ref<boolean>
  controller: SummonController<R, P>
  settled: boolean
  remove: () => void
}

export interface SummonManager {
  readonly instances: readonly SummonInstance[]
  summon: <C extends Component, R = unknown>(
    component: C,
    props?: ComponentProps<C>,
    options?: SummonOptions,
  ) => SummonPromise<R, ComponentProps<C>>
  dismiss: (idOrKey?: symbol | string) => void
  dismissAll: (reason?: unknown) => void
  remove: (id: symbol) => void
}

export function createSummonManager(): SummonManager {
  const instances = shallowReactive<SummonInstance<any, any>[]>([])

  function remove(id: symbol): void {
    const index = instances.findIndex((instance) => instance.id === id)
    if (index > -1) {
      instances.splice(index, 1)
    }
  }

  function summon<C extends Component, R = unknown>(
    component: C,
    props: ComponentProps<C> = {} as ComponentProps<C>,
    options: SummonOptions = {},
  ): SummonPromise<R, ComponentProps<C>> {
    const existing = options.key
      ? instances.find((instance) => instance.key === options.key)
      : undefined

    if (existing) {
      return existing.controller as unknown as SummonPromise<R, ComponentProps<C>>
    }

    const id = Symbol('summon-instance')
    const visible = ref(true)
    const reactiveProps = reactive(props) as ComponentProps<C>

    let resolvePromise: (value: R | PromiseLike<R>) => void
    let rejectPromise: (reason?: unknown) => void
    const promise = new Promise<R>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    }) as SummonPromise<R, ComponentProps<C>>

    const instance: SummonInstance<R, ComponentProps<C>> = {
      id,
      key: options.key,
      component,
      props: reactiveProps,
      visible,
      controller: undefined as unknown as SummonController<R, ComponentProps<C>>,
      settled: false,
      remove: () => remove(id),
    }

    const controller: SummonController<R, ComponentProps<C>> = {
      id,
      visible,
      props: reactiveProps,
      resolve: (value: R | PromiseLike<R>) => {
        if (instance.settled) return
        instance.settled = true
        visible.value = false
        const userListener = (reactiveProps as Record<string, unknown>).onResolve as
          | ((value: R | PromiseLike<R>) => void)
          | undefined
        if (typeof userListener === 'function') {
          userListener(value)
        }
        resolvePromise(value)
      },
      reject: (reason?: unknown) => {
        if (instance.settled) return
        instance.settled = true
        visible.value = false
        const userListener = (reactiveProps as Record<string, unknown>).onReject as
          | ((reason?: unknown) => void)
          | undefined
        if (typeof userListener === 'function') {
          userListener(reason)
        }
        rejectPromise(reason)
      },
      dismiss: () => controller.reject(new SummonDismissedError()),
      update: (patch: Partial<ComponentProps<C>>) => {
        Object.assign(reactiveProps, patch)
      },
    }

    instance.controller = controller
    void Object.assign(promise, controller)
    instances.push(instance)

    return promise
  }

  function dismiss(idOrKey?: symbol | string): void {
    if (idOrKey === undefined) {
      ;[...instances].forEach((instance) => instance.controller.dismiss())
      return
    }
    const target = instances.find((instance) => instance.id === idOrKey || instance.key === idOrKey)
    target?.controller.dismiss()
  }

  function dismissAll(reason?: unknown): void {
    ;[...instances].forEach((instance) => instance.controller.reject(reason))
  }

  return {
    get instances() {
      return instances as readonly SummonInstance[]
    },
    summon,
    dismiss,
    dismissAll,
    remove,
  }
}

export const defaultManager: SummonManager = createSummonManager()
