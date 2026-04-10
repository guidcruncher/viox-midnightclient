<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import { usePlayer } from '../composables/usePlayer'

import SquareCard from './SquareCard.vue'

const props = defineProps({
  podcasts: {
    type: Array,
    required: true,
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

const emit = defineEmits(['load-more', 'click'])
const { toggleFavourite } = usePlayer()
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

  emit('load-more', {
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
    rootMargin: '300px', // Fetch early for smoother scrolling
    threshold: 0.01,
  }
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

const selectItem = (item) => emit('click', item)
</script>

<template>
  <div class="paged-list-wrapper">
    <div
      v-if="podcasts.length > 0"
      class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 pb-24"
    >
      <SquareCard
        v-for="item in podcasts"
        :key="item.id"
        :item="item"
        @click="selectItem"
        @toggle-favourite="toggleFavourite(item)"
      />
    </div>

    <div ref="observerTarget" class="w-full py-10 flex justify-center">
      <div v-if="loading" class="flex items-center space-x-2">
        <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
        <span
          class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"
        ></span>
        <span
          class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"
        ></span>
      </div>
      <p v-else-if="!hasMore && podcasts.length > 0" class="text-gray-500 text-sm italic">
        Viewing all
      </p>
    </div>
  </div>
</template>
