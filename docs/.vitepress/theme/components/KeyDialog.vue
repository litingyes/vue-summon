<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { useSummoned } from 'vue-summon'

const { resolve } = useSummoned<string>()
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
</script>

<template>
  <div class="vs-overlay">
    <div class="vs-dialog">
      <h3>{{ zh ? '唯一实例' : 'A unique instance' }}</h3>
      <p>
        {{
          zh
            ? '这个对话框使用 key: "singleton" 召唤。在它打开期间，再次以相同 key 召唤不会创建新实例，而是返回同一个控制器。'
            : 'This dialog was summoned with key: "singleton". While it is open, summoning again with the same key returns the same controller instead of creating a new instance.'
        }}
      </p>
      <div class="vs-dialog-actions">
        <button class="vs-btn vs-btn-brand" @click="resolve('ok')">
          {{ zh ? '知道了' : 'Got it' }}
        </button>
      </div>
    </div>
  </div>
</template>
