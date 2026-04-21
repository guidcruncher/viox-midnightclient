<template>
  <!-- Fullscreen container -->
  <div
    class="w-full h-[70vh] flex flex-col text-slate-100 overflow-hidden rounded-xl border border border-slate-800 bg-slate-900"
  >
    <component :is="visualizerComponentToRender" v-if="ready" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { ApiClient } from '@/api'
import { visualizerComponent } from '@/visualizers/'

const ready = ref(false)
const visualizerComponentToRender = ref<ReturnType<typeof visualizerComponent> | null>(null)

onMounted(async () => {
  ready.value = false
  const visualizer = await ApiClient.getConfigKeyValue('visualizer')
  visualizerComponentToRender.value = await visualizerComponent(visualizer)
  ready.value = true
})
</script>
