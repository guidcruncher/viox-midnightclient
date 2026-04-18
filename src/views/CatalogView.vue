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

const sources = ref<any[]>([])
const pageSize = 20
const { currentTrack, playItem } = usePlayer()
const items = ref<MediaItem[]>([])
const isLoading = ref(false)
const isReady = ref(false)
const parentItem = ref<MediaItem | undefined>(undefined)
const source = ref<any>({})

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset === 0) items.value = [] // Clear items on initial load or filter change
    const categoryId = parentItem.value
      ? parentItem.value.sourceRef.sourceId
      : source.value.sourceId

    const response = (await ApiClient.getCatalogItems(source.value.id, categoryId, offset, limit))
      .data

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
  const src: any = await ApiClient.getCatalog()
  parentItem.value = undefined
  sources.value = src.data.sort((a: any, b: any) => {
    return a.name.localeCompare(b.name)
  }) as any[]
  source.value = sources.value[0]
  parentItem.value = {
    id: '',
    title: '',
    sourceRef: {
      source: source.value.id,
      itemType: 'metadata',
      sourceId: source.value.initialFilter,
    },
  }

  //  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} });
  isReady.value = true
})

const handleSelect = async (item: any) => {
  switch (item.sourceRef.itemType) {
    case 'metadata':
      parentItem.value = item
      handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
      break
    case 'folder':
      parentItem.value = item
      handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
      break
    default:
      await playItem(item)
  }
}

const handleAdd = async (item: any) => {
  if (item.sourceRef.itemType !== 'metadata' && item.sourceRef.itemType !== 'folder') {
    if (item.library) {
      await ApiClient.removeFromLibrary(item.id)
    } else {
      await ApiClient.addToLibrary(item.id)
    }
    item.library = !item.library
  }
}

const handleFilter = async (item: any) => {
  source.value = item
  parentItem.value = {
    id: '',
    title: '',
    sourceRef: {
      itemType: 'metadata',
      source: source.value.id,
      sourceId: source.value.initialFilter,
    },
  }

  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
}
</script>

<template>
  <div v-if="isReady">
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="filter in sources"
        :key="filter.id"
        @click="handleFilter(filter)"
        class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
        :class="
          filter.id === source.id
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
