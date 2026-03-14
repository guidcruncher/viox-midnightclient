<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { radioApi } from "../api/radio"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import SectionHeader from "../components/SectionHeader.vue"
import PagedSquareCardList from "../components/PagedSquareCardList.vue"
import { useStorage } from "../composables/useStorage"
import { useStringUtils } from "@/composables/useStringUtils"

const { capitalise } = useStringUtils()

const titleValue = computed(() => capitalise(provider.value))

interface SearchState {
  query: string
  country: string
}

const search = useStorage<SearchState>("radio", { query: "", country: "GB" }, "local")

interface LoadMoreEvent {
  page: number
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const provider = ref("")
const pageSize = ref(20)
const countries = ref<any[]>([])
const { currentTrack, playing, playItem } = usePlayer()
const stations = ref<MediaItem[]>([])
const isLoading = ref(false)

const showFilters = ref(false)
const toggleFilters = () => (showFilters.value = !showFilters.value)

const validateFilter = () => {
  if (provider.value == "tunein") {
    if (search.value.country != "") {
      search.value.query = ""
    }
  }
}

const validateTextFilter = () => {
  if (provider.value == "tunein") {
    if (search.value.query != "") {
      search.value.country = ""
    }
  }
}

const handleSearch = async () => {
  if (isLoading.value) return
  isLoading.value = true

  stations.value = []
  const response = await radioApi.getStations(0, pageSize.value, {
    country: search.value.country,
    name: search.value.query,
  })
  stations.value.push(...response)
  showFilters.value = false
  isLoading.value = false
}

const clearSearch = async () => {
  const prov = await radioApi.getProvider()
  if (prov == "tunein") {
    pageSize.value = 65535
    search.value.country = ""
  } else {
    pageSize.value = 20
  }

  provider.value = prov
  search.value.query = ""
  handleSearch()
}

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return
  isLoading.value = true

  if (offset == 0) stations.value = []

  try {
    const response = await radioApi.getStations(offset, limit, {
      country: search.value.country,
      name: search.value.query,
    })
    stations.value.push(...response)
    done(response.length !== 0)
  } catch (error) {
    console.error("Failed to load stations:", error)
    done(false)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  countries.value = (await radioApi.getCountries()).data
  const prov = await radioApi.getProvider()
  if (prov == "tunein") {
    pageSize.value = 65535
    search.value.country = ""
  }
  provider.value = prov
})
</script>

<template>
  <div>
    <SectionHeader :title="titleValue" iconName="Radio">
      <template #right>
        <button
          class="px-4 py-2 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition"
          @click="toggleFilters"
        >
          <LucideIcon name="SlidersHorizontal" :size="20" />
        </button>
      </template>
    </SectionHeader>

    <!-- Filter Overlay -->
    <transition name="fade">
      <div
        v-if="showFilters"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4"
        @click.self="toggleFilters"
      >
        <div class="w-full max-w-md bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
          <h2 class="text-xl font-semibold text-white mb-4">Filters</h2>

          <div class="flex flex-col gap-4">
            <input
              type="text"
              v-model="search.query"
              @change="validateTextFilter"
              placeholder="Search for…"
              class="w-full border border-gray-700 rounded px-3 py-2 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              v-model="search.country"
              class="w-full border border-gray-700 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="validateFilter"
            >
              <option value="">All</option>
              <option v-for="item in countries" :value="item.code">
                {{ item.name }}
              </option>
            </select>

            <div class="flex gap-2 mt-2">
              <button
                class="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white font-semibold hover:bg-gray-600 transition"
                @click="clearSearch"
              >
                Clear
              </button>

              <button
                class="flex-1 px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition"
                @click="handleSearch"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <PagedSquareCardList
      :stations="stations"
      :current-track="currentTrack"
      :playing="playing"
      :loading="isLoading"
      :page-size="pageSize"
      @load-more="handleLoadMore"
      @play="playItem"
    />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
