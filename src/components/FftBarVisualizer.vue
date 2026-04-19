<template>
  <div class="w-full h-full flex flex-col bg-slate-900 text-slate-100">
    <div ref="containerRef" class="flex-1 relative overflow-hidden">
      <canvas ref="canvasRef" class="absolute inset-0 w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

import { FftClient, type FftFrame } from "@/api/fft-client"

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const latestFrame = ref<FftFrame | null>(null)
const isConnectedRef = ref(false)

let client: FftClient | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null

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

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const ctx = canvas.getContext("2d")
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function draw() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const rect = container.getBoundingClientRect()

  ctx.clearRect(0, 0, rect.width, rect.height)

  const frame = latestFrame.value
  if (!frame) return

  const bins = frame.length
  const barWidth = rect.width / bins
  const maxValue = 50

  for (let i = 0; i < bins; i++) {
    const value = Math.min(frame[i], maxValue)
    const norm = value / maxValue
    const barHeight = norm * rect.height

    const x = i * barWidth
    const y = rect.height - barHeight

    const hue = 180 + (i / bins) * 120
    const alpha = 0.3 + norm * 0.7
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`

    const w = barWidth * 0.7
    ctx.fillRect(x + (barWidth - w) / 2, y, w, barHeight)
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
    draw()
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
