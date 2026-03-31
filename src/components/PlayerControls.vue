<script setup lang="ts">
import { usePlayer } from '../composables/usePlayer'

import LucideIcon from './LucideIcon.vue'

const props = withDefaults(defineProps<{ size?: number }>(), {
  size: 20,
})

const { playing, previous, next, stop, togglePlay } = usePlayer()
</script>

<template>
  <div class="flex items-center gap-6">
    <button
      @click.stop="previous"
      class="text-white/60 hover:text-white active:scale-90 transition-transform"
    >
      <LucideIcon name="SkipBack" :size="props.size" class="fill-current" />
    </button>

    <button
      @click.stop="togglePlay"
      class="flex items-center justify-center rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
      :class="props.size > 20 ? 'h-20 w-20' : 'h-10 w-10'"
    >
      <LucideIcon name="Play" v-if="!playing" :size="props.size + 4" class="fill-current ml-1" />
      <LucideIcon name="Pause" v-if="playing" :size="props.size + 4" class="fill-current ml-1" />
    </button>

    <button
      @click.stop="stop"
      class="flex items-center justify-center rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
      :class="props.size > 20 ? 'h-20 w-20' : 'h-10 w-10'"
    >
      <LucideIcon name="Square" :size="props.size + 4" class="fill-current ml-1" />
    </button>

    <button
      @click.stop="next"
      class="text-white/60 hover:text-white active:scale-90 transition-transform"
    >
      <LucideIcon name="SkipForward" :size="props.size" class="fill-current" />
    </button>
  </div>
</template>
