<template>
  <div class="w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useFftCanvas } from '@/composables/useFftCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let tempCanvas: HTMLCanvasElement | null = null

useFftCanvas(canvasRef, (ctx, frame, width, height) => {
  const dpr = window.devicePixelRatio || 1

  if (!tempCanvas) tempCanvas = document.createElement('canvas')
  if (tempCanvas.width !== width * dpr) {
    tempCanvas.width = width * dpr
    tempCanvas.height = height * dpr
  }

  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return

  // 1. Copy current to temp
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
  tempCtx.drawImage(ctx.canvas, 0, 0)

  // 2. Scroll main down
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(tempCanvas, 0, 2)

  // 3. Draw new row at top
  const barWidth = width / frame.length
  for (let i = 0; i < frame.length; i++) {
    const v = Math.max(0, Math.min(frame[i] / 50, 1))
    ctx.fillStyle = `hsl(${200 + v * 100}, 80%, ${v * 60 + 10}%)`
    ctx.fillRect(i * barWidth, 0, barWidth + 1, 2)
  }
})
</script>
