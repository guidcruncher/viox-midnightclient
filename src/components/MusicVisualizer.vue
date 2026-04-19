<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'

import { getBaseUrl } from '../utils/baseUrl'

const props = defineProps<{
  barColor?: string
  sensitivity?: number
}>()

// Template Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)

// State
const state = reactive({
  isConnected: false,
  error: '',
})

let socket: WebSocket | null = null
let animationId: number

const initCanvas = (canvas: HTMLCanvasElement) => {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
  return ctx
}

const draw = (data: Float32Array) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width / (window.devicePixelRatio || 1)
  const height = canvas.height / (window.devicePixelRatio || 1)

  ctx.clearRect(0, 0, width, height)

  const barSpacing = 4
  const barWidth = width / data.length - barSpacing
  const multiplier = props.sensitivity || 800

  data.forEach((magnitude, i) => {
    const barHeight = magnitude * multiplier
    const x = i * (barWidth + barSpacing)
    const y = height - barHeight

    // Create Gradient
    const hue = (i / data.length) * 280
    ctx.fillStyle = props.barColor || `hsl(${hue}, 80%, 50%)`

    // Draw Rounded Bar
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
    } else {
      ctx.fillRect(x, y, barWidth, barHeight)
    }
    ctx.fill()
  })
}

const connect = () => {
  const host = getBaseUrl().replace(/^http/, 'ws')
  const url = `${host}/api/ws/visualizer`
  socket = new WebSocket(url)
  socket.binaryType = 'arraybuffer'

  socket.onopen = () => {
    state.isConnected = true
    state.error = ''
  }

  socket.onmessage = (event: MessageEvent) => {
    const magnitudes = new Float32Array(event.data)
    // Use requestAnimationFrame for 60fps performance
    cancelAnimationFrame(animationId)
    animationId = requestAnimationFrame(() => draw(magnitudes))
  }

  socket.onerror = () => {
    state.error = 'WebSocket Error - Check Server'
  }

  socket.onclose = () => {
    state.isConnected = false
  }
}

onMounted(() => {
  if (canvasRef.value) {
    initCanvas(canvasRef.value)
    connect()
  }

  // Handle window resizing
  window.addEventListener('resize', () => canvasRef.value && initCanvas(canvasRef.value))
})

onUnmounted(() => {
  socket?.close()
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', () => canvasRef.value && initCanvas(canvasRef.value))
})
</script>

<template>
  <div class="visualizer-container">
    <div class="status-badge" :class="{ 'is-active': state.isConnected }">
      {{ state.isConnected ? 'LIVE' : 'DISCONNECTED' }}
    </div>

    <canvas ref="canvasRef" class="v-canvas"></canvas>

    <p v-if="state.error" class="error-msg">{{ state.error }}</p>
  </div>
</template>

<style scoped>
.visualizer-container {
  position: relative;
  width: 100%;
  height: 300px;
  background: #0a0a0a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.v-canvas {
  width: 100%;
  height: 100%;
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #444;
  transition: color 0.3s ease;
}

.status-badge.is-active {
  color: #00ff88;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
}

.error-msg {
  color: #ff4444;
  font-size: 12px;
  text-align: center;
}
</style>
