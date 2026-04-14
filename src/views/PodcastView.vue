<script setup lang="ts">
import type { MediaItem } from "../types";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import { ApiClient } from "@/api";
import { getQueryString } from "@/utils/getQueryString";

interface LoadMoreEvent {
  offset: number;
  limit: number;
  done: (moreAvailable: boolean) => void;
}

const items = ref<MediaItem[]>([]);
const isLoading = ref(false);
const podcastId = ref("");
const podcast = ref<MediaItem | undefined>(undefined);
const pageSize = 20;
const ready = ref(false);

const handleLoadMore = async ({ offset, limit, done }: LoadMoreEvent) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    if (offset == 0) items.value = []; // Clear items on initial load or filter change

    const response = (await ApiClient.getItems(podcastId.value, offset, limit)).data;

    items.value.push(...response);
    const moreAvailable = response.length != 0;
    done(moreAvailable);
  } catch (error) {
    console.error("Failed to load items:", error);
    done(false); // Stop observing on error
  } finally {
    isLoading.value = false;
  }
};

// Initial fetch
onMounted(async () => {
  const route = useRoute();
  podcastId.value = getQueryString(route.query.id);
  podcast.value = (await ApiClient.getLibraryItem(podcastId.value)).data;
  //  handleLoadMore({ offset: 0, limit: pageSize, done: () => {} })
  ready.value = true;
});

const handleSubscribe = async () => {
  if (podcast.value?.subscribed) {
    await ApiClient.unsubscribe(podcastId.value);
  } else {
    await ApiClient.subscribe(podcastId.value);
  }
  podcast.value = (await ApiClient.getLibraryItem(podcastId.value)).data;
};

const handleAdd = async () => {
  await ApiClient.addToLibrary(podcastId.value);
};

const handlePlayAll = async () => {
  await ApiClient.play(podcastId.value);
};
</script>

<template>
  <div v-if="ready">
    <TrackList
      v-if="podcast && items"
      :parent="podcast"
      :tracks="items"
      :loading="isLoading"
      :page-size="pageSize"
      @subscribe="handleSubscribe"
      @favourite="handleAdd"
      @playall="handlePlayAll"
      @load-more="handleLoadMore"
    />
  </div>
</template>
