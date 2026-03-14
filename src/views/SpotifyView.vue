<script setup lang="ts">
import { ref, onMounted } from "vue"
import { spotifyLibraryClient } from "../api/spotifylibrary"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import SectionHeader from "../components/SectionHeader.vue"
import PagedSquareCardList from "../components/PagedSquareCardList.vue"

interface LoadMoreEvent {
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const { currentTrack, playing, playItem } = usePlayer()
const spotifyFilter = ref(<string>"All")
const items = ref<MediaItem[]>([])
const isLoading = ref(false)

const mapTypeToEndpoint = (s: string) => {
  if (s == "Playlists") return "playlist"
  if (s == "Albums") return "album"
  if (s == "Artists") return "artist"
  if (s == "Tracks") return "track"
  if (s == "Episodes") return "episode"
  if (s == "Shows") return "show"
  return undefined
}

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (offset == 0) items.value = [] // Clear items on initial load or filter change

    const response = (
      await spotifyLibraryClient.getLibrary({
        type: mapTypeToEndpoint(String(spotifyFilter.value)),
        offset,
        limit,
      })
    ).data.items

    items.value.push(...response)
    const moreAvailable = response.length != 0
    done(moreAvailable)
  } catch (error) {
    console.error("Failed to load items:", error)
    done(false) // Stop observing on error
  } finally {
    isLoading.value = false
  }
}

// Initial fetch
onMounted(async () => {
  handleLoadMore({ offset: 0, limit: 12, done: () => {} })
})

const handleSelect = async (item: any) => {
  await playItem(item)
}

const handleFilter = (filter: string) => {
  spotifyFilter.value = filter
  items.value = []
  handleLoadMore({ offset: 0, limit: 12, done: () => {} })
}
</script>

<template>
  <div>
    <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      <button
        v-for="filter in ['All', 'Playlists', 'Albums', 'Tracks', 'Artists']"
        :key="filter"
        @click="handleFilter(filter)"
        class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
        :class="
          spotifyFilter === filter
            ? 'bg-green-500 text-black font-bold'
            : 'border border-white/10 bg-white/5 text-white hover:bg-white/20'
        "
      >
        {{ filter }}
      </button>
    </div>

    <SectionHeader
      :title="spotifyFilter === 'All' ? 'Your Library' : spotifyFilter"
      iconName="Music"
    />

    <PagedSquareCardList
      :stations="items"
      :current-track="currentTrack"
      :playing="playing"
      :loading="isLoading"
      :page-size="12"
      @load-more="handleLoadMore"
      @play="handleSelect"
    />
  </div>
</template>
