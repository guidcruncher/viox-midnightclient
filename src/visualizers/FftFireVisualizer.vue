<template>
  <div class="w-full h-full bg-slate-950 overflow-hidden">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useFftCanvas } from '@/composables/useFftCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)

/**
 * Natural Fire Visualization Logic
 * Logic:
 * 1. PERSISTENCE: We don't clear the screen fully, creating "smoke" trails.
 * 2. BLENDING: 'lighter' mode makes overlapping flames look like hot white cores.
 * 3. PHYSICS: Quadratic curves simulate the "lick" of a flame rising against air.
 */
useFftCanvas(canvasRef, (ctx, frame, width, height) => {
  // 1. MOTION BLUR & FADE
  // We use a low alpha fill to let previous frames linger, mimicking heat dissipation.
  ctx.fillStyle = 'rgba(2, 6, 23, 0.22)'
  ctx.fillRect(0, 0, width, height)

  // 2. ADDITIVE BLENDING
  // This causes colors to sum up to white where they overlap (volumetric lighting effect).
  ctx.globalCompositeOperation = 'lighter'

  const len = frame.length
  const spacing = width / len
  const time = Date.now() * 0.002 // Slow, organic time constant

  for (let i = 0; i < len; i++) {
    // Normalize intensity (0 to 1).
    // We use a higher divisor (60) to keep the fire from "hitting the ceiling" too easily.
    const intensity = Math.max(0, Math.min(frame[i] / 60, 1))

    // Ignore silent bins to save CPU
    if (intensity < 0.02) continue

    const xBase = i * spacing + spacing / 2

    // Height buoyancy: Lower frequencies (index 0-10) act as the heavy "logs" of the fire
    const isBass = i < 10
    const heightMult = isBass ? 0.9 : 0.6
    const flameHeight = intensity * height * heightMult

    // 3. TURBULENCE & SWAY
    // Different sine frequencies based on index 'i' prevent the fire from moving like a solid block.
    const waverAmount = 25 * intensity
    const waver = Math.sin(time + i * 0.4) * waverAmount

    const topX = xBase + waver
    const topY = height - flameHeight

    // 4. HEAT GRADIENT
    // Creates the transition from deep red embers to bright yellow cores.
    const grad = ctx.createLinearGradient(xBase, height, topX, topY)
    grad.addColorStop(0, '#550500') // Deep base
    grad.addColorStop(0.1, '#FF2200') // Dark Orange
    grad.addColorStop(0.4, '#FF9900') // Bright Orange
    grad.addColorStop(0.7, '#FFEF00') // Yellow Flame
    grad.addColorStop(1, 'transparent') // Tip of the flame

    ctx.strokeStyle = grad
    // Strands are thicker at the bottom and react to audio energy
    ctx.lineWidth = 1.0 + intensity * 15
    ctx.lineCap = 'round'

    // 5. THE "LICK" (Quadratic Curve)
    // Using a quadratic curve instead of a straight line simulates fluid dynamics.
    ctx.beginPath()
    ctx.moveTo(xBase, height)

    // Control point is pushed further by the waver to exaggerate the "wind" effect
    const cpX = xBase + waver * 1.8
    const cpY = height - flameHeight * 0.5

    ctx.quadraticCurveTo(cpX, cpY, topX, topY)
    ctx.stroke()

    // 6. EMBERS (Particle Sparks)
    // Occasionally spawn small white/yellow dots at the peaks of high-energy strands
    if (intensity > 0.75 && Math.random() > 0.96) {
      ctx.fillStyle = '#FFDD99'
      ctx.beginPath()
      ctx.arc(topX, topY - Math.random() * 20, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Restore normal blending for next cycle
  ctx.globalCompositeOperation = 'source-over'
})
</script>

<style scoped>
canvas {
  /* CSS POST-PROCESSING: 
     A tiny blur softens the jagged canvas lines, 
     while contrast makes the 'lighter' blending pop.
  */
  filter: blur(0.8px) contrast(1.3) saturate(1.2);
  image-rendering: auto;
}
</style>
