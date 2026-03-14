<script setup lang="ts">
import PlayerArtworkMini from "./PlayerArtworkMini.vue"
import PlayerTrackInfo from "./PlayerTrackInfo.vue"
import PlayerControls from "./PlayerControls.vue"
import { usePlayer } from "../composables/usePlayer"

const { showFullPlayer, handlePlayer } = usePlayer()
</script>

<template>
  <div
    class="fixed bottom-[80px] left-4 right-4 z-40 md:bottom-8 md:left-[120px] md:right-8 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
    :class="showFullPlayer ? 'translate-y-[150%]' : 'translate-y-0'"
  >
    <div
      @click="handlePlayer"
      class="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-colors hover:bg-white/10"
    >
      <!-- LEFT SIDE -->
      <div class="flex items-center gap-3 overflow-hidden">
        <!-- Artwork always visible -->
        <PlayerArtworkMini />

        <!-- Track info: desktop only -->
        <div class="hidden md:flex">
          <PlayerTrackInfo />
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="flex items-center gap-2 pr-2">
        <!-- Playback controls -->
        <PlayerControls :size="20" />
      </div>
    </div>
  </div>
</template>
