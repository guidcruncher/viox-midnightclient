<script setup lang="ts">
import type { MediaItem } from '../types'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { ApiClient } from '@/api'
import { usePlayer } from '@/composables/usePlayer'
import { useStorage } from '@/composables/useStorage'

const router = useRouter()

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const parentItem = ref<MediaItem | undefined>(undefined)
const ready = ref(false)
const { currentTrack, playItem } = usePlayer()
const musicFilter = useStorage<any>('currentLibraryFilter', undefined, 'local')
const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const pageSize = 20
const filters = ref<any[]>([])

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset === 0) items.value = [] // Clear items on initial load or filter change

    let response

    switch (musicFilter.value.name) {
      case 'Playlists':
        response = (await ApiClient.getPlaylists(offset, limit)).data
        break
      case 'Files':
        response = (await ApiClient.getLocalItems(parentItem.value?.id, offset, limit)).data
        break
      default:
        response = (await ApiClient.getLibrary(musicFilter.value.itemTypes, offset, limit)).data
        break
    }

    items.value.push(...response)
    const moreAvailable = response.length !== 0
    done(moreAvailable)
  } catch (error) {
    console.error('Failed to load items:', error)
    done(false) // Stop observing on error
  } finally {
    isLoading.value = false
  }
}

// Initial fetch
onMounted(async () => {
  const libraryFilters = (await ApiClient.getCapabilities()).libraryFilters
  filters.value = libraryFilters ? libraryFilters : []

  if (!musicFilter.value) {
    musicFilter.value = libraryFilters ? libraryFilters[0] : {}
  }

  ready.value = true
  //handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
})

const handleSelect = async (item: MediaItem) => {
  switch (item.sourceRef.itemType) {
    case 'playlist':
      router.push({ name: 'playlist', query: { id: item.id } })
      break
    case 'folder':
      parentItem.value = item
      items.value = []
      break
    default:
      await playItem(item)
  }
}

const handleAdd = async (item: any) => {
  if (item.library) {
    await ApiClient.removeFromLibrary(item.id)
  } else {
    await ApiClient.addToLibrary(item.id)
  }
  item.library = !item.library
}

const handleFilter = async (filter: any) => {
  musicFilter.set(filter)
  items.value = []
}
</script>

<template>
  <div v-if="ready">
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="filter in filters"
        :key="filter.name"
        @click="handleFilter(filter)"
        class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
        :class="
          musicFilter.name === filter.name
            ? 'bg-green-500 text-black font-bold'
            : 'border border-white/10 bg-white/5 text-white hover:bg-white/20'
        "
      >
        {{ filter.name }}
      </button>
    </div>

    <div class="paged-list-wrapper">
      <PagedList
        :items="items"
        :loading="isLoading"
        :page-size="pageSize"
        @load-more="handleLoadMore"
      >
        <div
          class="grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
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
            @add="handleAdd"
          />
        </div>
      </PagedList>
    </div>
  </div>
</template>
