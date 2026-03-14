<script setup lang="ts">
import Loading from "../components/Loading.vue"
import { ref, onMounted } from "vue"
import { dashboardApi } from "../api/dashboard"
import type { MediaItem } from "../types"
import { usePlayer } from "../composables/usePlayer"
import SquareCard from "../components/SquareCard.vue"
import SectionHeader from "../components/SectionHeader.vue"

const { toggleFavourite, currentTrack, playing, playItem } = usePlayer()

const presets = ref<MediaItem[]>([])
const recentRadio = ref<MediaItem[]>([])
const isLoading = ref(true)

const handleSelect = async (item: any) => {
  await playItem(item)
}

onMounted(async () => {
  try {
    const [presetsData, radioData] = await Promise.all([
      dashboardApi.getPresets(),
      dashboardApi.getRecentActivity(20),
    ])
    presets.value = presetsData
    recentRadio.value = radioData
  } finally {
    isLoading.value = false
  }
})

const handleToggleFavourite = async (item: any) => {
  await toggleFavourite(item)
  const [presetsData, radioData] = await Promise.all([
    dashboardApi.getPresets(),
    dashboardApi.getRecentActivity(20),
  ])
  presets.value = presetsData
  recentRadio.value = radioData
}
</script>

<template>
  <div>
    <SectionHeader title="Quick Presets" iconName="Heart" />
    <Loading v-if="isLoading" />

    <div v-else>
      <div class="grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SquareCard
          v-for="item in presets"
          :key="item.id"
          :item="item"
          :active="currentTrack?.id === item.id && playing"
          @play="handleSelect"
          @toggle-play="toggleFavourite"
          @toggle-favourite="handleToggleFavourite(item)"
        />
      </div>

      <SectionHeader title="Recent History" iconName="History" />
      <div class="grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SquareCard
          v-for="item in recentRadio"
          :key="item.id"
          :item="item"
          :active="currentTrack?.id === item.id && playing"
          @play="handleSelect"
          @toggle-favourite="handleToggleFavourite(item)"
        />
      </div>
    </div>
  </div>
</template>
