<template>
  <main class="flex justify-center px-6 py-16">
    <div
      class="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-10 space-y-10 overflow-hidden"
    >
      <!-- Internal gradient background -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute top-0 left-0 w-[60%] h-[60%] bg-purple-700/20 blur-[100px] rounded-full"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-[50%] h-[50%] bg-blue-400/15 blur-[120px] rounded-full"
        ></div>
      </div>

      <!-- Header -->
      <header
        class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        <div class="flex items-center gap-4">
          <img
            src="@/assets/logo.png"
            alt="VIOX"
            class="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          />
          <span class="tracking-[0.3em] text-xl font-medium uppercase">VIOX</span>
        </div>

        <div class="flex flex-col items-start sm:items-end">
          <span class="uppercase tracking-[0.2em] text-purple-300 text-sm">
            Sound, Structured.
          </span>
          <span class="text-gray-300 text-sm"
            >Version {{ version }} Server {{ serverVersion }}</span
          >
        </div>
      </header>

      <!-- Body -->
      <section class="relative z-10 space-y-6">
        <p class="text-gray-300 leading-relaxed">
          VIOX is a modular music server and player designed for clarity, control, and
          composability. It brings a glassy, dark‑violet interface together with deterministic audio
          routing for multi‑speaker playback that simply works.
        </p>

        <p class="text-gray-300 leading-relaxed">
          Every part of VIOX is built as an explicit module: players, nodes, routing, sync, and
          configuration. You always know where audio is flowing and how each component interacts.
          VIOX is not just a player — it is your audio infrastructure.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { utilityClient } from "../api/utility"
import { version } from "@/version"
import { ref, onMounted } from "vue"

const serverVersion = ref("")
onMounted(async () => {
  serverVersion.value = await utilityClient.getServerVersion()
})
</script>
