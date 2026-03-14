<script setup lang="ts">
import { usePlayer } from "../composables/usePlayer"

const { currentTrack } = usePlayer()
</script>

<template>
  <div
    class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/10"
  >
    <img v-if="currentTrack.img" :src="currentTrack.img" class="h-full w-full object-cover" />

    <div class="absolute inset-0 m-auto h-3 w-3 rounded-full bg-black border border-white/20"></div>
  </div>
</template>
