<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue';

import { getBaseUrl } from '../utils/baseUrl';

const host = getBaseUrl().replace(/^http/, 'ws');
const props = defineProps<{ sensitivity?: number }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const state = reactive({ isConnected: false });
let socket: WebSocket | null = null;
let animationId: number | null = null;

// Use a ref for the data so we can verify it's updating
const currentMagnitudes = ref<Float32Array>(new Float32Array(64));

const cleanup = () => {
  if (animationId) cancelAnimationFrame(animationId);
  if (socket) {
    socket.onmessage = null;
    socket.close();
    socket = null;
  }
  state.isConnected = false;
};

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  // 1. CLEAR MUST HAPPEN EVERY FRAME
  ctx.clearRect(0, 0, w, h);

  const data = currentMagnitudes.value;
  const barSpacing = 2;
  const barWidth = (w / data.length) - barSpacing;
  const multiplier = props.sensitivity || 1200;

  for (let i = 0; i < data.length; i++) {
    const mag = data[i];
    
    // 2. Ensure we aren't drawing "nothing"
    let barHeight = mag * multiplier;
    if (barHeight > h) barHeight = h;
    if (barHeight < 1) continue; 

    const x = i * (barWidth + barSpacing);
    const y = h - barHeight;

    ctx.fillStyle = `hsl(${(i / data.length) * 280}, 80%, 50%)`;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  // Loop the animation
  animationId = requestAnimationFrame(draw);
};

const connect = () => {
  cleanup();
  const url = `${host}/api/fft`;
  socket = new WebSocket(url);
  socket.binaryType = 'arraybuffer';

  socket.onopen = () => {
    state.isConnected = true;
    // Start drawing loop only once connected
    animationId = requestAnimationFrame(draw);
  };

  socket.onmessage = (event) => {
    // 3. UPDATING THE DATA
    // Verify the buffer length matches (64 bins * 4 bytes for Float32 = 256 bytes)
    if (event.data.byteLength > 0) {
      currentMagnitudes.value = new Float32Array(event.data);
    }
  };
};

onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const dpr = window.devicePixelRatio || 1;
    
    // Match physical pixels to CSS pixels
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    
    connect();
  }
});

onBeforeUnmount(cleanup);
</script>

<template>
  <div class="vis-box">
    <canvas ref="canvasRef" style="width: 100%; height: 100%;"></canvas>
  </div>
</template>

<style scoped>
.vis-box { width: 100%; height: 200px; background: #000; overflow: hidden; }
</style>