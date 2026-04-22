<template>
  <div class="w-full h-full relative bg-slate-950 overflow-hidden">
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

let logicalWidth = 0
let logicalHeight = 0

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
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
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx || !frame.value) return

  // Motion blur effect
  ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'
  ctx.fillRect(0, 0, logicalWidth, logicalHeight)

  ctx.globalCompositeOperation = 'lighter'
  const f = frame.value
  const len = f.length

  for (let i = 0; i < len; i++) {
    const energy = Math.min(f[i], 50) / 50
    if (energy <= 0) continue

    const xBase = (i / len) * logicalWidth
    const h = energy * logicalHeight * 0.8
    const waver = Math.sin(Date.now() * 0.005 + i) * 20

    const topX = xBase + waver
    const topY = logicalHeight - h

    const grad = ctx.createLinearGradient(xBase, logicalHeight, topX, topY)
    grad.addColorStop(0, '#ff4400')
    grad.addColorStop(0.5, '#ffaa00')
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.strokeStyle = grad
    ctx.lineWidth = 2 + energy * 8
    ctx.beginPath()
    ctx.moveTo(xBase, logicalHeight)
    ctx.quadraticCurveTo(xBase + waver, logicalHeight - h / 2, topX, topY)
    ctx.stroke()
  }
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  client = new FftClient({ onFrame: (f) => (frame.value = f) })
  client.connect()
  resizeCanvas()
  resizeObserver = new ResizeObserver(() => resizeCanvas())
  resizeObserver.observe(canvasRef.value!)
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  client?.disconnect()
})
</script>
