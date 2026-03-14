<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import SquareCard from "./SquareCard.vue"
import Loading from "./Loading.vue"
import { usePlayer } from "../composables/usePlayer"

const { toggleFavourite } = usePlayer()

const props = defineProps({
  stations: {
    type: Array,
    required: true,
  },
  currentTrack: {
    type: Object,
    default: null,
  },
  playing: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // New prop for page size
  pageSize: {
    type: Number,
    default: 20,
  },
})

const emit = defineEmits(["load-more", "play"])

const observerTarget = ref(null)
const hasMore = ref(true)
const currentPage = ref(1)

/**
 * Calculates params and emits the fetch event
 */
const triggerLoad = () => {
  if (props.loading || !hasMore.value) return

  // Offset calculation: (Page 1 = 0, Page 2 = 20, etc.)
  const offset = (currentPage.value - 1) * props.pageSize

  emit("load-more", {
    page: currentPage.value,
    offset: offset,
    limit: props.pageSize,
    // Callback to let parent signal if more data exists
    done: (moreAvailable) => {
      hasMore.value = moreAvailable
      if (moreAvailable) {
        currentPage.value++
      }
    },
  })
}

// Setup Intersection Observer
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      triggerLoad()
    }
  },
  {
    rootMargin: "300px", // Fetch early for smoother scrolling
    threshold: 0.01,
  },
)

onMounted(() => {
  // Initial call for the first page
  triggerLoad()

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

onUnmounted(() => {
  observer.disconnect()
})

const handleToggleFavourite = (item) => {
  toggleFavourite(item)
  emit("load-more", {
    page: 1,
    offset: 0,
    limit: props.pageSize,
    // Callback to let parent signal if more data exists
    done: (moreAvailable) => {
      hasMore.value = moreAvailable
      if (moreAvailable) {
        currentPage.value++
      }
    },
  })
}

const playItem = (item) => emit("play", item)
</script>

<template>
  <div class="paged-list-wrapper">
    <div
      v-if="stations.length > 0"
      class="grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <SquareCard
        v-for="item in stations"
        :key="item.id"
        :item="item"
        :active="currentTrack?.id === item.id && playing"
        @play="playItem"
        @toggle-favourite="handleToggleFavourite(item)"
      />
    </div>

    <div ref="observerTarget" class="w-full py-10 flex justify-center">
      <Loading v-if="loading" />
      <p v-else-if="!hasMore && stations.length > 0" class="text-gray-500 text-sm italic">
        Viewing all
      </p>
    </div>
  </div>
</template>
