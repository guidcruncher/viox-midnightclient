<template>
  <!-- Fullscreen container -->
  <div
    class="w-full h-full flex flex-col text-slate-100 overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
    v-if="ready && isVisual"
  >
    <component :is="visualizerComponentToRender" class="flex-1" />
  </div>

  <div class="fixed inset-0 flex items-center justify-center" v-if="ready && !isVisual">
    <Clock :is24Hour="is24Hour" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { ApiClient } from '@/api'
import { visualizerComponent } from '@/visualizers/'

onBeforeRouteLeave((to, from) => {
  if (from.name === 'dashboard') {
    window.location.href = to.fullPath
    return false
  }
})

const isVisual = ref(true)
const is24Hour = ref(true)
const ready = ref(false)
const visualizerComponentToRender = ref<ReturnType<typeof visualizerComponent> | null>(null)

onMounted(async () => {
  ready.value = false
  const visualizer = await ApiClient.getConfigKeyValue('visualizer')

  if (visualizer != 'clock') {
    isVisual.value = true
    visualizerComponentToRender.value = await visualizerComponent(visualizer)
  } else {
    isVisual.value = false
  }

  ready.value = true
})
</script>
