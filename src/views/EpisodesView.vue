<script setup lang="ts">
import { useRoute } from "vue-router"
import { ref, onMounted } from "vue"
import { podverseApi } from "../api/podverse"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import PagedEpisodeList from "../components/PagedEpisodeList.vue"
import SectionHeader from "../components/SectionHeader.vue"
import LucideIcon from "../components/LucideIcon.vue"

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
const isSubscribed = ref(true)

const handlePlayItem = async (item: any) => {
  await playItem(item, { podcastId: selectedPodcast.value.id })
}

const loadPodcast = async (id: string) => {
  const res = await podverseApi.getPodcast(id)
  if (!res) {
    return
  }

  const podcast: MediaItem = res
  title.value = podcast.title
  selectedPodcast.value = podcast

  const subscribedState = await podverseApi.getSubscriptionState(id)
  isSubscribed.value = subscribedState
}

const handleSubscription = async () => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")
  const res = await podverseApi.toggleSubscription(id)
  isSubscribed.value = res.data.subscribed
}

onMounted(async () => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")

  if (id) {
    loadPodcast(id)
  }
})

// --- Infinite scroll pagination ---
const handleLoadMore = async ({ page, limit, done }: LoadMoreEvent) => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")
  console.log(limit)
  if (isLoading.value) return

  isLoading.value = true
  try {
    const response = await podverseApi.getEpisodes({
      podcastId: id,
      page,
    })

    results.value.push(...response)
    const moreAvailable = response.length !== 0
    done(moreAvailable)
  } catch (error) {
    console.error("Failed to load search:", error)
    done(false)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <SectionHeader :title="title" iconName="Podcast" />

    <button
      class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition"
      @click="handleSubscription"
    >
      <LucideIcon name="Watch" :size="20" v-if="!isSubscribed" />
      <LucideIcon name="Trash" :size="20" v-if="isSubscribed" />
    </button>

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
