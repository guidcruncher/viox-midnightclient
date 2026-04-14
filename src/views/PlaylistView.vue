<script setup lang="ts">
import type { MediaItem } from '../types'

import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { ApiClient } from '@/api'
import { Playlist } from '@/api/types'
import { getQueryString } from '@/utils/getQueryString'

const route = useRoute()

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const ready = ref(false)
const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const playListId = getQueryString(route.query.id)
const playlist = ref<Playlist | undefined>(undefined)
const pageSize = 20
const playlistItem = computed(() => {
  if (!playlist.value) return undefined
  return ApiClient.playlistToMediaItem(playlist.value)
})

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

//const handleSelect = async (item: any) => {
//  await playItem(item, playlist.value?.sourceId)
//}
</script>

<template>
  <div v-if="ready">
    <TrackList
      v-if="playlistItem && items"
      :parent="playlistItem"
      :tracks="items"
      :loading="isLoading"
      :page-size="pageSize"
      @favourite="handleAdd"
      @playall="handlePlayAll"
      @load-more="handleLoadMore"
    />
  </div>
</template>
