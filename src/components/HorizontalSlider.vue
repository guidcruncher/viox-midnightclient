<script setup lang="ts">
import { watch, ref, computed } from 'vue'

const props = defineProps<{
  id: string | number
  modelValue: number
  min?: number
  max?: number
  width?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'changed', payload: { id: string | number; value: number }): void
}>()

const sliderRef = ref<HTMLDivElement | null>(null)

const min = computed(() => props.min ?? 0)
const max = computed(() => props.max ?? 100)

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

  const ratio = Math.max(0, Math.min(1, x / width))
  const newValue = Math.round(min.value + ratio * (max.value - min.value))

  emit('update:modelValue', newValue)
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
