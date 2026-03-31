<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

import LucideIcon from './LucideIcon.vue'

const router = useRouter()
const route = useRoute()

const emit = defineEmits<{
  (e: 'button-click', name: string): void
}>()

function handleClick(name: string) {
  emit('button-click', name)
  router.push({ name })
}
</script>

<template>
  <header class="mb-8 flex items-center justify-between">
    <h1
      class="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 md:text-5xl"
    >
      {{ String(route.meta.title || '') }}
    </h1>

    <div class="flex gap-3">
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
        @click="handleClick('settings')"
      >
        <LucideIcon name="Settings" :size="20" />
      </button>

      <button
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
        @click="handleClick('sound')"
      >
        <LucideIcon name="Speaker" :size="20" />
      </button>
    </div>
  </header>
</template>
