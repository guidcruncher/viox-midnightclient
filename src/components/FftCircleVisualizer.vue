<template>
  <div class="w-full h-full relative bg-slate-900">
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

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, rect.width, rect.height)

  const f = frame.value
  if (!f) return

  const cx = rect.width / 2
  const cy = rect.height / 2
  const radius = Math.min(cx, cy) * 0.6

  for (let i = 0; i < f.length; i++) {
    const v = Math.min(f[i], 50) / 50
    const angle = (i / f.length) * Math.PI * 2

    const inner = radius
    const outer = radius + v * 40

    const x1 = cx + inner * Math.cos(angle)
    const y1 = cy + inner * Math.sin(angle)
    const x2 = cx + outer * Math.cos(angle)
    const y2 = cy + outer * Math.sin(angle)

    ctx.strokeStyle = `hsla(${180 + i * 2}, 80%, 60%, ${0.3 + v * 0.7})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  client = new FftClient({
    onFrame: (f) => (frame.value = f),
  })
  client.connect()

  raf = requestAnimationFrame(loop)

  resizeObserver = new ResizeObserver(() => draw())
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
