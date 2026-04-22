<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  is24Hour?: boolean
  timezone?: string
  layout?: 'compact' | 'wide' // New prop to switch styles
}

const props = withDefaults(defineProps<Props>(), {
  is24Hour: false,
  timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  layout: 'compact',
})

const mainTime = ref<string>('00:00')
const seconds = ref<string>('00')
const ampm = ref<string>('--')
const fullDate = ref<string>('Loading...')

let timer: ReturnType<typeof setInterval> | null = null

const updateClock = (): void => {
  const now = new Date()

  try {
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: props.timezone,
      hour12: !props.is24Hour,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }

    const timeString = now.toLocaleTimeString('en-US', timeOptions)
    const parts = timeString.split(' ')
    const time = parts[0]
    const period = parts[1] || ''
    const [h, m, s] = time.split(':')

    mainTime.value = `${h}:${m}`
    seconds.value = s
    ampm.value = period

    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: props.timezone,
      weekday: props.layout === 'wide' ? 'short' : 'long',
      month: props.layout === 'wide' ? 'short' : 'long',
      day: 'numeric',
      year: 'numeric',
    }

    fullDate.value = now.toLocaleDateString('en-US', dateOptions)
  } catch (error) {
    console.error('Viox System Error: Invalid timezone string provided.', error)
  }
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    class="text-white flex justify-center overflow-hidden font-sans transition-all duration-500"
    :class="props.layout === 'wide' ? 'w-full px-2' : 'w-fit mx-auto'"
  >
    <div class="relative z-10 w-full flex flex-col items-center">
      <div
        class="bg-gradient-to-br from-viox-deep to-slate-900 p-[2px] shadow-glow-cyan w-full transition-all duration-500"
        :class="props.layout === 'wide' ? 'rounded-2xl' : 'rounded-[3rem]'"
      >
        <div
          class="bg-slate-900/90 backdrop-blur-3xl border border-white/10 shadow-preset-inset flex transition-all duration-500"
          :class="[
            props.layout === 'wide'
              ? 'rounded-2xl px-6 py-4 flex-row items-center justify-between'
              : 'rounded-[2.9rem] px-10 py-12 md:px-16 md:py-14 flex-col items-center',
          ]"
        >
          <div
            :class="
              props.layout === 'wide'
                ? 'flex flex-col gap-1'
                : 'mb-6 flex items-center gap-3 opacity-60'
            "
          >
            <div
              class="flex items-center gap-3"
              :class="props.layout === 'wide' ? 'opacity-60' : ''"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-pulse"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span
                class="text-[10px] font-bold tracking-[0.3em] uppercase text-viox-ice whitespace-nowrap"
              >
                Viox Digital System
              </span>
            </div>
            <p
              v-if="props.layout === 'wide'"
              class="text-viox-ice/40 text-[10px] font-medium tracking-widest uppercase"
            >
              {{ fullDate }}
            </p>
          </div>

          <div class="flex items-center gap-4">
            <h1
              class="font-display font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-viox-lilac transition-all"
              :class="props.layout === 'wide' ? 'text-4xl md:text-5xl' : 'text-7xl md:text-9xl'"
            >
              {{ mainTime }}
            </h1>

            <div
              class="flex flex-col items-start border-l border-white/10 pl-4 h-full"
              :class="props.layout === 'wide' ? 'justify-center' : ''"
            >
              <span
                class="font-light text-cyan-400 leading-none"
                :class="props.layout === 'wide' ? 'text-2xl' : 'text-3xl md:text-4xl'"
              >
                {{ seconds }}
              </span>
              <span
                v-if="!props.is24Hour"
                class="font-bold text-viox-lilac uppercase tracking-widest mt-1"
                :class="props.layout === 'wide' ? 'text-[9px]' : 'text-xs md:text-sm'"
              >
                {{ ampm }}
              </span>
            </div>
          </div>

          <div
            v-if="props.layout === 'compact'"
            class="mt-8 pt-8 border-t border-white/5 w-full text-center"
          >
            <p class="text-viox-ice/40 text-sm font-medium tracking-widest uppercase">
              {{ fullDate }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col items-center gap-2 opacity-20 font-bold uppercase tracking-[0.5em] transition-all"
        :class="props.layout === 'wide' ? 'mt-2 text-[7px]' : 'mt-8 text-[9px]'"
      >
        <span>Zone: {{ props.timezone }}</span>
      </div>
    </div>
  </div>
</template>
