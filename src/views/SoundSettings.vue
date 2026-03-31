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
  </div>
</template>

<script setup lang="ts">
import EqualizerPanel from '../components/EqualizerPanel.vue'
import HorizontalSlider from '../components/HorizontalSlider.vue'
import { useAudioSettings } from '../composables/useAudioSettings'

const { volume, updateVolume, eq, resetSettings, setEqPreset } = useAudioSettings()

const applyPreset = (name: any) => setEqPreset(name)
const handleUpdateVolume = (volume: any) => updateVolume(volume.value)
</script>
