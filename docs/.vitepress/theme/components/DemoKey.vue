<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { summon } from 'vue-summon'

import KeyDialog from './KeyDialog.vue'

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

const log = ref('')

function summonTwice() {
  const first = summon(KeyDialog, {}, { key: 'singleton' })
  const second = summon(KeyDialog, {}, { key: 'singleton' })
  log.value = zh.value
    ? `first === second → ${first === second}（同一个控制器，只渲染一个实例）`
    : `first === second → ${first === second} (same controller, one instance rendered)`
  void first.then(() => {
    log.value = zh.value ? '对话框已 resolve("ok")' : 'dialog resolved with "ok"'
  })
}
</script>

<template>
  <div class="vs-demo">
    <button class="vs-btn vs-btn-brand" @click="summonTwice">
      {{ zh ? '以相同 key 召唤两次' : 'Summon twice with the same key' }}
    </button>
    <div class="vs-demo-result">
      log: <strong>{{ log || '—' }}</strong>
    </div>
  </div>
</template>
