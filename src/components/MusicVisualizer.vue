<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, onBeforeUnmount } from 'vue';

import { getBaseUrl } from '../utils/baseUrl';

const host = getBaseUrl().replace(/^http/, 'ws');

const props = defineProps<{
  sensitivity?: number; // Recommended: 100 - 300 with new scaling
  gap?: number;        // Space between bars
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const state = reactive({ isConnected: false });
let socket: WebSocket | null = null;
let animationId: number | null = null;

// Persistence for smoothing (prevents flickering)
let previousMagnitudes = new Float32Array(64);

const cleanup = () => {
  if (animationId) cancelAnimationFrame(animationId);
  if (socket) {
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.close();
    socket = null;
  }
  state.isConnected = false;
};

const draw = (data: Float32Array) => {
  const canvas = canvasRef.value;
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  // 1. Clear the entire canvas
  ctx.clearRect(0, 0, w, h);
  
  const barSpacing = props.gap ?? 2;
  const barWidth = (w / data.length) - barSpacing;
  
  // 2. Constants for audio "feel"
  const NOISE_GATE = 0.01;  // Ignore anything below this level
  const SMOOTHING = 0.2;    // How much of the NEW data to use (0.1 to 1.0)

  data.forEach((mag, i) => {
    // 3. Noise Gate & Smoothing
    // We blend the new value with the old value to stop the "shaking"
    let val = mag < NOISE_GATE ? 0 : mag;
    val = (val * SMOOTHING) + (previousMagnitudes[i] * (1 - SMOOTHING));
    previousMagnitudes[i] = val;

    // 4. Logarithmic-like scaling 
    // This makes the bars "pop" more when music is playing
    const scale = props.sensitivity || 150;
    let barHeight = Math.sqrt(val) * scale;

    // 5. Clamp to canvas height
    if (barHeight > h) barHeight = h;
    if (barHeight < 0) barHeight = 0;

    // 6. Draw from the bottom
    const x = i * (barWidth + barSpacing);
    const y = h - barHeight;

    const hue = (i / data.length) * 280;
    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
    
    // Logic: fillRect(x, startY, width, heightToDrawDown)
    ctx.fillRect(x, y, barWidth, barHeight);
  });
};

const connect = () => {
  cleanup();
  const url = `${host}/api/ws/visualizer`;
  socket = new WebSocket(url);
  socket.binaryType = 'arraybuffer';

  socket.onopen = () => {
    state.isConnected = true;
  };

  socket.onmessage = (event) => {
    const magnitudes = new Float32Array(event.data);
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(() => draw(magnitudes));
  };

  socket.onerror = () => { cleanup(); };
  socket.onclose = () => { state.isConnected = false; };
};

onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const dpr = window.devicePixelRatio || 1;
    
    // Set internal resolution
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    
    connect();
  }
});

onBeforeUnmount(() => cleanup());
onUnmounted(() => cleanup());
</script>

<template>
  <div class="vis-box">
    <div :class="['status', { active: state.isConnected }]">
      {{ state.isConnected ? '● LIVE' : '○ OFFLINE' }}
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.vis-box {
  width: 100%;
  height: 200px;
  background: #000;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0,0,0,1);
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.status {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 10px;
  font-weight: bold;
  color: #333;
  pointer-events: none;
}
.status.active {
  color: #00ff88;
}
</style>