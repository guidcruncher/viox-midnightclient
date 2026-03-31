<script setup lang="ts">
import { usePlayer } from '../composables/usePlayer'

import LucideIcon from './LucideIcon.vue'
import PlayerArtwork from './PlayerArtwork.vue'
import PlayerControls from './PlayerControls.vue'

const { showFullPlayer, currentTrack, progress } = usePlayer()
</script>

<template>
  <transition name="slide-up">
    <div
      v-if="showFullPlayer"
      class="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-[50px]"
    >
      <!-- HEADER -->
      <div class="flex items-center justify-between p-6 md:p-10">
        <button
          @click="showFullPlayer = false"
          class="rounded-full bg-white/5 p-2 text-white hover:bg-white/10"
        >
          <LucideIcon name="ChevronDown" :size="24" />
        </button>

        <div class="flex flex-col items-center">
          <div class="h-1 w-12 rounded-full bg-white/20 mb-2 md:hidden"></div>

          <!-- NOW PLAYING: desktop only -->
          <div class="hidden md:block text-xs font-bold tracking-widest text-white/40">
            NOW PLAYING
          </div>
        </div>

        <button class="rounded-full p-2 text-white/50 hover:text-white">
          <LucideIcon name="MoreHorizontal" />
        </button>
      </div>

      <!-- CONTENT -->
      <div class="flex flex-1 flex-col items-center justify-center px-8 pb-10">
        <!-- FLIP CARD -->
        <div class="relative aspect-square w-full max-w-sm md:max-w-md perspective-1000">
          <div class="relative w-full h-full transition-all duration-500 transform-style-3d">
            <!-- FRONT -->
            <div
              class="absolute inset-0 backface-hidden transition-opacity opacity-100 duration-300"
            >
              <PlayerArtwork />
            </div>

            <!-- BACK -->
          </div>
        </div>

        <!-- TRACK INFO (ALWAYS VISIBLE IN FULLSCREEN) -->
        <div class="mt-10 w-full max-w-lg text-center md:text-left">
          <div class="flex items-start justify-between">
            <div>
              <h2 v-if="currentTrack" class="text-3xl font-black text-white md:text-4xl">
                {{ currentTrack.title }}
              </h2>
              <p v-if="currentTrack" class="mt-1 text-lg font-medium text-cyan-400">
                {{ currentTrack.subtitle }}
              </p>
            </div>

            <!-- Desktop-only heart -->
            <button
              class="hidden rounded-full border border-white/10 p-3 text-white/50 hover:bg-white/10 hover:text-green-500 md:block"
            >
              <LucideIcon name="Heart" :size="24" />
            </button>
          </div>
        </div>

        <!-- SCRUBBER -->
        <div class="group mt-8 w-full max-w-lg">
          <div class="relative h-2 w-full cursor-pointer rounded-full bg-white/10">
            <div
              class="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              :style="{ width: progress + '%' }"
            ></div>

            <div
              class="absolute top-1/2 -ml-2 h-4 w-4 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              :style="{ left: progress + '%' }"
            ></div>
          </div>

          <div class="mt-2 flex justify-between text-xs font-medium text-white/40">
            <span>1:24</span>
            <span>3:45</span>
          </div>
        </div>

        <!-- CONTROLS -->
        <div class="mt-8 flex items-center justify-between md:justify-center md:gap-12">
          <PlayerControls :size="36" />

          <button class="text-white/40 hover:text-white">
            <LucideIcon name="List" :size="24" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
