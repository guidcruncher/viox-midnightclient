<template>
  <div class="w-full h-full overflow-hidden bg-black flex items-center justify-center">
    <canvas ref="canvasRef" class="max-w-full max-h-full object-contain"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useFftCanvas } from '@/composables/useFftCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const img = new Image()
const imageLoaded = ref(false)

// Change this to your image path
img.src = '/visuals/image.png'
img.onload = () => {
  imageLoaded.value = true
}

useFftCanvas(canvasRef, (ctx, frame, width, height) => {
  if (!imageLoaded.value) return

  // 1. Calculate Audio Metrics
  let bass = 0
  for (let i = 0; i < 10; i++) bass += frame[i]
  const intensity = Math.min(bass / 800, 1) // 0 to 1

  // 2. Clear and setup Canvas
  ctx.clearRect(0, 0, width, height)

  // Center calculations
  const imgWidth = img.width
  const imgHeight = img.height
  const ratio = Math.min(width / imgWidth, height / imgHeight)
  const drawWidth = imgWidth * ratio
  const drawHeight = imgHeight * ratio
  const offX = (width - drawWidth) / 2
  const offY = (height - drawHeight) / 2

  // 3. Draw the Animated Image (Grid Mesh)
  const rows = 20
  const cols = 20
  const cellW = drawWidth / cols
  const cellH = drawHeight / rows

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Get audio data mapped to this specific grid coordinate
      const fftIndex = Math.floor(((x + y) / (rows + cols)) * frame.length * 0.5)
      const frequencyValue = (frame[fftIndex] || 0) / 255

      // Calculate Displacement (The "Wobble")
      // Bass makes it pulse out, high frequencies make it jitter
      const distortion = frequencyValue * 15 * intensity
      const offsetX = Math.sin(Date.now() * 0.005 + x) * distortion
      const offsetY = Math.cos(Date.now() * 0.005 + y) * distortion

      // Draw the "slice" of the image
      ctx.drawImage(
        img,
        (x * img.width) / cols,
        (y * img.height) / rows, // Source X, Y
        img.width / cols,
        img.height / rows, // Source W, H
        offX + x * cellW + offsetX,
        offY + y * cellH + offsetY, // Destination X, Y
        cellW + 1,
        cellH + 1 // Destination W, H (+1 to avoid gaps)
      )
    }
  }

  // 4. Optional: Add a Glow Overlay based on intensity
  if (intensity > 0.5) {
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = `rgba(255, 100, 200, ${(intensity - 0.5) * 0.2})`
    ctx.fillRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'source-over'
  }
})
</script>
