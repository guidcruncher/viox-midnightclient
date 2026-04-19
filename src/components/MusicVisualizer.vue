<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, onBeforeUnmount } from 'vue';

import { getBaseUrl } from '../utils/baseUrl';

const host = getBaseUrl().replace(/^http/, 'ws');

const props = defineProps<{
  sensitivity?: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const state = reactive({ isConnected: false });
let socket: WebSocket | null = null;
let animationId: number | null = null;

// Persistent buffer to smooth out the frame-to-frame "jitter"
const smoothMagnitudes = new Float32Array(64);

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
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);
  
  const barSpacing = 2;
  const barWidth = (w / data.length) - barSpacing;
  const multiplier = props.sensitivity || 1200; // Adjusted for noise gate
  const SMOOTHING_FACTOR = 0.25; // 0.0 - 1.0 (Lower is smoother)

  data.forEach((mag, i) => {
    // 1. Interpolate between current value and new value (Lerp)
    smoothMagnitudes[i] = (mag * SMOOTHING_FACTOR) + (smoothMagnitudes[i] * (1 - SMOOTHING_FACTOR));

    // 2. Calculate Height (Ensure it's strictly positive)
    let barHeight = Math.max(0, smoothMagnitudes[i] * multiplier);

    // 3. Ignore heights less than 1 pixel (Noise cutoff)
    if (barHeight < 1) return;
    if (barHeight > h) barHeight = h;

    // 4. Coordinate Fix: y = total height - bar height
    const x = i * (barWidth + barSpacing);
    const y = h - barHeight;

    const hue = (i / data.length) * 280;
    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
    ctx.fillRect(x, y, barWidth, barHeight);
  });
};

const connect = () => {
  cleanup();
  const url = `${host}/api/ws/visualizer`;
  socket = new WebSocket(url);
  socket.binaryType = 'arraybuffer';

  socket.onopen = () => { state.isConnected = true; };
  socket.onmessage = (event) => {
    const magnitudes = new Float32Array(event.data);
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(() => draw(magnitudes));
  };
  socket.onclose = () => { state.isConnected = false; };
};

onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    canvas.getContext('2d')?.scale(dpr, dpr);
    connect();
  }
});

onBeforeUnmount(cleanup);
onUnmounted(cleanup);
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
}
canvas {
  width: 100%;
  height: 100%;
}
.status {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 10px;
  color: #444;
}
.status.active { color: #00ff88; }
</style>