// src/composables/useFftCanvas.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

import { FftClient, type FftFrame } from '@/api/fft-client'

export function useFftCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  drawCallback: (
    ctx: CanvasRenderingContext2D,
    frame: FftFrame,
    width: number,
    height: number
  ) => void
) {
  const latestFrame = ref<FftFrame | null>(null)
  const logicalWidth = ref(0)
  const logicalHeight = ref(0)

  let client: FftClient | null = null
  let rafId: number | null = null
  let resizeObserver: ResizeObserver | null = null

  // Update canvas dimensions without triggering layout thrashing
  const updateSize = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    logicalWidth.value = rect.width
    logicalHeight.value = rect.height

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const loop = () => {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')

    if (ctx && latestFrame.value && logicalWidth.value > 0) {
      drawCallback(ctx, latestFrame.value, logicalWidth.value, logicalHeight.value)
    }
    rafId = requestAnimationFrame(loop)
  }

  onMounted(() => {
    // 1. Setup Networking
    client = new FftClient({
      onFrame: (frame) => {
        latestFrame.value = frame
      },
    })
    client.connect()

    // 2. Setup Sizing
    updateSize()
    resizeObserver = new ResizeObserver(updateSize)
    if (canvasRef.value) resizeObserver.observe(canvasRef.value)

    // 3. Start Loop
    rafId = requestAnimationFrame(loop)
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver?.disconnect()
    client?.disconnect()
  })

  return {
    latestFrame,
    logicalWidth,
    logicalHeight,
  }
}
