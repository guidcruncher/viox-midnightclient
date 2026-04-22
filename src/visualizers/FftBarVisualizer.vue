<template>
  <div class="w-full h-full flex flex-col bg-slate-900 text-slate-100">
    <div ref="containerRef" class="flex-1 relative overflow-hidden p-0 m-0">
      <canvas ref="canvasRef" class="absolute inset-0 w-full h-full block"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { FftClient, type FftFrame } from '@/api/fft-client'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const latestFrame = ref<FftFrame | null>(null)

let client: FftClient | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null

// OPTIMIZATION: Cache dimensions to avoid layout thrashing
let logicalWidth = 0
let logicalHeight = 0

function startClient() {
  client = new FftClient({
    onFrame: (frame) => (latestFrame.value = frame),
  })
  client.connect()
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  logicalWidth = rect.width
  logicalHeight = rect.height

  canvas.width = logicalWidth * dpr
  canvas.height = logicalHeight * dpr

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function draw() {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!ctx || !latestFrame.value) return

  ctx.clearRect(0, 0, logicalWidth, logicalHeight)

  const frame = latestFrame.value
  const bins = frame.length
  const barWidth = logicalWidth / bins

  for (let i = 0; i < bins; i++) {
    // Normalization logic
    const norm = Math.max(0, Math.min(frame[i] / 50, 1))
    const barHeight = norm * logicalHeight
    const x = i * barWidth
    const y = logicalHeight - barHeight

    ctx.fillStyle = `hsla(${180 + (i / bins) * 120}, 80%, 60%, ${0.3 + norm * 0.7})`
    const gap = barWidth * 0.1
    ctx.fillRect(x + gap, y, barWidth - gap * 2, barHeight)
  }
}

function loop() {
  draw()
  animationId = requestAnimationFrame(loop)
}

onMounted(() => {
  startClient()
  resizeCanvas()
  animationId = requestAnimationFrame(loop)
  resizeObserver = new ResizeObserver(() => resizeCanvas())
  resizeObserver.observe(containerRef.value!)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  client?.disconnect()
})
</script>
