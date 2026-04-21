<script setup lang="ts">
import type { MediaItem } from '../types'

import { onMounted, ref } from 'vue'

import { ApiClient } from '@/api'

import { usePlayer } from '../composables/usePlayer'

// Reactive state for the queue
const { currentTrack } = usePlayer()
const tracks = ref<MediaItem[]>([])
const ready = ref(false)

const formatDuration = (ms?: number): string => {
  if (!ms) return '--:--'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const isPlaying = (track: MediaItem) => {
  if (!currentTrack.value) return false
  return currentTrack.value.id === track.id
}

const clearQueue = async () => {
  ready.value = false
  await ApiClient.clearQueue(true)
  tracks.value = []
  ready.value = true
}

const deleteTrack = async (index: any) => {
  ready.value = false
  await ApiClient.deleteTrackInQueue(index)
  tracks.value = await ApiClient.getQueue()
  ready.value = true
}

const selectTrack = async (index: any) => {
  const res = await ApiClient.selectTrackInQueue(index)
  if (res) {
    currentTrack.value = res
    tracks.value = await ApiClient.getQueue()
  }
}

onMounted(async () => {
  tracks.value = await ApiClient.getQueue()
  ready.value = true
})
</script>

<template>
  <div class="w-full animate-slide-up relative">
    <!-- Queue Header -->
    <div class="flex items-center justify-between mb-6 px-2">
      <h3 class="font-display text-xs uppercase tracking-[0.2em] text-white/40 font-bold">
        Up Next
      </h3>

      <div class="flex items-center gap-3">
        <button
          @click.stop="selectTrack(tracks[0])"
          class="glass p-2 rounded-full text-viox-ice/60 hover:text-viox-electric transition-colors"
        >
          <LucideIcon name="Play" :size="18" />
        </button>

        <button
          @click="clearQueue"
          class="glass p-2 rounded-full text-viox-ice/60 hover:text-viox-electric transition-colors"
          title="Clear Queue"
        >
          <LucideIcon name="Trash2" :size="20" />
        </button>
      </div>
    </div>

    <!-- Scrollable List -->
    <div
      v-if="ready"
      class="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-viox pr-1 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[1.9rem] px-5 py-5 shadow-preset-inset"
    >
      <div
        v-for="(track, index) in tracks"
        :key="track.id"
        class="flex items-center gap-4 transition-all hover:bg-white/5 cursor-pointer group active:scale-[0.98]"
        :class="{ 'border-viox-electric/30 active-glow': isPlaying(track) }"
      >
        <!-- Album Art / Playing Animation -->
        <div class="relative w-12 h-12 shrink-0">
          <img
            :src="track.imageUrl"
            class="rounded-lg object-cover w-full h-full transition-all"
            :class="{ 'grayscale group-hover:grayscale-0': !isPlaying(track) }"
            alt="cover"
          />
          <div
            v-if="isPlaying(track)"
            class="absolute inset-0 flex items-center justify-center bg-viox-deep/60 rounded-lg"
          >
            <div class="flex gap-1 items-end h-3">
              <div class="w-1 bg-viox-electric rounded-full animate-bar-1"></div>
              <div class="w-1 bg-viox-electric rounded-full animate-bar-2"></div>
              <div class="w-1 bg-viox-electric rounded-full animate-bar-3"></div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="flex-1 min-w-0" @click.stop="selectTrack(track.id)">
          <h4
            class="font-semibold truncate text-sm transition-colors"
            :class="isPlaying(track) ? 'text-white' : 'text-viox-ice/60 group-hover:text-white'"
          >
            {{ track.title }}
          </h4>
          <p class="text-viox-ice/60 text-xs truncate">{{ track.artist }}</p>
        </div>

        <!-- Actions / Time -->
        <div class="flex items-center gap-3">
          <button
            @click.stop="selectTrack(track.id)"
            class="glass p-2 rounded-full text-viox-ice/60 hover:text-viox-electric transition-colors"
          >
            <LucideIcon name="Play" :size="18" />
          </button>
          <button
            @click.stop="deleteTrack(index)"
            class="glass p-2 rounded-full text-viox-ice/60 hover:text-viox-electric transition-colors"
          >
            <LucideIcon name="Trash2" :size="18" />
          </button>

          <div class="text-viox-ice/60 font-mono text-xs tabular-nums pr-2">
            {{ formatDuration(track.durationMs) }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="tracks.length === 0" class="py-12 text-center glass rounded-2xl">
        <p class="text-viox-lilac/40 text-sm">Your queue is empty</p>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="mt-6 flex gap-3"></div>
  </div>
</template>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.viox-gradient-text {
  background: linear-gradient(135deg, #a0dfff 0%, #c8a2c8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.active-glow {
  position: relative;
}
.active-glow::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #8a2be2;
  border-radius: 99px;
  box-shadow: 0 0 10px #8a2be2;
}

/* Audio Visualizer Animations */
@keyframes bar-grow {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 12px;
  }
}

.animate-bar-1 {
  animation: bar-grow 1s infinite;
}
.animate-bar-2 {
  animation: bar-grow 1.2s infinite;
}
.animate-bar-3 {
  animation: bar-grow 0.8s infinite;
}
</style>
