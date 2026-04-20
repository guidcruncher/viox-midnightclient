<template>
  <!-- Fullscreen container -->
  <div
    class="w-full h-[70vh] flex flex-col text-slate-100 overflow-hidden rounded-xl border border border-slate-800 bg-slate-900"
  >
    <component :is="visualizerComponentToRender" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { visualizerComponent } from '@/visualizers/'

const visualizerComponentToRender = computed(() => visualizerComponent())
</script>
