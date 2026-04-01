<script setup lang="ts">
import type { MediaItem } from '../types'

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { ApiClient } from '@/api'
import { Playlist } from '@/api/types'
import { usePlayer } from '@/composables/usePlayer'
import { getQueryString } from '@/utils/getQueryString'

const route = useRoute()

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const ready = ref(false)
const { currentTrack, playItem } = usePlayer()
const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const playListId = getQueryString(route.query.id)
const playlist = ref<Playlist | undefined>(undefined)
const pageSize = 20

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset == 0) items.value = [] // Clear items on initial load or filter change

    const response = (await ApiClient.getPlaylistItems(playListId, offset, limit)).data

    items.value.push(...response)
    const moreAvailable = response.length != 0
    done(moreAvailable)
  } catch (error) {
    console.error('Failed to load items:', error)
    done(false) // Stop observing on error
  } finally {
    isLoading.value = false
  }
}

const handleAdd = async () => {
  await ApiClient.addToLibrary(playListId)
}

const handlePlayAll = async () => {
  await ApiClient.play(playListId)
}

// Initial fetch
onMounted(async () => {
  playlist.value = (await ApiClient.getPlaylist(playListId)).data
  ready.value = true
  //  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
})

const handleSelect = async (item: any) => {
  await playItem(item, playlist.value?.sourceId)
}
</script>

<template>
  <div v-if="ready">
    <div class="flex items-center justify-between">
      <button
        @click.stop="handleAdd"
        class="right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition"
      >
        <LucideIcon name="Star" :size="18" class="text-white-400" />
      </button>

      <button
        @click.stop="handlePlayAll"
        class="right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition"
      >
        <LucideIcon name="Play" :size="18" class="text-white-400" />
      </button>
    </div>

    <div class="paged-list-wrapper">
      <div class="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        <PagedList
          :items="items"
          :loading="isLoading"
          :page-size="pageSize"
          @load-more="handleLoadMore"
        >
          <SquareCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :active="item.id === currentTrack?.id"
            :imageUrl="item.imageUrl"
            :itemType="item.sourceRef.itemType"
            :title="item.title"
            :subtitle="item.subtitle"
            @click="handleSelect"
          />
        </PagedList>
      </div>
    </div>
  </div>
</template>
