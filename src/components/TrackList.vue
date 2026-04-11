<script setup lang="ts">
import type { MediaItem } from '../types'

import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

import { usePlayer } from '../composables/usePlayer'

interface Props {
  parent: MediaItem
  tracks: MediaItem[]
  loading: boolean
  pageSize: number
}

const props = defineProps<Props>()
const emit = defineEmits(['load-more', 'playall', 'favourite', 'click'])

const { currentTrack, playItem } = usePlayer()

const observerTarget = ref<HTMLElement | null>(null)
const hasMore = ref(true)
const currentPage = ref(1)
let observer: IntersectionObserver | null = null

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
  () => props.tracks.length,
  (newLen) => {
    if (newLen === 0) {
      currentPage.value = 1
      hasMore.value = true
      // Re-check visibility after the DOM clears
      nextTick(() => triggerLoad())
    }
  }
)

const handleTrackSelect = async (track: any) => {
  if (props.parent) {
    await playItem(track, props.parent.sourceRef.sourceId)
    emit('click', track)
  }
}

const handlePlayAll = async () => {
  if (props.parent) {
    await playItem(props.parent)
    emit('playall', props.parent)
  }
}

const formatDuration = (durationMs: number | undefined) => {
  if (!durationMs) return ''
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

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
  if (props.tracks.length === 0) triggerLoad()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div v-if="props.parent && props.tracks">
    <main class="max-w-6xl mx-auto px-6 pt-10 pb-40">
      <!-- Album Hero Section -->
      <section
        class="flex flex-col md:flex-row gap-10 items-center md:items-end mb-16 animate-slide-up"
      >
        <div class="relative group shrink-0">
          <img
            :src="props.parent.imageUrl"
            :alt="props.parent.title"
            class="w-64 h-64 md:w-64 md:h-64 object-imageUrl rounded-2xl border border-white/10 group-hover:scale-[1.03] transition-transform duration-700 shadow-2xl"
          />
          <div
            class="absolute -bottom-4 inset-x-4 h-8 bg-[#8A2BE2]/20 blur-2xl rounded-full -z-10 group-hover:bg-[#8A2BE2]/40 transition-all"
          ></div>

          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-[4px]"
          >
            <button
              @click="handlePlayAll"
              class="w-20 h-20 bg-[#8A2BE2] rounded-full flex items-center justify-center shadow-glow-electric animate-float"
            >
              <LucideIcon name="Play" size="36" class="translate-x-1 fill-white text-white" />
            </button>
          </div>
        </div>

        <div class="flex-1 space-y-6 text-center md:text-left">
          <div class="space-y-2">
            <h3
              class="text-4xl md:text-4xl font-black tracking-tighter leading-none bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent uppercase"
            >
              {{ props.parent.title }}
            </h3>
          </div>

          <div
            class="flex items-center justify-center md:justify-start gap-4 text-[#C8A2C8] font-semibold text-lg"
          >
            <span
              class="text-white hover:text-[#A0DFFF] cursor-pointer transition-colors decoration-[#8A2BE2] decoration-2 underline underline-offset-8"
            >
              {{ props.parent.artist }}
            </span>
            <span class="w-1.5 h-1.5 bg-[#8A2BE2] rounded-full shadow-[0_0_5px_#8A2BE2]"></span>
            <span class="text-white/60">{{ props.parent.releaseDate }}</span>
          </div>

          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
            <button
              class="px-10 py-4 bg-[#8A2BE2] text-white font-black rounded-xl shadow-[0_0_30px_rgba(138,43,226,0.5)] hover:shadow-[0_0_40px_rgba(138,43,226,0.7)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
              @click="handlePlayAll"
            >
              <LucideIcon name="Play" size="20" class="fill-current" />
              PLAY NOW
            </button>
            <button
              class="p-4 glass rounded-xl hover:bg-white/10 transition-all text-white border-white/10"
              @click="$emit('favourite', props.parent)"
            >
              <LucideIcon name="Heart" size="20" />
            </button>
          </div>
        </div>
      </section>

      <!-- Tracklist Section -->
      <section
        class="glass rounded-[32px] overflow-hidden border-white/5 shadow-2xl animate-fade-in mb-20"
      >
        <div
          class="grid grid-cols-[60px_1fr_120px_60px] px-8 py-5 text-xs font-black text-[#C8A2C8]/40 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]"
        >
          <span class="text-center">#</span>
          <span>Title / Artist</span>
          <span class="hidden sm:block text-right pr-10">Popularity</span>
          <div class="flex justify-end">
            <LucideIcon name="Clock" size="16" />
          </div>
        </div>

        <div class="divide-y divide-white/[0.03]">
          <div
            v-for="(track, idx) in props.tracks"
            :key="track.id"
            @click="handleTrackSelect(track)"
            :class="[
              'grid grid-cols-[60px_1fr_120px_60px] items-center px-8 py-5 cursor-pointer transition-all duration-300 group border-l-4',
              currentTrack?.id === track.id
                ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]'
                : 'hover:bg-white/[0.04] border-transparent',
            ]"
          >
            <div class="text-center">
              <div
                v-if="currentTrack?.id === track.id"
                class="flex items-end justify-center gap-[3px] h-4"
              >
                <div
                  class="w-1 bg-[#A0DFFF] rounded-full animate-bar-grow shadow-[0_0_8px_#A0DFFF]"
                ></div>
                <div
                  class="w-1 bg-[#A0DFFF] rounded-full animate-bar-grow-slow shadow-[0_0_8px_#A0DFFF]"
                ></div>
                <div
                  class="w-1 bg-[#A0DFFF] rounded-full animate-bar-grow-fast shadow-[0_0_8px_#A0DFFF]"
                ></div>
              </div>
              <template v-else>
                <span
                  :class="[
                    'font-mono text-sm group-hover:hidden',
                    currentTrack?.id === track.id ? 'text-[#A0DFFF]' : 'text-[#C8A2C8]/30',
                  ]"
                >
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>

                <LucideIcon
                  name="Play"
                  size="16"
                  :class="[
                    'hidden group-hover:block mx-auto',
                    currentTrack?.id === track.id ? 'text-[#A0DFFF] fill-current' : 'text-white',
                  ]"
                />
              </template>
            </div>

            <div class="flex flex-col">
              <span
                :class="[
                  'font-bold text-base tracking-tight transition-colors',
                  currentTrack?.id === track.id
                    ? 'text-[#A0DFFF]'
                    : 'group-hover:text-white text-white/90',
                ]"
              >
                {{ track.title }}
              </span>
              <span class="text-xs font-medium text-[#C8A2C8]/60 uppercase tracking-widest">{{
                track.artist
              }}</span>
            </div>

            <div class="hidden sm:flex items-center justify-end pr-10">
              <div class="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#8A2BE2] to-[#A0DFFF] rounded-full transition-all duration-1000"
                  :style="{
                    width: currentTrack?.id === track.id ? '95%' : 60 + idx * 4 + '%',
                  }"
                ></div>
              </div>
            </div>

            <div class="flex items-center justify-end">
              <span
                :class="[
                  'font-mono text-sm',
                  currentTrack?.id === track.id ? 'text-[#A0DFFF]' : 'text-[#C8A2C8]/40',
                ]"
              >
                {{ formatDuration(track.durationMs) }}
              </span>
            </div>
          </div>
        </div>

        <div
          ref="observerTarget"
          class="w-full min-h-[50px] flex justify-center items-center py-10"
        >
          <div v-if="loading" class="flex gap-2 items-center text-green-500">
            <div class="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"
            ></div>
            <div
              class="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]"
            ></div>
          </div>
          <p
            v-else-if="!hasMore && tracks.length > 0"
            class="text-white/40 text-xs italic uppercase tracking-widest"
          ></p>
        </div>
      </section>
    </main>
  </div>
</template>
