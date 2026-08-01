import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

import { useSummoned, summonContextKey } from './context'
import { SummonHost, type SummonHostProps } from './host'
import {
  createSummonManager,
  defaultManager,
  type SummonInstance,
  type SummonManager,
} from './manager'
import type { SummonController, SummonOptions, SummonPromise } from './types'
import { SummonDismissedError } from './types'

export {
  createSummonManager,
  defaultManager,
  SummonHost,
  useSummoned,
  summonContextKey,
  SummonDismissedError,
}
export type {
  SummonController,
  SummonHostProps,
  SummonInstance,
  SummonManager,
  SummonOptions,
  SummonPromise,
}

export function summon<C extends Component, R = unknown>(
  component: C,
  props?: ComponentProps<C>,
  options?: SummonOptions,
): SummonPromise<R, ComponentProps<C>> {
  return defaultManager.summon(component, props, options)
}

export function dismiss(idOrKey?: symbol | string): void {
  return defaultManager.dismiss(idOrKey)
}

export function dismissAll(reason?: unknown): void {
  return defaultManager.dismissAll(reason)
}
