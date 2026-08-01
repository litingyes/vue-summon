<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useSummoned } from 'vue-summon'

defineProps<{ message: string }>()

const { resolve } = useSummoned<string>()
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  timer = setTimeout(() => resolve('auto-closed'), 2600)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="vs-toast" @click="resolve('clicked')">
    <span class="vs-toast-dot" />
    <span>{{ message }}</span>
    <span style="opacity: 0.55; font-size: 12px">{{ zh ? '点击关闭' : 'click to close' }}</span>
  </div>
</template>
