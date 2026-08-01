<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { useSummoned } from 'vue-summon'

const props = defineProps<{ title: string; progress: number }>()

const { dismiss } = useSummoned<string>()
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

const percent = computed(() => Math.min(100, Math.max(0, props.progress)))
</script>

<template>
  <div class="vs-overlay">
    <div class="vs-dialog">
      <h3>{{ title }}</h3>
      <div class="vs-progress-track">
        <div class="vs-progress-bar" :style="{ width: `${percent}%` }" />
      </div>
      <p style="margin-bottom: 16px">{{ percent }}%</p>
      <div class="vs-dialog-actions">
        <button class="vs-btn vs-btn-ghost" @click="dismiss()">
          {{ zh ? '取消任务' : 'Abort task' }}
        </button>
      </div>
    </div>
  </div>
</template>
