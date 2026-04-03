<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

import { ApiClient } from '@/api'
import { useAudioSettings } from '@/composables/useAudioSettings'

const audio = useAudioSettings()
const presets = ref<string[]>([])
const reverbs = ref<any[]>([])
const reverb = ref<any>({ enabled: false, filename: 'bypass.wav', gain: 1, delay: 0 })
const ready =  ref(false)

// Band keys come directly from the composable's eq object
const bandKeys = computed(() => (audio.eq.value ? Object.keys(audio.eq.value) : []))

// Slider range
const min = -12
const max = 12

const valueToPercent = (v: number) => ((v - min) / (max - min)) * 100
const percentToValue = (p: number) => min + (p / 100) * (max - min)

let activeKey: string | null = null

const startDrag = (key: string, e: MouseEvent | TouchEvent) => {
  activeKey = key
  updateFromEvent(e)

  window.addEventListener('mousemove', updateFromEvent)
  window.addEventListener('touchmove', updateFromEvent)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchend', stopDrag)
}

const stopDrag = () => {
  activeKey = null
  window.removeEventListener('mousemove', updateFromEvent)
  window.removeEventListener('touchmove', updateFromEvent)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchend', stopDrag)
}

const updateFromEvent = (e: MouseEvent | TouchEvent) => {
  if (!activeKey) return

  const target = (e.target as HTMLElement).closest('.eq-slider') as HTMLElement
  if (!target) return

  const rect = target.getBoundingClientRect()
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY

  const percent = Math.min(100, Math.max(0, ((rect.bottom - clientY) / rect.height) * 100))
  const value = Math.round(percentToValue(percent))

  audio.setEqBand(activeKey, value)
}

onMounted(async () => {
  presets.value = (await ApiClient.getEqPresets()).data as string[]
  reverbs.value = (await ApiClient.getReverbPresets()).data as any[]
  ready.value = true
  alert(JSON.stringify(reverbs.value))
})
</script>

<template>
  <div v-if="ready"
    class="w-full flex flex-col gap-4 rounded-2xl p-4 backdrop-blur-xl bg-white/5 border border-white/10"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold tracking-wide text-white/90">Equalizer</h2>
    </div>

    <!-- Preset Pills -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="p in presets"
        :key="p"
        @click="audio.setEqPreset(p)"
        class="px-3 py-1.5 rounded-full text-sm border transition backdrop-blur bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90"
        :class="{
          'bg-blue-500/30 text-white border-blue-400/40': audio.preset.value === p,
        }"
      >
        {{ p }}
      </button>
    </div>

    <!-- Sliders -->
    <div
      class="w-full grid gap-4"
      :class="{
        'grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11': bandKeys.length >= 5,
        'grid-cols-3 sm:grid-cols-4 md:grid-cols-5': bandKeys.length < 5,
      }"
    >
      <div
        v-for="key in bandKeys"
        :key="key"
        class="flex flex-col items-center touch-pan-y select-none"
      >
        <!-- Custom slider -->
        <div
          class="eq-slider relative w-10 h-48 sm:h-56 md:h-64 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-end cursor-pointer"
          @mousedown="startDrag(key, $event)"
          @touchstart.prevent="startDrag(key, $event)"
        >
          <!-- Fill -->
          <div
            class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-400/60 to-blue-300/20 transition-all duration-150"
            :style="{ height: valueToPercent(audio.eq.value[key]) + '%' }"
          ></div>

          <!-- Handle -->
          <div
            class="absolute left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/90 shadow transition-transform duration-150"
            :style="{
              bottom: 'calc(' + valueToPercent(audio.eq.value[key]) + '% - 4px)',
            }"
          ></div>
        </div>

        <span class="mt-2 text-xs text-white/60 tracking-wide uppercase">
          {{ key }}
        </span>
      </div>
    </div>

    <div>
      <div>
        <select v-model="reverb.filename">
          <option v-for="item in reverbs" :key="item.filename" :value="item.filename">{{ item.title }}</option>
        </select>
      </div>
      <div>
        Gain {{ reverb.gain }}
        <HorizontalSlider v-model="reverb.gain" id="gain" :step="0.01" :min="0" :max="1" width="w-full" />
        Delay {{ reverb.delay }}
        <HorizontalSlider v-model="reverb.delay" id="delay" :step="0.01"  :min="0" :max="1" width="w-full" />
      </div>
    </div>
  </div>
</template>
