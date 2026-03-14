<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

interface Props {
  is24Hour?: boolean
  timezone?: string
}

const props = withDefaults(defineProps<Props>(), {
  is24Hour: false,
  timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
})

const mainTime = ref<string>("00:00")
const seconds = ref<string>("00")
const ampm = ref<string>("--")
const fullDate = ref<string>("Loading...")

let timer: ReturnType<typeof setInterval> | null = null

const updateClock = (): void => {
  const now = new Date()

  try {
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: props.timezone,
      hour12: !props.is24Hour,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }

    const timeString = now.toLocaleTimeString("en-US", timeOptions)
    const [time, period] = timeString.split(" ")
    const [h, m, s] = time.split(":")

    mainTime.value = `${h}:${m}`
    seconds.value = s
    ampm.value = period || ""

    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: props.timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }

    fullDate.value = now.toLocaleDateString("en-US", dateOptions)
  } catch (error) {
    console.error("Viox System Error: Invalid timezone string provided.", error)
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
  <div class="min-h-screen text-white flex justify-center overflow-hidden font-sans">
    <div class="relative z-10 px-4">
      <div
        class="bg-gradient-to-br from-viox-deep to-slate-900 p-[2px] rounded-[3rem] shadow-glow-cyan"
      >
        <div
          class="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.9rem] px-10 py-12 md:px-16 md:py-14 shadow-preset-inset flex flex-col items-center"
        >
          <div class="mb-6 flex items-center gap-3 opacity-60">
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span class="text-[10px] font-bold tracking-[0.3em] uppercase text-viox-ice">
              Viox Digital System
            </span>
          </div>

          <div class="flex items-center gap-4">
            <h1
              class="text-7xl md:text-9xl font-display font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-viox-lilac"
            >
              {{ mainTime }}
            </h1>

            <div class="flex flex-col items-start border-l border-white/10 pl-4 h-full">
              <span class="text-3xl md:text-4xl font-light text-cyan-400">
                {{ seconds }}
              </span>
              <span
                v-if="!props.is24Hour"
                class="text-xs md:text-sm font-bold text-viox-lilac uppercase tracking-widest mt-1"
              >
                {{ ampm }}
              </span>
            </div>
          </div>

          <div class="mt-8 pt-8 border-t border-white/5 w-full text-center">
            <p class="text-viox-ice/40 text-sm font-medium tracking-widest uppercase">
              {{ fullDate }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col items-center gap-2 opacity-20 text-[9px] font-bold uppercase tracking-[0.5em]"
      >
        <div class="flex gap-6">
          <span>Format: {{ props.is24Hour ? "24H" : "12H" }}</span>
          <span>Node: 77</span>
        </div>
        <span class="mt-1">Zone: {{ props.timezone }}</span>
      </div>
    </div>
  </div>
</template>
