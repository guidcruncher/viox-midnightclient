<template>
  <div class="truncate">
    <h3 v-if="currentTrack" class="font-bold text-white">{{ currentTrack.title }}</h3>
    <p v-if="currentTrack" class="text-white/50">{{ currentTrack.subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { usePlayer } from '../composables/usePlayer'
const { currentTrack } = usePlayer()
</script>
