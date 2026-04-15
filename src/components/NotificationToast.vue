<script setup lang="ts">
import LucideIcon from './LucideIcon.vue'

const props = defineProps<{
  title: string
  message: string
  type: 'info' | 'warning' | 'error'
}>()

defineEmits(['close'])

const typeStyles = {
  info: { border: 'border-cyan-400', text: 'text-cyan-400', icon: 'CircleCheck' },
  warning: { border: 'border-amber-400', text: 'text-amber-400', icon: 'TriangleAlert' },
  error: { border: 'border-red-500', text: 'text-red-400', icon: 'CircleX' },
}
</script>

<template>
  <div
    class="glass rounded-2xl px-4 py-3.5 flex items-start gap-3 border-l-2 mb-3 shadow-lg pointer-events-auto"
    :class="typeStyles[props.type].border"
  >
    <LucideIcon
      :name="typeStyles[props.type].icon"
      size="20"
      :class="['mt-0.5 shrink-0', typeStyles[type].text].join(' ')"
    />
    <div class="flex-1">
      <p class="text-sm font-medium text-white">{{ props.title }}</p>
      <p class="text-xs text-white/40">{{ props.message }}</p>
    </div>
    <button @click="$emit('close')" class="text-white/20 hover:text-white transition-colors">
      <LucideIcon name="X" size="16" />
    </button>
  </div>
</template>
