<template>
  <div
    class="w-full h-full p-6 bg-gradient-to-b from-black/40 to-black/70 backdrop-blur-xl text-gray-200 rounded-3xl flex flex-col gap-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold tracking-wide">Sound Settings</h2>
      <button
        class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
        @click="resetSettings"
      >
        Reset
      </button>
    </div>

    <div class="bg-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <span class="text-sm tracking-wide">Master Volume</span>
        <span class="text-sm opacity-70">{{ volume }}%</span>
      </div>

      <HorizontalSlider
        v-model="volume"
        :min="0"
        :max="100"
        id="global"
        width="w-full"
        @changed="handleUpdateVolume"
      />
    </div>

    <div class="min-h-[350px] w-full">
      <!-- Equalizer -->
      <EqualizerPanel
        height="h-full"
        :bands="eq"
        @preset="applyPreset"
        class="bg-white/5 rounded-2xl p-5"
      />
    </div>

    <div class="bg-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <span class="text-sm tracking-wide">Speakers</span>
      </div>
      <div v-for="item in speakers" :key="item.id">
        <div class="flex items-center gap-4 text-sm text-slate-200" v-if="!item.connected">
          <!-- Red LED -->
          <div class="flex items-center gap-2">
            <span
              class="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.9)]"
            >
              <span class="absolute inset-0 rounded-full bg-red-400 opacity-60 blur-[2px]"></span>
            </span>
            <span class="uppercase tracking-wide text-xs text-red-300">Offline</span>
          </div>

          <!-- Green LED -->
          <div class="flex items-center gap-2" v-if="item.connected">
            <span
              class="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            >
              <span
                class="absolute inset-0 rounded-full bg-emerald-300 opacity-60 blur-[2px]"
              ></span>
            </span>
            <span class="uppercase tracking-wide text-xs text-emerald-300">Online</span>
          </div>
        </div>
        {{ item.name }}
        <HorizontalSlider
          v-model="item.volumePercent"
          :min="0"
          :max="100"
          :id="item.id"
          width="w-full"
          @changed="updateSpeakerVolume"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { ApiClient } from '@/api'

import { useAudioSettings } from '../composables/useAudioSettings'

const { volume, updateVolume, eq, resetSettings, setEqPreset } = useAudioSettings()

const applyPreset = (name: any) => setEqPreset(name)
const handleUpdateVolume = (volume: any) => updateVolume(volume.value)

const speakers = ref([] as any[])

const updateSpeakerVolume = async (payload: { id: string | number; value: number }) => {
  await ApiClient.setSpeakerVolume(String(payload.id), payload.value)
}

onMounted(async () => {
  speakers.value = (await ApiClient.getSpeakers()).data as any[]
})
</script>
