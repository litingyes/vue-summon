# Key 与关闭

## Key 去重

传入 `options.key` 可保证每个 key 最多存在一个实例：

```ts
const a = summon(SettingsDialog, {}, { key: 'settings' })
const b = summon(SettingsDialog, {}, { key: 'settings' })

a === b // true —— 第二次调用返回已存在的控制器
```

这非常适合单例 UI：设置面板、「任务已在运行」守卫、或一次只显示一条的 toast。

## 从任意位置关闭

顶层辅助函数可直接操作默认管理器：

```ts
import { dismiss, dismissAll } from 'vue-summon'

dismiss('settings') // 按 key 关闭
dismiss(controller.id) // 或按实例 id 关闭
dismiss() // 不传参数：关闭全部实例
```

`dismiss()` 会以 `SummonDismissedError` 拒绝对应的 Promise，因此等待方可以把它与真正的异常区分开。

## `dismissAll(reason?)`

以可选的自定义原因拒绝**所有**打开的实例：

```ts
import { dismissAll } from 'vue-summon'

router.beforeEach(() => {
  dismissAll(new Error('route-changed'))
})
```

```ts
try {
  await summon(SearchPalette, {}, { key: 'palette' })
} catch (error) {
  if (error instanceof SummonDismissedError) {
    // 通过 dismiss() 关闭 —— 遮罩点击、关闭按钮、dismiss('palette')
  } else {
    // 通过 dismissAll('route-changed') 或自定义 reject(reason) 关闭
  }
}
```

## SummonDismissedError

```ts
class SummonDismissedError extends Error {
  name = 'SummonDismissedError'
}
```

当实例被「关闭」而非「解决」时，以此错误拒绝 Promise。这是库里唯一约定好的拒绝类型 —— 其余都由你自己定义。
