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

const radioSources = ref<any[]>([])
const pageSize = 20
const { currentTrack, playItem } = usePlayer()
const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const isReady = ref(false)
const parentItem = ref<MediaItem | undefined>(undefined)
const radioSource = ref<any>({})
const query = ref('')

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset == 0) items.value = [] // Clear items on initial load or filter ch,ange
    const categoryId = parentItem.value
      ? parentItem.value.sourceRef.sourceId
      : radioSource.value.sourceId

    const response = (
      await ApiClient.getRadioItems(radioSource.value.id, categoryId, offset, limit, query.value)
    ).data

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
  const sources: any = await ApiClient.getRadioSources()
  parentItem.value = undefined
  radioSources.value = sources.data as any[]
  radioSource.value = sources.data.find((t: any) => t.default)

  parentItem.value = {
    id: '',
    title: '',
    sourceRef: {
      source: radioSource.value.id,
      itemType: 'metadata',
      sourceId: radioSource.value.sourceId,
    },
  }

  //  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} });
  isReady.value = true
})

const handleSelect = async (item: any) => {
  if (item.sourceRef.itemType == 'station') {
    await playItem(item)
  } else {
    parentItem.value = item
    handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
  }
}

const handleAdd = async (item: any) => {
  if (item.sourceRef.itemType != 'metadata' && item.sourceRef.itemType != 'folder') {
    await ApiClient.addToLibrary(item.id)
  }
}

const handleFilter = async (item: any) => {
  radioSource.value = item
  parentItem.value = undefined

  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
}

const handleSearch = async () => {
  items.value = []
}
</script>

<template>
  <div v-if="isReady">
    <OverlayPanel @close="handleSearch">
      <input type="text" v-model="query" />
    </OverlayPanel>

    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="filter in radioSources"
        :key="filter"
        @click="handleFilter(filter)"
        class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
        :class="
          radioSource.id === filter.id
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
            showAdd="true"
            @add="handleAdd"
            @click="handleSelect"
          />
        </div>
      </PagedList>
    </div>
  </div>
</template>
