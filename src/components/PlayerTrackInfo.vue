<template>
  <div class="truncate">
    <h3 class="font-bold text-white">{{ currentTrack.title }}</h3>
    <p class="text-white/50">{{ currentTrack.subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { usePlayer } from "../composables/usePlayer"
const { currentTrack } = usePlayer()
</script>
