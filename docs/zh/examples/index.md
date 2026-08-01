# 在线示例

本页所有示例都运行在真实的库上 —— 点一点，亲眼看看。

## 确认对话框

经典场景：`await` 用户给出的布尔值。点击遮罩会关闭对话框并以 `SummonDismissedError` 拒绝。

<DemoConfirm />

::: details 查看源码
<<< @/.vitepress/theme/components/DemoConfirm.vue
<<< @/.vitepress/theme/components/ConfirmDialog.vue
:::

## Toast

发后即忘；也可以等待它的结局 —— 自动关闭，或被点击关闭。

<DemoToast />

::: details 查看源码
<<< @/.vitepress/theme/components/DemoToast.vue
<<< @/.vitepress/theme/components/ToastCard.vue
:::

## 用 `update()` 推送进度

Promise 同时也是控制器：任务运行中随时修补 props，完成后 resolve。

<DemoProgress />

::: details 查看源码
<<< @/.vitepress/theme/components/DemoProgress.vue
<<< @/.vitepress/theme/components/ProgressDialog.vue
:::

## Key 去重

以相同的 `key` 召唤两次会返回同一个控制器 —— 永远只渲染一个实例。

<DemoKey />

::: details 查看源码
<<< @/.vitepress/theme/components/DemoKey.vue
<<< @/.vitepress/theme/components/KeyDialog.vue
:::

## 过渡动画

在宿主上为所有实例设置默认过渡动画，或透传完整的 `TransitionProps` 对象：

```vue
<template>
  <SummonHost transition="fade" />
  <!-- 或 -->
  <SummonHost :transition="{ name: 'zoom', mode: 'out-in' }" />
</template>
```
