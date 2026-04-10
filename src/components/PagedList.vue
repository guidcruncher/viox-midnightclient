<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps<{
  items: any[]
  loading: boolean
  pageSize: number
}>()

const emit = defineEmits(['load-more'])

const observerTarget = ref<HTMLElement | null>(null)
const hasMore = ref(true)
const currentPage = ref(1)
let observer: IntersectionObserver | null = null

// Calculate offset and notify parent
const triggerLoad = () => {
  if (props.loading || !hasMore.value) return

  const offset = (currentPage.value - 1) * props.pageSize

  emit('load-more', {
    offset,
    limit: props.pageSize,
    done: (moreAvailable: boolean) => {
      hasMore.value = moreAvailable
      if (moreAvailable) {
        currentPage.value++
      }
    },
  })
}

// CRITICAL: Reset internal state if the parent empties the list
watch(
  () => props.items.length,
  (newLen) => {
    if (newLen === 0) {
      currentPage.value = 1
      hasMore.value = true
      // Re-check visibility after the DOM clears
      nextTick(() => triggerLoad())
    }
  }
)

onMounted(async () => {
  await nextTick()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        triggerLoad()
      }
    },
    { rootMargin: '300px', threshold: 0.01 }
  )

  if (observerTarget.value) observer.observe(observerTarget.value)

  // Initial Fetch
  if (props.items.length === 0) triggerLoad()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <slot />

  <div ref="observerTarget" class="w-full min-h-[50px] flex justify-center items-center py-10">
    <div v-if="loading" class="flex gap-2 items-center text-green-500">
      <div class="w-2 h-2 bg-current rounded-full animate-bounce"></div>
      <div class="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
      <div class="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></div>
    </div>
    <p
      v-else-if="!hasMore && items.length > 0"
      class="text-white/40 text-xs italic uppercase tracking-widest"
    >
      End of Results
    </p>
  </div>
</template>
