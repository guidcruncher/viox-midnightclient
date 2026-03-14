<script setup lang="ts">
import { ref, onMounted } from "vue"
import { searchApi } from "../api/search"
import type { UnifiedSearchResult } from "../types"
import { usePlayer } from "../composables/usePlayer"
import LucideIcon from "../components/LucideIcon.vue"
import PagedSearchCardList from "../components/PagedSearchCardList.vue"
import { useStorage } from "../composables/useStorage"

interface SearchState {
  query: string
  field: string
}

interface LoadMoreEvent {
  page: number
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const search = useStorage<SearchState>("search", { query: "", field: "" }, "local")
const results = ref<UnifiedSearchResult[]>([])
const isLoading = ref(false)
const searching = ref(false)

const { currentTrack, playing, playItem } = usePlayer()

// --- Clear search ---
const clearSearch = () => {
  search.value.query = ""
  search.value.field = ""
  results.value = []
  searching.value = false
}

const handleSelect = async (item: any) => {
  await playItem(item)
}

// --- Initial search (page 1) ---
const handleSearch = async () => {
  if (!search.value.query.trim()) return
  if (search.value.query.trim() == "") return

  results.value = []
  searching.value = true
  isLoading.value = true

  try {
    const response = await searchApi.search(search.value.query, {
      page: 1,
      pageSize: 20,
      field: search.value.field || undefined,
    })
    results.value = response.results
  } catch (error) {
    console.error("Search failed:", error)
  } finally {
    isLoading.value = false
  }
}

// --- Infinite scroll pagination ---
const handleLoadMore = async ({ page, limit, done }: LoadMoreEvent) => {
  if (!searching.value || isLoading.value) return

  isLoading.value = true
  try {
    const response = await searchApi.search(search.value.query, {
      page,
      pageSize: limit,
    })

    results.value.push(...response.results)
    const moreAvailable = response.results.length !== 0
    done(moreAvailable)
  } catch (error) {
    console.error("Failed to load search:", error)
    done(false)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await handleSearch()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Search bar -->
    <div class="flex gap-2 items-center">
      <!-- Dark input -->
      <input
        type="text"
        v-model="search.query"
        placeholder="Search for…"
        class="flex-1 border border-gray-700 rounded px-3 py-2 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="handleSearch"
      />
      <select
        @change="handleSearch"
        class="w-[150px] border border-gray-700 rounded px-3 py-2 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        v-model="search.field"
      >
        <option value="">All</option>
        <option value="album">Albums</option>
        <option value="local">Local</option>
        <option value="podcast">Podcasts</option>
        <option value="radio">Radio</option>
        <option value="show">Shows</option>
        <option value="track">Tracks</option>
      </select>
      <!-- Clear button -->
      <button
        v-if="search.query"
        class="px-6 py-2 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition"
        @click="clearSearch"
      >
        <LucideIcon name="Eraser" :size="20" />
      </button>

      <!-- Search button -->
      <button
        class="px-6 py-2 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition"
        @click="handleSearch"
      >
        <LucideIcon name="Search" :size="20" />
      </button>
    </div>

    <PagedSearchCardList
      :results="results"
      :current-track="currentTrack"
      :playing="playing"
      :loading="isLoading"
      :page-size="20"
      @load-more="handleLoadMore"
      @play="handleSelect"
    />
  </div>
</template>
