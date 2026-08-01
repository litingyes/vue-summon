import { inject } from 'vue'
import type { InjectionKey } from 'vue'

import type { SummonController } from './types'

export const summonContextKey: InjectionKey<SummonController<any, any>> =
  Symbol('vue-summon-context')

export function useSummoned<
  R = unknown,
  P extends Record<string, any> = Record<string, any>,
>(): SummonController<R, P> {
  const controller = inject(summonContextKey, null)
  if (!controller) {
    throw new Error(
      '[vue-summon] useSummoned() must be called inside a component rendered by <SummonHost />.',
    )
  }
  return controller as SummonController<R, P>
}
