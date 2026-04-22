<template>
  <div class="w-full h-full overflow-hidden">
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
let resizeObserver: ResizeObserver | null = null

/**
 * Handles canvas scaling for High DPI displays
 */
function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx || !frame.value) return

  const rect = canvas.getBoundingClientRect()
  const f = frame.value

  ctx.clearRect(0, 0, rect.width, rect.height)

  // Styling
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)'
  ctx.lineJoin = 'round'
  ctx.beginPath()

  for (let i = 0; i < f.length; i++) {
    // Normalize value (0.0 to 1.0)
    const v = Math.min(f[i], 50) / 50

    // X spreads across the width
    const x = (i / (f.length - 1)) * rect.width

    // Y starts at bottom (rect.height) and goes up (subtracting v)
    // We use 0.9 to leave 10% padding at the top
    const y = rect.height - v * rect.height * 0.9

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.stroke()
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  // Initialize FFT Client
  client = new FftClient({
    onFrame: (f) => (frame.value = f),
  })
  client.connect()

  // Initial resize and start loop
  resizeCanvas()
  raf = requestAnimationFrame(loop)

  // Handle window/container resizing
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    draw()
  })

  if (canvasRef.value?.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement)
  }
})

onUnmounted(() => {
  client?.disconnect()
  if (raf) cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
})
</script>
