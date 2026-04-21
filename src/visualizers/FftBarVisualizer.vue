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
const isConnectedRef = ref(false)

let client: FftClient | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null

// We store these to avoid repeated getBoundingClientRect calls in the draw loop
let logicalWidth = 0
let logicalHeight = 0

function startClient() {
  client = new FftClient({
    onOpen: () => (isConnectedRef.value = true),
    onClose: () => (isConnectedRef.value = false),
    onError: () => (isConnectedRef.value = false),
    onFrame: (frame) => (latestFrame.value = frame),
  })
  client.connect()
}

function stopClient() {
  client?.disconnect()
  client = null
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  logicalWidth = rect.width
  logicalHeight = rect.height

  // Set internal buffer size
  canvas.width = logicalWidth * dpr
  canvas.height = logicalHeight * dpr

  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Reset any previous scaling and apply the new DPR scale
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear the canvas using logical coordinates (the transform handles the rest)
  ctx.clearRect(0, 0, logicalWidth, logicalHeight)

  const frame = latestFrame.value
  if (!frame || frame.length === 0) return

  const bins = frame.length
  const barWidth = logicalWidth / bins
  const maxValue = 50 // Adjust this if your FFT data range is different (e.g., 255)

  for (let i = 0; i < bins; i++) {
    // CLAMPING: This is the most critical line to prevent overflow.
    // We ensure norm is strictly between 0 and 1.
    const rawValue = frame[i] || 0
    const norm = Math.max(0, Math.min(rawValue / maxValue, 1))

    // Calculate height relative to logical container height
    const barHeight = norm * logicalHeight

    const x = i * barWidth
    // Ensure the bar starts at the bottom and grows UP
    const y = logicalHeight - barHeight

    const hue = 180 + (i / bins) * 120
    const alpha = 0.3 + norm * 0.7
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`

    // Width with a small 10% gap on each side
    const gap = barWidth * 0.1
    const w = barWidth - gap * 2

    // Draw the bar. y + barHeight will always equal logicalHeight.
    ctx.fillRect(x + gap, y, w, barHeight)
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

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  stopClient()
  if (animationId) cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
})
</script>
