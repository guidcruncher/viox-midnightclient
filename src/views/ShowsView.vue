<script setup lang="ts">
import { useRoute } from "vue-router"
import { ref, onMounted } from "vue"
import { spotifyApi } from "../api/spotify"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import PagedEpisodeList from "../components/PagedEpisodeList.vue"
import SectionHeader from "../components/SectionHeader.vue"

interface LoadMoreEvent {
  page: number
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}
const { currentTrack, playing, playItem } = usePlayer()
const route = useRoute()
const title = ref("")
const results = ref<MediaItem[]>([])
const isLoading = ref(false)
const selectedPodcast = ref({} as any)

const loadPodcast = async (id: string) => {
  const res = await spotifyApi.getShow(id)
  if (!res) {
    return
  }
  const podcast: MediaItem = res
  title.value = podcast.title
  selectedPodcast.value = podcast
}

onMounted(async () => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")

  if (id) {
    loadPodcast(id)
  }
})

// --- Infinite scroll pagination ---
const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")
  if (isLoading.value) return

  isLoading.value = true
  try {
    const response = await spotifyApi.getShowEpisodes(id, {
      offset,
      limit,
    })

    results.value.push(...response)
    const moreAvailable = response.length !== 0
    done(moreAvailable)
  } catch (error) {
    console.error("Failed to load  search:", error)
    done(false)
  } finally {
    isLoading.value = false
  }
}

const handlePlayItem = async (item: any) => {
  await playItem(item)
}
</script>

<template>
  <div>
    <SectionHeader :title="title" iconName="Podcast" />

    <PagedEpisodeList
      :results="results"
      :current-track="currentTrack"
      :playing="playing"
      :loading="isLoading"
      :page-size="12"
      @load-more="handleLoadMore"
      @play="handlePlayItem"
    />
  </div>
</template>
