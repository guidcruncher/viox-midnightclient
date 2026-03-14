<template>
  <div
    class="w-full h-full p-6 bg-gradient-to-b from-black/40 to-black/70 backdrop-blur-xl text-gray-200 rounded-3xl flex flex-col gap-6"
  >
    <div class="bg-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <span class="text-sm tracking-wide">Search</span>
      </div>

      Maximum number of results per source
      <input
        v-model="config.backEndLimit"
        type="text"
        class="flex-1 border border-gray-700 rounded px-3 py-2 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      Maximum number of results
      <input
        v-model="config.maxCacheSize"
        type="text"
        class="flex-1 border border-gray-700 rounded px-3 py-2 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="bg-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <span class="text-sm tracking-wide">Radio</span>
      </div>
      Service Provider
      <select
        v-model="config.radioProvider"
        class="w-[150px] border border-gray-700 rounded px-3 py-2 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="radiobrowser">RadioBrowser</option>
        <option value="tunein">TuneIn</option>
      </select>
    </div>

    <div class="bg-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <span class="text-sm tracking-wide">Spotify</span>
      </div>

      <ToggleSwitch v-model="config.enableCache" /> Enable Spotify cache
    </div>

    <button
      @click.stop="updateConfig"
      class="px-6 py-2 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition"
    >
      Save Configuration
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import ApiClient from "../api/index"

const config = ref<any>({})

const updateConfig = async () => {
  if (config.value) {
    await ApiClient.config.save(config.value)
  }
}

onMounted(async () => {
  config.value = await ApiClient.config.get()
})
</script>
