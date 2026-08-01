# 作用域召唤

`summon()` 是全局的：如果你在组件里调用它，随后组件卸载，被召唤出的对话框仍会保持打开。`useSummon()` 把通过它创建的实例生命周期绑定到当前活跃的 effect scope 上。

## 用法

```vue
<script setup lang="ts">
import { useSummon } from 'vue-summon'
import ConfirmDialog from './ConfirmDialog.vue'

const summon = useSummon()

async function onDelete() {
  const confirmed = await summon(ConfirmDialog, { title: '确定删除这个文件吗？' })
  if (confirmed) {
    await deleteFile()
  }
}
</script>
```

当组件卸载时，该 scope 内通过 `summon()` 创建的所有实例都会自动关闭。

## 适用于任何 effect scope

`useSummon()` 不限于组件 setup。只要存在活跃的 effect scope 即可工作：

```ts
import { effectScope } from 'vue'
import { useSummon } from 'vue-summon'
import Toast from './Toast.vue'

const scope = effectScope()

scope.run(() => {
  const summon = useSummon()
  summon(Toast, { message: '已保存' })
})

// 之后
scope.stop() // 该 scope 内创建的所有被召唤实例都会关闭
```

## 自定义管理器

传入 `manager` 可指定自定义的 [`SummonManager`](/zh/guide/custom-manager)：

```ts
const summon = useSummon({ manager: myManager })
```

## 注意

`useSummon()` 必须在活跃的 effect scope 中调用。超出 scope 时它仍可工作，但会退化为普通 `summon()` 并输出控制台警告。

## 下一步

- [控制器](/zh/guide/controller) — 手动驱动实例
- [自定义管理器](/zh/guide/custom-manager) — 需要多个隔离的召唤注册表时
