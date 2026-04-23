<template>
  <div class="fixed inset-0 flex items-center justify-center">
    <div
      class="text-white flex justify-center overflow-hidden font-sans transition-all duration-500 w-fit mx-auto"
    >
      <div class="relative z-10 w-full flex flex-col items-center">
        <div
          class="bg-gradient-to-br from-viox-deep to-slate-900 p-[2px] shadow-glow-cyan w-full transition-all duration-500 rounded-[3rem]"
        >
          <div
            class="bg-slate-900/90 backdrop-blur-3xl border border-white/10 shadow-preset-inset flex transition-all duration-500 rounded-[2.9rem] px-10 py-12 md:px-16 md:py-14 flex-col items-center"
          >
            <div class="mb-6 flex items-center gap-3 opacity-60">
              <div class="flex items-center gap-3">
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
            </div>
            <div class="flex items-center gap-4">
              <h1
                class="font-display font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-viox-lilac transition-all text-7xl md:text-9xl"
              >
                <div>
                  <span class="block sm:hidden">xs</span>
                  <span class="hidden sm:block md:hidden">sm</span>
                  <span class="hidden md:block lg:hidden">md</span>
                  <span class="hidden lg:block xl:hidden">lg</span>
                  <span class="hidden xl:block 2xl:hidden">xl</span>
                  <span class="hidden 2xl:block">2xl</span>
                </div>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
