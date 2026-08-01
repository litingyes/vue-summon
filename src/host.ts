import { Teleport, Transition, defineComponent, h, provide } from 'vue'
import type { DefineComponent, PropType, TransitionProps } from 'vue'

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
  transition?: string | TransitionProps
}

export const SummonHost: DefineComponent<SummonHostProps> = defineComponent({
  props: {
    manager: {
      type: Object as PropType<SummonManager>,
      required: false,
      default: () => defaultManager,
    },
    transition: {
      type: [String, Object] as PropType<string | TransitionProps>,
      required: false,
    },
  },
  setup(props) {
    const manager = props.manager as SummonManager

    function buildTransitionProps(instance: SummonInstance): TransitionProps {
      if (!props.transition) {
        return {
          /* v8 ignore next */
          onAfterLeave: () => manager.remove(instance.id),
        }
      }

      if (typeof props.transition === 'string') {
        return {
          name: props.transition,
          /* v8 ignore next */
          onAfterLeave: () => manager.remove(instance.id),
        }
      }

      const userOnAfterLeave = props.transition.onAfterLeave
      return {
        ...props.transition,
        /* v8 ignore start */
        onAfterLeave: (el: Element): void => {
          if (Array.isArray(userOnAfterLeave)) {
            userOnAfterLeave.forEach((hook) => hook(el))
          } else {
            userOnAfterLeave?.(el)
          }
          manager.remove(instance.id)
        },
        /* v8 ignore stop */
      }
    }

    return () =>
      h(
        Teleport,
        { to: 'body' },
        manager.instances.map((instance) =>
          h(
            Transition,
            {
              key: instance.id,
              ...buildTransitionProps(instance),
            },
            () => (instance.visible.value ? h(InstanceWrapper, { instance }) : null),
          ),
        ),
      )
  },
})
