<template>
  <div class="w-full h-full flex flex-col bg-slate-900 text-slate-100 relative">
    <div ref="containerRef" class="flex-1 relative overflow-hidden p-0 m-0">
      <canvas ref="canvasRef" class="absolute inset-0 w-full h-full block"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Assuming your API path is correct
import { FftClient, type FftFrame } from '@/api/fft-client'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const latestFrame = ref<FftFrame | null>(null)
const isConnectedRef = ref(false)

let client: FftClient | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null

// Stored dimensions (logical)
let logicalWidth = 0
let logicalHeight = 0
let centerX = 0
let centerY = 0

// --- PARTICLE SYSTEM CONFIG ---
const MAX_PARTICLES = 1500
const MAX_VALUE_NORMALIZER = 50 // Same as your previous clamping
const BASE_PARTICLE_SPEED = 0.5
const FREQUENCY_INFLUENCE = 4.0 // How much FFT energy boosts speed

// Define the Particle structure
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number // 0 to 1
  decay: number // how fast life decreases
  hue: number
  baseSize: number
  // Store the frequency bin index this particle reacts to
  binIndex: number
}

// The core particle state
const particles: Particle[] = []

// Helper to spawn a single particle
function spawnParticle(indexOverride?: number) {
  const angle = Math.random() * Math.PI * 2
  // Particles spawn slightly off-center
  const spawnRadius = 20 + Math.random() * 30

  // Assign a frequency bin to this particle.
  // We can bias this (e.g., more particles for bass) or distribute uniformly.
  const binIndex = Math.floor(Math.pow(Math.random(), 2) * (latestFrame.value?.length || 1024))
  // The Hue is derived from its assigned bin (creating color rings)
  const baseHue = 180 + (binIndex / (latestFrame.value?.length || 1024)) * 140

  const p: Particle = {
    x: centerX + Math.cos(angle) * spawnRadius,
    y: centerY + Math.sin(angle) * spawnRadius,
    vx: Math.cos(angle) * BASE_PARTICLE_SPEED,
    vy: Math.sin(angle) * BASE_PARTICLE_SPEED,
    life: 1.0,
    decay: 0.005 + Math.random() * 0.01,
    hue: baseHue,
    baseSize: 0.5 + Math.random() * 1.5,
    binIndex: binIndex,
  }

  if (typeof indexOverride === 'number') {
    particles[indexOverride] = p
  } else if (particles.length < MAX_PARTICLES) {
    particles.push(p)
  }
}

// Fill the pool initially
function initParticles() {
  particles.length = 0 // clear
  for (let i = 0; i < MAX_PARTICLES; i++) {
    spawnParticle()
  }
}

// --- CORE FFT CLIENT LOGIC (mostly unchanged) ---
function startClient() {
  client = new FftClient({
    onOpen: () => (isConnectedRef.value = true),
    onClose: () => (isConnectedRef.value = false),
    onError: () => (isConnectedRef.value = false),
    // Frame updates only store the frame, draw() reads it asynchronously
    onFrame: (frame) => {
      latestFrame.value = frame
      // Initialize if we haven't yet, now that we know frame length
      if (particles.length === 0 && frame.length > 0) {
        initParticles()
      }
    },
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
  centerX = logicalWidth / 2
  centerY = logicalHeight / 2
  // let maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)

  canvas.width = logicalWidth * dpr
  canvas.height = logicalHeight * dpr

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // We can also set global composite operation here for performance if needed
    // ctx.globalCompositeOperation = 'lighter'; // additive blending makes 'glow'
  }
}

// --- NEW PARTICLE DRAW FUNCTION ---
function draw() {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  const frame = latestFrame.value

  if (!canvas || !ctx) return

  // CLEAR: Use additive trailing for smoothness
  // Instead of full clear, draw a semi-transparent black rectangle
  ctx.fillStyle = 'rgba(15, 23, 42, 0.15)' // Matches bg-slate-900 but with alpha
  ctx.fillRect(0, 0, logicalWidth, logicalHeight)

  if (!frame || frame.length === 0) return
  if (particles.length === 0) return // Wait for init

  // Enable additive blending for glowing effects
  ctx.globalCompositeOperation = 'lighter'

  // Pre-calculate common factors for this frame

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // 1. UPDATE STATE based on FFT

    // Get energy for this particle's assigned bin, clamped 0-1
    const rawValue = frame[p.binIndex] || 0
    const binNorm = Math.max(0, Math.min(rawValue / MAX_VALUE_NORMALIZER, 1))

    // Frequency creates outward "thrust"
    // Apply speed boost proportional to normalized bin energy
    const speedBoost = binNorm * FREQUENCY_INFLUENCE

    // Radial direction vector (normalize current position relative to center)
    const dx = p.x - centerX
    const dy = p.y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Normalize and apply boost
    if (dist > 0) {
      p.vx = (dx / dist) * (BASE_PARTICLE_SPEED + speedBoost)
      p.vy = (dy / dist) * (BASE_PARTICLE_SPEED + speedBoost)
    }

    // Move particle
    p.x += p.vx
    p.y += p.vy

    // Age particle
    p.life -= p.decay

    // 2. RESPACE / RECYCLE CONDITIONS
    // Check boundaries or expiry
    const isOutOfBounds =
      p.x < -50 || p.x > logicalWidth + 50 || p.y < -50 || p.y > logicalHeight + 50
    const isExpired = p.life <= 0

    if (isOutOfBounds || isExpired) {
      spawnParticle(i) // Reuse the index
      continue // Skip drawing this expired particle
    }

    // 3. DRAW PARTICLE
    // Size reacts to frequency
    const currentSize = p.baseSize + binNorm * 4 // Expand on high energy

    // Alpha reacts to life AND frequency (flash on peaks)
    const finalAlpha = p.life * 0.7 + binNorm * 0.3

    // Lightness reacts to frequency (whiter peaks)
    const lightness = 60 + binNorm * 30

    ctx.fillStyle = `hsla(${p.hue}, 90%, ${lightness}%, ${finalAlpha})`

    ctx.beginPath()
    ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2)
    ctx.fill()
  }

  // Restore normal composite operation
  ctx.globalCompositeOperation = 'source-over'
}

function loop() {
  draw()
  animationId = requestAnimationFrame(loop)
}

onMounted(() => {
  startClient()
  resizeCanvas() // Initial size calculation
  // No need to call initParticles here, we wait for the first FFT frame
  animationId = requestAnimationFrame(loop)

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    // We don't re-init particles on resize, they just adapt to new boundaries
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
