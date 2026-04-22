<template>
  <div class="w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useFftCanvas } from '@/composables/useFftCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)

useFftCanvas(canvasRef, (ctx, frame, width, height) => {
  ctx.clearRect(0, 0, width, height)
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(cx, cy) * 0.6

  for (let i = 0; i < frame.length; i++) {
    const v = Math.max(0, Math.min(frame[i] / 50, 1))
    const angle = (i / frame.length) * Math.PI * 2

    const x1 = cx + radius * Math.cos(angle)
    const y1 = cy + radius * Math.sin(angle)
    const x2 = cx + (radius + v * 50) * Math.cos(angle)
    const y2 = cy + (radius + v * 50) * Math.sin(angle)

    ctx.strokeStyle = `hsla(${180 + i * 2}, 80%, 60%, ${0.4 + v * 0.6})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
})
</script>
