<template>
  <div class="w-full h-full relative bg-slate-900 overflow-hidden">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import { FftClient, type FftFrame } from '@/api/fft-client'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const frame = ref<FftFrame | null>(null)

let client: FftClient | null = null
let raf: number | null = null

// We'll use an offscreen canvas to "scroll" the image efficiently
let tempCanvas: HTMLCanvasElement | null = null

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !frame.value) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = rect.width
  const height = rect.height

  // 1. Copy the current canvas to our temp storage
  if (!tempCanvas) {
    tempCanvas = document.createElement('canvas')
  }
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (tempCtx) tempCtx.drawImage(canvas, 0, 0)

  // 2. Clear and shift the main canvas down by 2 pixels
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(tempCanvas, 0, 2 / dpr, width, height)

  // 3. Draw the NEW frame at the very top (y = 0)
  const f = frame.value
  const barWidth = width / f.length

  for (let i = 0; i < f.length; i++) {
    const v = Math.min(f[i], 50) / 50 // Normalize 0 to 1

    // Create a "Heatmap" color based on intensity
    // Hue 200 (Blue) to 280 (Purple/Pink) or 0 (Red)
    const hue = 200 + v * 100
    const lightness = v * 60 + 10 // Darker when quiet, brighter when loud

    ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`

    // Draw a small 2px tall rectangle for this frequency at the top
    ctx.fillRect(i * barWidth, 0, barWidth + 1, 2)
  }
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
  client = new FftClient({ onFrame: (f) => (frame.value = f) })
  client.connect()

  initCanvas()
  window.addEventListener('resize', initCanvas)
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  client?.disconnect()
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', initCanvas)
})
</script>
