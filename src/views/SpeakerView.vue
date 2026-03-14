ao
<template>
  <div v-for="item in speakers">
    <div class="flex items-center gap-4 text-sm text-slate-200" v-if="!item.connected">
      <!-- Red LED -->
      <div class="flex items-center gap-2">
        <span
          class="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.9)]"
        >
          <span class="absolute inset-0 rounded-full bg-red-400 opacity-60 blur-[2px]"></span>
        </span>
        <span class="uppercase tracking-wide text-xs text-red-300">Offline</span>
      </div>

      <!-- Green LED -->
      <div class="flex items-center gap-2" v-if="item.connected">
        <span
          class="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
        >
          <span class="absolute inset-0 rounded-full bg-emerald-300 opacity-60 blur-[2px]"></span>
        </span>
        <span class="uppercase tracking-wide text-xs text-emerald-300">Online</span>
      </div>
    </div>
    {{ item.name }}
    <HorizontalSlider
      v-model="item.volumePercent"
      :min="0"
      :max="100"
      :id="item.id"
      width="w-full"
      @changed="updateVolume"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue"
import ApiClient from "../api/index"

const speakers = ref([] as any[])

const updateVolume = async (payload: { id: string | number; value: number }) => {
  await ApiClient.snapserver.setClientVolume(String(payload.id), {
    percent: payload.value,
    muted: false,
  })
}

onMounted(async () => {
  speakers.value = (await ApiClient.snapserver.getSpeakers()).data as any[]
})
</script>
