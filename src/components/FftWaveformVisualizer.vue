<template>
  <div class="w-full h-full relative bg-slate-900">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

import { FftClient, type FftFrame } from "@/api/fft-client"

const canvasRef = ref<HTMLCanvasElement | null>(null)
const frame = ref<FftFrame | null>(null)

let client: FftClient | null = null
let raf: number | null = null
let resizeObserver: ResizeObserver | null = null

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, rect.width, rect.height)

  const f = frame.value
  if (!f) return

  ctx.lineWidth = 3
  ctx.strokeStyle = "rgba(0, 200, 255, 0.8)"
  ctx.beginPath()

  for (let i = 0; i < f.length; i++) {
    const v = Math.min(f[i], 50) / 50
    const x = (i / (f.length - 1)) * rect.width
    const y = rect.height * (0.5 - v * 0.4)

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
