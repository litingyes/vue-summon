<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { summon } from 'vue-summon'

import ToastCard from './ToastCard.vue'

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

const count = ref(0)
const result = ref('')

async function push() {
  count.value += 1
  const message = zh.value ? `这是第 ${count.value} 条通知` : `Notification #${count.value}`
  const reason = await summon(ToastCard, { message })
  result.value = zh.value ? `toast resolve("${reason}")` : `toast resolved with "${reason}"`
}
</script>

<template>
  <div class="vs-demo">
    <button class="vs-btn vs-btn-brand" @click="push">
      {{ zh ? '弹出一个 Toast' : 'Push a toast' }}
    </button>
    <div class="vs-demo-result">
      {{ zh ? '结果' : 'result' }}: <strong>{{ result || '—' }}</strong>
    </div>
  </div>
</template>
