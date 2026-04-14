<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header v-if="false" class="mb-8 flex items-center justify-between">
    <h1
      class="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 md:text-5xl"
    >
      {{ String(route.meta.title || '') }}
    </h1>
  </header>
</template>
