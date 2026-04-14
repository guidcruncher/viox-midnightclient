<script setup lang="ts">
import { usePlayer } from '../composables/usePlayer'

const { currentTrack } = usePlayer()
</script>

<template>
  <div class="relative h-full w-full flex items-center justify-center">
    <div class="relative h-full w-full overflow-hidden rounded-full border-2 border-white/10">
      <img
        v-if="currentTrack && currentTrack.imageUrl"
        :src="currentTrack.imageUrl"
        class="h-full w-full object-cover"
      />

      <!-- Center spindle -->
      <div
        class="absolute inset-0 m-auto h-3 w-3 rounded-full bg-black border border-white/20"
      ></div>
    </div>
  </div>
</template>
