import { getCurrentScope, onScopeDispose } from 'vue'

import { defaultManager } from './manager'
import type { SummonManager } from './manager'
import type { SummonController } from './types'

export interface UseSummonOptions {
  manager?: SummonManager
}

export function useSummon(options: UseSummonOptions = {}): SummonManager['summon'] {
  const manager = options.manager ?? defaultManager
  const scope = getCurrentScope()
  const controllers = new Set<SummonController<any, any>>()

  if (scope) {
    onScopeDispose(() => {
      controllers.forEach((controller) => controller.dismiss())
      controllers.clear()
    })
  }

  return ((component, props, summonOptions) => {
    const promise = manager.summon(component, props, summonOptions)

    if (scope) {
      const controller = promise as SummonController<any, any>
      controllers.add(controller)
      const cleanup = (): void => {
        controllers.delete(controller)
      }
      promise.then(cleanup, cleanup)
    } else {
      console.warn(
        '[vue-summon] useSummon() should be called within an active effect scope to enable automatic cleanup on unmount.',
      )
    }

    return promise
  }) as SummonManager['summon']
}
