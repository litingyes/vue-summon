<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { useSummoned } from 'vue-summon'

defineProps<{ title: string; message: string }>()

const { resolve, dismiss } = useSummoned<boolean>()
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
</script>

<template>
  <div class="vs-overlay" @click.self="dismiss()">
    <div class="vs-dialog">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="vs-dialog-actions">
        <button class="vs-btn vs-btn-ghost" @click="resolve(false)">
          {{ zh ? '取消' : 'Cancel' }}
        </button>
        <button class="vs-btn vs-btn-brand" @click="resolve(true)">
          {{ zh ? '确认' : 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>
