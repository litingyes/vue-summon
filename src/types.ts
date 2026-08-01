import type { Ref } from 'vue'

export interface SummonOptions {
  key?: string
}

export class SummonDismissedError extends Error {
  constructor(message = 'Summoned component was dismissed') {
    super(message)
    this.name = 'SummonDismissedError'
  }
}

export interface SummonController<
  R = unknown,
  P extends Record<string, any> = Record<string, any>,
> {
  readonly id: symbol
  readonly visible: Ref<boolean>
  readonly props: P
  resolve: (value: R | PromiseLike<R>) => void
  reject: (reason?: unknown) => void
  dismiss: () => void
  update: (patch: Partial<P>) => void
}

export type SummonPromise<
  R = unknown,
  P extends Record<string, any> = Record<string, any>,
> = Promise<R> & SummonController<R, P>
