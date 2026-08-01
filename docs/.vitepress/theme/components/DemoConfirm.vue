<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { summon, SummonDismissedError } from 'vue-summon'

import ConfirmDialog from './ConfirmDialog.vue'

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

const result = ref('')

async function open() {
  result.value = zh.value ? '等待用户操作…' : 'waiting for user…'
  try {
    const ok = await summon(ConfirmDialog, {
      title: zh.value ? '删除这份文件？' : 'Delete this file?',
      message: zh.value
        ? '此操作无法撤销。对话框通过 Promise 把用户的选择返回给调用方。'
        : "This action cannot be undone. The dialog returns the user's choice to the caller via a Promise.",
    })
    result.value = ok
      ? zh.value
        ? 'resolve(true) → 已确认'
        : 'resolve(true) → confirmed'
      : zh.value
        ? 'resolve(false) → 已取消'
        : 'resolve(false) → canceled'
  } catch (error) {
    if (error instanceof SummonDismissedError) {
      result.value = zh.value
        ? 'reject(SummonDismissedError) → 点击遮罩关闭'
        : 'reject(SummonDismissedError) → dismissed via overlay'
    }
  }
}
</script>

<template>
  <div class="vs-demo">
    <button class="vs-btn vs-btn-brand" @click="open">
      {{ zh ? '打开确认对话框' : 'Open confirm dialog' }}
    </button>
    <div class="vs-demo-result">
      {{ zh ? '结果' : 'result' }}: <strong>{{ result || '—' }}</strong>
    </div>
  </div>
</template>
