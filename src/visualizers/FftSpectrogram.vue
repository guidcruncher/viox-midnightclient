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
let resizeObserver: ResizeObserver | null = null

// --- OPTIMIZATIONS ---
let tempCanvas: HTMLCanvasElement | null = null
let logicalWidth = 0
let logicalHeight = 0
const SCROLL_SPEED = 2 // How many pixels to scroll per frame
// ---------------------

/**
 * Caches dimensions and sets up the offscreen buffer.
 * This prevents "Layout Thrashing" during the draw loop.
 */
function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  logicalWidth = rect.width
  logicalHeight = rect.height

  canvas.width = logicalWidth * dpr
  canvas.height = logicalHeight * dpr

  // Initialize or resize offscreen buffer
  if (!tempCanvas) tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !frame.value || !tempCanvas) return

  const ctx = canvas.getContext('2d')
  const tempCtx = tempCanvas.getContext('2d')
  if (!ctx || !tempCtx) return

  // 1. CAPTURE CURRENT STATE
  // Save the current canvas image to the offscreen buffer before we clear it
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
  tempCtx.drawImage(canvas, 0, 0)

  // 2. SCROLL
  // Clear the main canvas and draw the captured image back, shifted down
  ctx.clearRect(0, 0, logicalWidth, logicalHeight)
  ctx.drawImage(tempCanvas, 0, SCROLL_SPEED)

  // 3. DRAW NEW DATA
  const f = frame.value
  const barWidth = logicalWidth / f.length

  for (let i = 0; i < f.length; i++) {
    // Data is already throttled and peak-averaged from the server
    const v = Math.min(f[i], 50) / 50

    // Calculate "Heatmap" colors
    // We map frequency intensity to Hue (Blue -> Pink) and Lightness
    const hue = 200 + v * 100
    const lightness = v * 60 + 10

    ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`

    // Draw the new row of frequency data at the top (y=0)
    // We add +1 to barWidth to prevent gaps caused by sub-pixel rounding
    ctx.fillRect(i * barWidth, 0, barWidth + 1, SCROLL_SPEED)
  }
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  // Initialize SDK Client
  client = new FftClient({
    onFrame: (f) => (frame.value = f),
  })
  client.connect()

  // Initial sizing
  resizeCanvas()

  // Listen for window/container size changes
  resizeObserver = new ResizeObserver(() => resizeCanvas())
  if (canvasRef.value) resizeObserver.observe(canvasRef.value)

  // Start animation loop
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  client?.disconnect()
  // Clean up memory
  tempCanvas = null
})
</script>

<style scoped>
canvas {
  /* Ensure the canvas doesn't capture mouse events if not needed */
  pointer-events: none;
  /* Smooth out the scaling on some browsers */
  image-rendering: pixelated;
}
</style>
