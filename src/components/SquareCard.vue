<script setup lang="ts">
import LucideIcon from "./LucideIcon.vue"
import type { MediaItem } from "../types"

defineProps<{
  item: MediaItem
  active?: boolean
}>()

defineEmits<{
  (e: "play", item: MediaItem): void
  (e: "toggle-favourite", item: MediaItem): void
}>()
</script>

<template>
  <button
    @click="$emit('play', item)"
    class="group relative aspect-square w-full overflow-hidden rounded-3xl border transition-all duration-300 ease-out active:scale-95 touch-manipulation text-left"
    :class="
      active
        ? 'border-cyan-400/50 bg-cyan-900/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]'
        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
    "
  >
    <button
      v-if="!item.isFolder"
      @click.stop="$emit('toggle-favourite', item)"
      class="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition"
    >
      <LucideIcon :name="item.favourite ? 'StarOff' : 'Star'" :size="18" class="text-yellow-400" />
    </button>

    <img
      v-if="item.img"
      :src="item.img"
      :alt="item.title"
      class="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80"
    />

    <div
      v-if="item.isFolder"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/80 to-purple-900/80"
    >
      <LucideIcon name="Folder" :size="48" class="text-white/50" />
    </div>

    <div
      v-else
      class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"
    ></div>

    <div class="absolute bottom-0 left-0 w-full p-4">
      <div class="mb-1 flex items-center gap-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-white/60">
          {{ item.type || item.format || "Media" }}
        </span>
      </div>
      <h3 class="truncate text-lg font-bold text-white shadow-black drop-shadow-md">
        {{ item.title }}
      </h3>
      <p class="truncate text-sm text-white/70">{{ item.subtitle }}</p>
    </div>

    <div
      v-if="active"
      class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-black shadow-lg shadow-cyan-500/50"
    >
      <div class="h-3 w-3 animate-pulse rounded-[1px] bg-black"></div>
      <div class="mx-[2px] h-5 w-3 animate-pulse rounded-[1px] bg-black"></div>
      <div class="h-2 w-3 animate-pulse rounded-[1px] bg-black"></div>
    </div>
  </button>
</template>
