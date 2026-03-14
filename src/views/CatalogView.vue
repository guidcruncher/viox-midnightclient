<script setup lang="ts">
import { useRouter } from "vue-router"
import { ref, onMounted } from "vue"
import { podverseApi } from "../api/podverse"
import type { MediaItem } from "../types"
import SquareCard from "../components/SquareCard.vue"
import SectionHeader from "../components/SectionHeader.vue"
import PodcastCardList from "../components/PodcastCardList.vue"
import Loading from "../components/Loading.vue"

interface LoadMoreEvent {
  page: number
  offset: number
  limit: number
  done: (moreAvailable: boolean) => void
}

const router = useRouter()
const category = ref({} as any)
const items = ref<MediaItem[]>([])
const podcasts = ref<MediaItem[]>([])
const isLoading = ref(true)
const viewMode = ref("categories")
const pageNumber = ref(1)

const loadCategories = async () => {
  try {
    podcasts.value = []
    category.value = null
    viewMode.value = "categories"
    pageNumber.value = 1
    isLoading.value = true
    items.value = []
    const [itemsData] = await Promise.all([podverseApi.getCategories()])
    items.value = itemsData
  } finally {
    isLoading.value = false
  }
}

const handleLoadMore = async ({ page, done }: LoadMoreEvent) => {
  if (isLoading.value) {
    return
  }
  const count = await loadPodcasts(page)
  const moreAvailable = count != 0
  done(moreAvailable)
}

const selectItem = async (item: MediaItem) => {
  if (item.isFolder) {
    podcasts.value = []
    category.value = item
    viewMode.value = "podcasts"
    pageNumber.value = 1
    //    await loadPodcasts(1)
    return
  }

  router.push({ name: "episodes", params: { id: item.id, uri: item.uri } })
}

const loadPodcasts = async (page: number) => {
  let count = 0
  try {
    pageNumber.value = page
    isLoading.value = true
    items.value = []
    const [itemsData] = await Promise.all([
      podverseApi.getPodcastsByCategory(category.value.uri, page),
    ])
    podcasts.value.push(...itemsData)
    count = itemsData.length
    return count
  } finally {
    isLoading.value = false
  }
  return count
}

onMounted(async () => {
  await loadCategories()
})
</script>

<template>
  <div>
    <SectionHeader title="Catalog" iconName="Podcast" @Click="loadCategories" />

    <div v-if="viewMode === 'categories'">
      <Loading v-if="isLoading" />

      <div v-else>
        <div class="grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <SquareCard v-for="item in items" :key="item.id" :item="item" @play="selectItem(item)" />
        </div>
      </div>
    </div>

    <PodcastCardList
      v-if="viewMode == 'podcasts'"
      :podcasts="podcasts"
      :loading="isLoading"
      :page-size="20"
      @load-more="handleLoadMore"
      @play="selectItem"
    />
  </div>
</template>
