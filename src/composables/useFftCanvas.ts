import { ref, onMounted, onUnmounted, type Ref } from 'vue'

import { FftClient, type FftFrame } from '@/api/fft-client'

/**
 * useFftCanvas
 * * A centralized engine for FFT-driven visualizers.
 * Features:
 * - High-DPI Canvas Scaling (Retina/4K support)
 * - Layout Caching (Prevents browser layout thrashing)
 * - Visibility Management (Closes socket when tab is backgrounded)
 * - Navigation Guard (Kills backend processes on refresh/exit)
 * - requestAnimationFrame Loop (Decoupled from network jitter)
 */
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

  // Logical dimensions used for math inside draw callbacks
  const dims = {
    width: 0,
    height: 0,
  }

  let client: FftClient | null = null
  let rafId: number | null = null
  let resizeObserver: ResizeObserver | null = null

  /**
   * Resizes the canvas context for High-DPI screens and
   * caches logical dimensions to avoid calling getBoundingClientRect
   * inside the high-frequency animation loop.
   */
  const updateSize = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Update cached logical dimensions
    dims.width = rect.width
    dims.height = rect.height

    // Set actual pixel buffer size
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Normalize coordinate system so we can draw in logical pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  /**
   * Core Render Loop
   */
  const loop = () => {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')

    if (ctx && latestFrame.value && dims.width > 0) {
      drawCallback(ctx, latestFrame.value, dims.width, dims.height)
    }
    rafId = requestAnimationFrame(loop)
  }

  /**
   * Connectivity Lifecycle:
   * Reconnects when user returns to tab, disconnects when user leaves.
   * This saves server CPU, bandwidth, and client battery.
   */
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('[FFT] Tab hidden: Suspending stream...')
      client?.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    } else {
      console.log('[FFT] Tab focused: Resuming stream...')
      client?.connect()
      rafId = requestAnimationFrame(loop)
    }
  }

  /**
   * Bulletproof Cleanup:
   * Ensures the socket is closed and the loop is stopped regardless
   * of how the user navigates away (Link click, Refresh, or Address Bar).
   */
  const fullCleanup = () => {
    if (rafId) cancelAnimationFrame(rafId)
    client?.disconnect()

    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('pagehide', fullCleanup)
    window.removeEventListener('beforeunload', fullCleanup)

    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  }

  onMounted(() => {
    // 1. Setup the FFT Client
    client = new FftClient({
      onFrame: (frame) => {
        // Updated frame is stored for the next RAF loop cycle
        latestFrame.value = frame
      },
    })

    // 2. Initial Sizing
    updateSize()

    // 3. Observers
    resizeObserver = new ResizeObserver(updateSize)
    if (canvasRef.value) {
      resizeObserver.observe(canvasRef.value)
    }

    // 4. Navigation & Visibility Listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', fullCleanup)
    window.addEventListener('beforeunload', fullCleanup)

    // 5. Start
    client.connect()
    rafId = requestAnimationFrame(loop)
  })

  onUnmounted(() => {
    // Handles Vue Router navigation (SPA internal transitions)
    fullCleanup()
  })

  return {
    latestFrame,
    dims,
  }
}
