<template>
  <div class="w-full">
    <!-- Trigger Button -->
    <button
      @click="toggle"
      class="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
    >
      <LucideIcon name="Search" :size="20" />
    </button>

    <!-- Sliding Overlay -->
    <transition name="slide">
      <div
        v-if="isOpen"
        class="mt-2 relative w-full text-viox-ice animate-slide-up backdrop-blur-xl bg-viox-deep/40 border-t border-white/10 shadow-preset-inset px-6 py-3 min-h-[60px]"
      >
        <!-- Close Button -->
        <button
          @click="close"
          class="absolute top-3 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
        >
          <LucideIcon name="X" :size="20" />
        </button>

        <!-- Slot content (left aligned) -->
        <div class="flex flex-col items-start gap-2 pr-12">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['open', 'close'])
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
  emit(isOpen.value ? 'open' : 'close')
}

function close() {
  isOpen.value = false
  emit('close')
}
</script>

<style scoped>
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 200ms ease;
}
</style>
