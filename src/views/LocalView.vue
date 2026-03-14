<script setup lang="ts">
import { ref, onMounted } from "vue"
import { localApi } from "../api/local"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import LucideIcon from "../components/LucideIcon.vue"
import Loading from "../components/Loading.vue"

const { playItem } = usePlayer()
const files = ref<MediaItem[]>([])
const isLoading = ref(true)

onMounted(async () => {
  files.value = await localApi.getFiles()
  isLoading.value = false
})
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
      <div class="flex items-center gap-2 text-white/60">
        <LucideIcon name="Server" :size="16" />
        <span class="text-sm font-mono">/</span>
      </div>
    </div>

    <Loading v-if="isLoading" />

    <div v-else class="grid grid-cols-1 gap-2 pb-24">
      <div
        v-for="item in files"
        :key="item.id"
        @click="playItem(item)"
        class="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3 hover:border-cyan-500/30 hover:bg-white/10 active:scale-[0.99]"
      >
        <div class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-black/40">
          <LucideIcon
            v-if="item.isFolder"
            name="Folder"
            class="absolute inset-0 m-auto text-indigo-400"
            :size="24"
          />
          <div v-else>
            <LucideIcon
              v-if="!item.img"
              name="File"
              class="absolute inset-0 m-auto text-indigo-400"
              :size="24"
            />
            <img v-else :src="item.img" class="h-full w-full object-cover" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="truncate font-medium text-white group-hover:text-cyan-300">
            {{ item.title }}
          </h4>
          <p class="truncate text-xs text-white/50">{{ item.subtitle }} • {{ item.format }}</p>
        </div>
        <div class="text-white/20 group-hover:text-white">
          <LucideIcon
            :name="item.isFolder ? 'MoreHorizontal' : 'Play'"
            :size="20"
            class="fill-current"
          />
        </div>
      </div>
    </div>
  </div>
</template>
