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

/**
 * The Fire Visualizer Logic (Linear Mapping)
 */
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx || !frame.value) return

  const rect = canvas.getBoundingClientRect()
  const f = frame.value
  const len = f.length

  // Clear with a slight fade to create "motion trails" for the flames
  ctx.fillStyle = 'rgba(2, 6, 23, 0.25)' 
  ctx.fillRect(0, 0, rect.width, rect.height)

  // 1. Group Frequencies Linearly for Global Energy
  const getEnergy = (start: number, end: number) => {
    let sum = 0
    const count = end - start
    for (let i = start; i < end; i++) sum += f[i]
    return Math.min(sum / count, 50) / 50
  }

  // Linear splits: Bass (0-20%), Mid (20-60%), High (60-100%)
  const energyLow = getEnergy(0, Math.floor(len * 0.2))
  const energyMid = getEnergy(Math.floor(len * 0.2), Math.floor(len * 0.6))
  const energyHigh = getEnergy(Math.floor(len * 0.6), len)

  const time = performance.now() * 0.004
  const centerX = rect.width / 2
  const fireWidth = Math.min(rect.width * 0.85, 900)
  const startX = centerX - fireWidth / 2
  
  // Use 'lighter' for additive blending (overlap creates white-hot centers)
  ctx.globalCompositeOperation = 'lighter'

  // 2. The "Ember" Base (Driven by Bass)
  ctx.shadowBlur = 15 + energyLow * 50
  ctx.shadowColor = '#ff4400'
  ctx.fillStyle = `rgba(220, 60, 0, ${0.4 + energyLow * 0.4})`
  
  ctx.beginPath()
  // Ellipse base pulses with bass intensity
  ctx.ellipse(centerX, rect.height, fireWidth / 1.8, 25 + energyLow * 40, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // 3. Draw Procedural Flame Strands (Linear Mapping)
  const strandCount = 28 // Increased count for linear spread

  for (let i = 0; i < strandCount; i++) {
    // X-position is linear across the width
    const xBase = startX + (i / (strandCount - 1)) * fireWidth
    
    // FFT data index is linear: strand 0 = bin 0, last strand = last bin
    const fftIdx = Math.floor((i / (strandCount - 1)) * (len - 1))
    const strandEnergy = Math.min(f[fftIdx] || 0, 50) / 50

    // Dynamics: height is driven by both global mids and specific bin energy
    const h = (strandEnergy * 0.75 + energyMid * 0.25) * rect.height * 0.75 + 15
    
    // Movement: Sine wave waver + chaotic flicker from high frequencies
    const waver = Math.sin(time + i * 0.5) * (15 + energyMid * 40)
    const flicker = (Math.random() - 0.5) * (energyHigh * 40)
    
    const topX = xBase + waver + flicker
    const topY = rect.height - h

    // Create a vertical fire gradient
    const grad = ctx.createLinearGradient(0, rect.height, 0, topY)
    grad.addColorStop(0, 'rgba(180, 20, 0, 0.9)')    // Dark red at base
    grad.addColorStop(0.3, 'rgba(255, 100, 0, 0.7)')  // Orange body
    grad.addColorStop(0.7, 'rgba(255, 220, 80, 0.4)')  // Yellow tip
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')     // Fade to air

    ctx.strokeStyle = grad
    ctx.lineWidth = 1.5 + strandEnergy * 10
    ctx.lineCap = 'round'

    // Draw the flame strand as a Bezier curve
    ctx.beginPath()
    ctx.moveTo(xBase, rect.height - 5)
    
    // Curved control points for "licking" motion
    const cp1x = xBase + waver * 0.6
    const cp1y = rect.height - h * 0.3
    const cp2x = topX - waver * 0.4
    const cp2y = rect.height - h * 0.8

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, topX, topY)
    ctx.stroke()

    // 4. Occasional Embers (High frequency "sparks")
    if (energyHigh > 0.6 && Math.random() > 0.98) {
      ctx.fillStyle = '#ffcc00'
      ctx.beginPath()
      ctx.arc(topX, topY - 10, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Cleanup context state
  ctx.globalCompositeOperation = 'source-over'
  ctx.shadowBlur = 0
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

