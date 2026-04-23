<script setup lang="ts">
import { usePlayer } from '../composables/usePlayer'

const { showFullPlayer } = usePlayer()
</script>

<template>
  <div
    class="flex h-[100dvh] w-full flex-col overflow-hidden bg-black font-sans text-gray-100 md:flex-row"
  >
    <BackgroundEffects />
    <SidebarNav />

    <main
      class="relative order-1 flex-1 overflow-y-auto overflow-x-hidden p-4 z-10 md:order-2 md:p-4 flex flex-col"
    >
      <div class="mx-auto w-full max-w-7xl pb-32 flex-1 flex flex-col">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" class="flex-1" />
          </transition>
        </router-view>
      </div>
    </main>

    <PlayerMini />
    <PlayerFullscreen v-if="showFullPlayer" />
  </div>
</template>
