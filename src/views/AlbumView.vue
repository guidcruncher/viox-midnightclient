<script setup lang="ts">
import type { MediaItem } from '../types'

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { ApiClient } from '@/api'
import { getQueryString } from '@/utils/getQueryString'

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const albumId = ref('')
const album = ref<MediaItem | undefined>(undefined)
const pageSize = 20
const ready = ref(false)

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset === 0) items.value = [] // Clear items on initial load or filter change

    const response = (await ApiClient.getItems(albumId.value, offset, limit)).data

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
  const route = useRoute()
  albumId.value = getQueryString(route.query.id)
  album.value = (await ApiClient.getLibraryItem(albumId.value)).data
  // handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
  ready.value = true
})

const handleAdd = async () => {
  await ApiClient.addToLibrary(albumId.value)
}

const handlePlayAll = async () => {
  await ApiClient.play(albumId.value)
}
</script>

<template>
  <div v-if="ready">
    <TrackList
      v-if="album && items"
      :parent="album"
      :tracks="items"
      :loading="isLoading"
      :page-size="pageSize"
      @favourite="handleAdd"
      @playall="handlePlayAll"
      @load-more="handleLoadMore"
    />
  </div>
</template>
