<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { summon, SummonDismissedError } from 'vue-summon'

import ProgressDialog from './ProgressDialog.vue'

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

const running = ref(false)
const result = ref('')

async function start() {
  if (running.value) return
  running.value = true
  result.value = zh.value ? '任务进行中…' : 'task running…'

  const task = summon(ProgressDialog, {
    title: zh.value ? '正在上传文件' : 'Uploading files',
    progress: 0,
  })

  let progress = 0
  const timer = setInterval(() => {
    progress = Math.min(100, progress + 4 + Math.random() * 10)
    task.update({ progress: Math.round(progress) })
    if (progress >= 100) {
      clearInterval(timer)
      setTimeout(() => task.resolve('done'), 350)
    }
  }, 320)

  try {
    await task
    result.value = zh.value ? 'resolve("done") → 上传完成' : 'resolve("done") → upload finished'
  } catch (error) {
    clearInterval(timer)
    if (error instanceof SummonDismissedError) {
      result.value = zh.value ? '任务被用户中止' : 'task aborted by user'
    }
  } finally {
    running.value = false
  }
}
</script>

<template>
  <div class="vs-demo">
    <button class="vs-btn vs-btn-brand" :disabled="running" @click="start">
      {{ running ? (zh ? '进行中…' : 'Running…') : zh ? '开始模拟任务' : 'Start mock task' }}
    </button>
    <div class="vs-demo-result">
      {{ zh ? '结果' : 'result' }}: <strong>{{ result || '—' }}</strong>
    </div>
  </div>
</template>
