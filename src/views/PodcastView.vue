<script setup lang="ts">
import type { MediaItem } from '../types'

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { ApiClient } from '@/api'
import { usePlayer } from '@/composables/usePlayer'
import { getQueryString } from '@/utils/getQueryString'

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const { currentTrack, playItem } = usePlayer()
const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const podcastId = ref('')
const podcast = ref<MediaItem | undefined>(undefined)
const pageSize = 20
const ready = ref(false)

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset == 0) items.value = [] // Clear items on initial load or filter change

    const response = (await ApiClient.getItems(podcastId.value, offset, limit)).data

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

// Initial fetch
onMounted(async () => {
  const route = useRoute()
  podcastId.value = getQueryString(route.query.id)
  podcast.value = (await ApiClient.getLibraryItem(podcastId.value)).data
  //  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
  ready.value = true
})

const handleAdd = async () => {
  await ApiClient.addToLibrary(podcastId.value)
}

const handleSelect = async (item: any) => {
  await playItem(item, podcast.value?.sourceRef.sourceId)
}
</script>

<template>
  <div v-if="ready">
    <div class="flex items-center justify-between">
      <button
        @click.stop="handleAdd"
        class="right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition"
      >
        <LucideIcon name="Star" :size="18" class="text-yellow-400" />
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
          />
        </div>
      </PagedList>
    </div>
  </div>
</template>
