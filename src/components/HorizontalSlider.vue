<script setup lang="ts">
import { watch, ref, computed } from 'vue'

const props = defineProps<{
  id: string | number
  modelValue: number
  min?: number
  max?: number
  step?: number // The increment/decrement precision
  width?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'changed', payload: { id: string | number; value: number }): void
}>()

const sliderRef = ref<HTMLDivElement | null>(null)

const min = computed(() => props.min ?? 0)
const max = computed(() => props.max ?? 100)
// Defaulting the step to 1 here
const step = computed(() => props.step ?? 1)

const percentage = computed(() => {
  const range = max.value - min.value
  return ((props.modelValue - min.value) / range) * 100
})

const computedWidth = computed(() => props.width ?? 'w-full')

const handleInteraction = (e: MouseEvent | TouchEvent) => {
  if (!sliderRef.value) return

  let clientX: number
  if ('touches' in e) clientX = e.touches[0].clientX
  else clientX = e.clientX

  const rect = sliderRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const width = rect.width

  // Calculate ratio (0 to 1)
  const ratio = Math.max(0, Math.min(1, x / width))

  // Find raw value based on the range
  const rawValue = min.value + ratio * (max.value - min.value)

  // Snap the raw value to the nearest step
  // Math: Min + Round((Distance from Min) / Step) * Step
  let steppedValue = Math.round((rawValue - min.value) / step.value) * step.value + min.value

  // Clamp to ensure it stays within min/max bounds
  steppedValue = Math.max(min.value, Math.min(max.value, steppedValue))

  // Handle JS floating point math (e.g., 0.1 + 0.2 = 0.300000004)
  // We determine the number of decimal places in the step and match it
  const stepString = step.value.toString()
  const precision = stepString.includes('.') ? stepString.split('.')[1].length : 0
  const finalValue = Number(steppedValue.toFixed(precision))

  if (finalValue !== props.modelValue) {
    emit('update:modelValue', finalValue)
  }
}

watch(
  () => props.modelValue,
  (value) => emit('changed', { id: props.id, value })
)
</script>

<template>
  <div class="flex items-center gap-3" :class="computedWidth" @click.stop>
    <div
      ref="sliderRef"
      @click.stop="handleInteraction"
      @mousemove.stop="(e) => e.buttons === 1 && handleInteraction(e)"
      @touchmove.prevent="handleInteraction"
      class="group relative h-8 flex-1 cursor-pointer flex items-center touch-none"
    >
      <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden pointer-events-none">
        <div
          class="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transition-all duration-75"
          :style="{ width: percentage + '%' }"
        ></div>
      </div>

      <div
        class="absolute h-4 w-4 rounded-full bg-white shadow-lg transition-opacity pointer-events-none"
        :class="'opacity-0 group-hover:opacity-100'"
        :style="{ left: `calc(${percentage}% - 8px)` }"
      ></div>
    </div>
  </div>
</template>
