<template>
  <div class="text-white flex justify-center overflow-hidden font-sans w-[60vw] h-[60vh]">
    <!-- Fill parent -->
    <div class="relative z-10 w-full h-full">
      <div
        class="bg-gradient-to-br from-viox-deep to-slate-900 p-[2px] rounded-[3rem] shadow-glow-cyan w-full h-full"
      >
        <div
          class="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.9rem]
                 shadow-preset-inset flex items-center justify-center
                 w-full h-full p-8"
        >
          <FftBarVisualizer class="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FftBarVisualizer from "@/components/FftBarVisualizer.vue";
</script>
