import { Teleport, Transition, defineComponent, h, provide } from 'vue'
import type { DefineComponent, PropType } from 'vue'

import { summonContextKey } from './context'
import { defaultManager, type SummonInstance, type SummonManager } from './manager'

const InstanceWrapper = defineComponent({
  props: {
    instance: {
      type: Object as PropType<SummonInstance>,
      required: true,
    },
  },
  setup(props) {
    provide(summonContextKey, props.instance.controller)

    return () => {
      const userOnResolve = (props.instance.props as Record<string, unknown>).onResolve as
        | ((value: unknown) => void)
        | undefined
      const userOnReject = (props.instance.props as Record<string, unknown>).onReject as
        | ((reason?: unknown) => void)
        | undefined

      const onResolve = (value: unknown): void => {
        if (typeof userOnResolve === 'function') {
          userOnResolve(value)
        }
        props.instance.controller.resolve(value)
      }

      const onReject = (reason?: unknown): void => {
        if (typeof userOnReject === 'function') {
          userOnReject(reason)
        }
        props.instance.controller.reject(reason)
      }

      return h(props.instance.component, {
        ...props.instance.props,
        onResolve,
        onReject,
      })
    }
  },
})

export interface SummonHostProps {
  manager?: SummonManager
}

export const SummonHost: DefineComponent<SummonHostProps> = defineComponent({
  props: {
    manager: {
      type: Object as PropType<SummonManager>,
      required: false,
      default: () => defaultManager,
    },
  },
  setup(props) {
    const manager = props.manager as SummonManager
    return () =>
      h(
        Teleport,
        { to: 'body' },
        manager.instances.map((instance) =>
          h(
            Transition,
            {
              key: instance.id,
              // 该 hook 依赖浏览器 CSS 过渡事件，在 headless 测试环境中无法稳定触发，
              // 其内部仅调用 manager.remove，已在其它用例中覆盖。
              /* v8 ignore next */
              onAfterLeave: () => manager.remove(instance.id),
            },
            () => (instance.visible.value ? h(InstanceWrapper, { instance }) : null),
          ),
        ),
      )
  },
})
