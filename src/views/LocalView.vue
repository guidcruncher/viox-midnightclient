<script setup lang="ts">
import type { MediaItem } from '../types'

import { ref, onMounted } from 'vue'

import { ApiClient } from '@/api'
import { usePlayer } from '@/composables/usePlayer'

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const { currentTrack, playItem } = usePlayer()
const items = ref<MediaItem[]>([])
const parentItem = ref<MediaItem | undefined>(undefined)
const isLoading = ref(false)
const pageSize = 20
const ready = ref(false)

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset == 0) items.value = [] // Clear items on initial load or filter change

    const response = (await ApiClient.getLocalItems(parentItem.value?.id, offset, limit)).data

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
  ready.value = true
  // handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })d
})

const handleSelect = async (item: MediaItem) => {
  if (item.sourceRef.itemType == 'folder') {
    parentItem.value = item
    items.value = []
  } else {
    await playItem(item)
  }
}
</script>

<template>
  <div v-if="ready">
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
