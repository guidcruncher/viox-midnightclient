<template>
  <div class="flex items-center justify-center min-h-screen">
    <div
      class="w-full max-w-[390px] h-screen md:h-[844px] md:rounded-[3.5rem] border-x-0 md:border-[10px] border-slate-900 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden flex flex-col pb-10"
    >
      <div class="px-8 pt-12 flex justify-between items-center z-10">
        <button
          @click.stop="showPresets"
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-xl text-[10px] font-bold tracking-widest uppercase border border-white/5"
        >
          <LucideIcon name="Heart" :size="20" />
        </button>
      </div>

      <!-- Album Art -->
      <div
        class="flex flex-col items-center justify-center px-8 transition-all duration-500 flex-1"
      >
        <div
          class="relative transition-all duration-500 rounded-3xl overflow-hidden border border-white/10 shadow-2xl w-3/4 aspect-square"
        >
          <img :src="currentTrack.img" class="w-full h-full object-cover" />
        </div>
        <div class="text-center mt-6">
          <h1 class="text-2xl font-black tracking-tighter text-white uppercase italic">
            {{ currentTrack.title }}
          </h1>
          <p class="text-blue-400 font-bold tracking-widest text-[10px] uppercase opacity-70">
            {{ currentTrack.subtitle }}
          </p>
        </div>
      </div>

      <!-- Controls -->
      <div
        class="bg-slate-900/40 backdrop-blur-2xl mx-4 mb-8 rounded-[2.5rem] p-6 space-y-8 border border-white/5"
      >
        <!-- Playback -->
        <div class="flex flex-col items-center gap-6">
          <div class="flex items-center justify-between w-full px-4">
            <button @click.stop="previous" class="text-slate-500 hover:text-blue-400">
              <LucideIcon name="SkipBack" :size="24" class="fill-current" />
            </button>
            <button @click.stop="stop" class="text-slate-500 hover:text-red-500">
              <LucideIcon name="Square" :size="24" class="fill-current ml-1" />
            </button>
            <button
              @click.stop="togglePlay"
              class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20"
            >
              <LucideIcon name="Play" v-if="!playing" :size="24" class="fill-current ml-1" />
              <LucideIcon name="Pause" v-if="playing" :size="24" class="fill-current ml-1" />
            </button>
            <button @click.stop="next" class="text-slate-500 hover:text-blue-400">
              <LucideIcon name="SkipForward" :size="24" class="fill-current" />
            </button>
          </div>

          <!-- Volume -->
          <div
            class="w-full flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-white/5"
          >
            <HorizontalSlider
              v-model="volume"
              :min="0"
              :max="100"
              id="global"
              width="w-full"
              @changed="handleUpdateVolume"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PRESET OVERLAY -->
  <div
    v-if="presetVisible"
    class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-2xl flex flex-col"
  >
    <!-- Titlebar -->
    <div
      class="flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-xl border-b border-white/10"
    >
      <h2 class="text-white font-black tracking-widest uppercase text-sm">Quick Presets</h2>

      <button
        @click="presetVisible = false"
        class="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <LucideIcon name="X" :size="18" class="text-white" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 text-white">
      <SquareCard
        v-for="item in presets"
        :key="item.id"
        :item="item"
        :active="currentTrack?.id === item.id && playing"
        @play="handleSelect"
        @toggle-play="handleSelect"
        @toggle-favourite="handleToggleFavourite(item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayer } from "../composables/usePlayer"
import { useAudioSettings } from "../composables/useAudioSettings"
import { ref, onMounted } from "vue"
import { dashboardApi } from "../api/dashboard"
import type { MediaItem } from "../types"

const presetVisible = ref(false)
const presets = ref<MediaItem[]>([])

const { toggleFavourite, playItem, currentTrack, playing, previous, next, stop, togglePlay } =
  usePlayer()
const { volume, updateVolume } = useAudioSettings()

const handleUpdateVolume = (volume: any) => updateVolume(volume.value)

const handleToggleFavourite = async (item: any) => {
  await toggleFavourite(item)
  await loadPresetsData()
}

const handleSelect = async (item: any) => {
  await playItem(item)
  presetVisible.value = false
}

const showPresets = async () => {
  await loadPresetsData()
  presetVisible.value = true
}

const loadPresetsData = async () => {
  const presetsData = await dashboardApi.getPresets()
  presets.value = presetsData
}

onMounted(async () => {
  await loadPresetsData()
})
</script>
