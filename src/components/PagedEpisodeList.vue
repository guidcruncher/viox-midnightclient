<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import Loading from "./Loading.vue"
import LucideIcon from "./LucideIcon.vue"
import { usePlayer } from "../composables/usePlayer"

const props = defineProps({
  results: {
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

const playItem = (item) => emit("play", item)
</script>

<template>
  <div class="paged-list-wrapper">
    <div v-if="results.length > 0" class="grid grid-cols-1 gap-2 pb-24">
      <div
        v-for="item in results"
        :key="item.id"
        @click="playItem(item)"
        class="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3 hover:border-cyan-500/30 hover:bg-white/10 active:scale-[0.99]"
      >
        <div class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-black/40">
          <LucideIcon
            v-if="!item.img"
            name="File"
            class="absolute inset-0 m-auto text-indigo-400"
            :size="24"
          />
          <img v-else :src="item.img" class="h-full w-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="truncate font-medium text-white group-hover:text-cyan-300">
            {{ item.title }}
          </h4>
          <p class="truncate text-xs text-white/50">{{ item.subtitle }} • {{ item.format }}</p>
        </div>
        <div class="text-white/20 group-hover:text-white">
          <LucideIcon
            :name="item.isFolder ? 'MoreHorizontal' : 'Play'"
            :size="20"
            class="fill-current"
          />
        </div>
      </div>
    </div>

    <div ref="observerTarget" class="w-full py-10 flex justify-center">
      <Loading v-if="loading" />
      <p v-else-if="!hasMore && results.length > 0" class="text-gray-500 text-sm italic">
        Viewing all
      </p>
    </div>
  </div>
</template>
