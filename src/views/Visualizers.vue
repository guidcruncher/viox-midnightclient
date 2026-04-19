<template>
  <!-- Fullscreen container -->
  <div
    class="w-full h-[70vh] flex flex-col bg-slate-950 text-slate-100 overflow-hidden"
  >
    <!-- Grid fills the rest of the screen -->
    <div class="flex-1 p-4 overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full h-full">
        <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          <FftBarVisualizer />
        </div>

        <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          <FftCircleVisualizer />
        </div>

        <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          <FftWaveformVisualizer />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
