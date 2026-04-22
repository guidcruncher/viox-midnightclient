<template>
  <div class="w-full h-full bg-slate-900">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useFftCanvas } from '@/composables/useFftCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)

useFftCanvas(canvasRef, (ctx, frame, width, height) => {
  ctx.clearRect(0, 0, width, height)
  const bins = frame.length
  const barWidth = width / bins

  for (let i = 0; i < bins; i++) {
    const norm = Math.max(0, Math.min(frame[i] / 50, 1))
    const barHeight = norm * height
    const x = i * barWidth

    ctx.fillStyle = `hsla(${180 + (i / bins) * 120}, 80%, 60%, ${0.3 + norm * 0.7})`
    const gap = barWidth * 0.1
    ctx.fillRect(x + gap, height - barHeight, barWidth - gap * 2, barHeight)
  }
})
</script>
