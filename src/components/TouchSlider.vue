<script setup lang="ts">
import { computed } from "vue"

interface Props {
  modelValue: number | string
  label?: string
  min?: number | string
  max?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  label: "Intensity",
  min: 0,
  max: 100,
})

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void
}>()

// Ensure we are working with numbers for calculations
const numericValue = computed(() => Number(props.modelValue))

const handleInput = (event: Event) => {
  // FIX: Cast EventTarget to HTMLInputElement
  const target = event.target as HTMLInputElement
  if (target) {
    emit("update:modelValue", Number(target.value))
  }
}

// Calculate percentage for the visual track gradient
const progressPercent = computed(() => {
  const min = Number(props.min)
  const max = Number(props.max)
  return ((numericValue.value - min) / (max - min)) * 100
})
</script>

<template>
  <div class="space-y-3 p-1">
    <div class="flex justify-between items-end">
      <span class="text-xs font-bold tracking-widest uppercase text-white/40">
        {{ label }}
      </span>
      <span class="text-sm font-mono font-bold text-cyan-400"> {{ numericValue }}% </span>
    </div>

    <div class="relative w-full h-8 flex items-center group">
      <div class="absolute inset-x-0 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transition-all duration-75"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>

      <input
        type="range"
        :min="min"
        :max="max"
        :value="modelValue"
        @input="handleInput"
        class="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-20"
      />

      <div
        class="absolute pointer-events-none w-6 h-6 rounded-full bg-white shadow-[0_0_15px_rgba(34,211,238,0.5)] border-2 border-cyan-400 z-10 transition-transform duration-75 group-active:scale-125"
        :style="{ left: `calc(${progressPercent}% - 12px)` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
/* Remove default margin/padding for the range input to ensure it lines up with custom UI */
input[type="range"] {
  -webkit-appearance: none;
  margin: 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
}
</style>
