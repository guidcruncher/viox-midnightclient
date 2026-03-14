<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { ref, onMounted } from "vue"
import { podverseApi } from "../api/podverse"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import SquareCard from "../components/SquareCard.vue"
import SectionHeader from "../components/SectionHeader.vue"
import Loading from "../components/Loading.vue"

const { toggleFavourite, currentTrack, playing } = usePlayer()
const route = useRoute()
const router = useRouter()
const title = ref("Subscriptions")
const subPodcasts = ref<MediaItem[]>([])
const isLoading = ref(true)
const selectedPodcast = ref({} as any)

const selectPodcast = async (item: MediaItem) => {
  selectedPodcast.value = item
  router.push({ name: "episodes", params: { id: item.id, uri: item.uri } })
}

const loadPodcast = async (id: string) => {
  const res = await podverseApi.getPodcast(id)
  if (!res) {
    return
  }
  const podcast: MediaItem = res
  await selectPodcast(podcast)
}

const showPodcasts = async () => {
  isLoading.value = true
  title.value = "Subscriptions"
  try {
    const [subPodcastsData] = await Promise.all([podverseApi.getSubscriptionDetails()])
    subPodcasts.value = subPodcastsData.data
  } finally {
    isLoading.value = false
  }
}

const handleToggleFavourite = async (item: any) => {
  await toggleFavourite(item)
  const [subPodcastsData] = await Promise.all([podverseApi.getSubscriptionDetails()])
  subPodcasts.value = subPodcastsData.data
}

onMounted(async () => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")

  if (id) {
    loadPodcast(id)
  } else {
    try {
      title.value = "Subscriptions"
      const [subPodcastsData] = await Promise.all([podverseApi.getSubscriptionDetails()])
      subPodcasts.value = subPodcastsData.data
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<template>
  <div>
    <SectionHeader :title="title" iconName="Podcast" @click="showPodcasts" />

    <div>
      <Loading v-if="isLoading" />

      <div v-else>
        <div class="grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <SquareCard
            v-for="item in subPodcasts"
            :key="item.id"
            :item="item"
            :active="currentTrack?.id === item.id && playing"
            @play="selectPodcast(item)"
            @toggle-favourite="handleToggleFavourite(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
