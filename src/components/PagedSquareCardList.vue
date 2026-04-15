<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

import Loading from './Loading.vue'
import SquareCard from './SquareCard.vue'

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
  pageSize: {
    type: Number,
    default: 20,
  },
})

const emit = defineEmits(['load-more', 'play'])

const observerTarget = ref(null)
const hasMore = ref(true)
const currentPage = ref(1)

// Prevent missed triggers when loading toggles too slowly
let loadCooldown = false

const triggerLoad = () => {
  if (loadCooldown) return
  if (props.loading || !hasMore.value) return

  loadCooldown = true
  setTimeout(() => (loadCooldown = false), 150)

  const offset = (currentPage.value - 1) * props.pageSize

  emit('load-more', {
    page: currentPage.value,
    offset,
    limit: props.pageSize,
    done: (moreAvailable) => {
      hasMore.value = moreAvailable
      if (moreAvailable) currentPage.value++
    },
  })
}

// Intersection Observer
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) triggerLoad()
  },
  {
    rootMargin: '300px',
    threshold: 0.01,
  }
)

// Ensure observer attaches only after DOM is ready
onMounted(async () => {
  await nextTick()
  triggerLoad()
  if (observerTarget.value) observer.observe(observerTarget.value)
})

onUnmounted(() => {
  observer.disconnect()
})

// Re-observe sentinel after new items render (fixes layout shift issues)
watch(
  () => props.stations.length,
  async () => {
    await nextTick()
    if (observerTarget.value) observer.observe(observerTarget.value)
  }
)

const playItem = (item) => emit('play', item)
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
      />
    </div>

    <div ref="observerTarget" class="w-full min-h-[40px] py-10 flex justify-center">
      <Loading v-if="loading" />
      <p v-else-if="!hasMore && stations.length > 0" class="text-gray-500 text-sm italic">
        Viewing all
      </p>
    </div>
  </div>
</template>
