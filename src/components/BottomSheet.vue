<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        @click="$emit('close')"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
      ></div>
    </Transition>

    <Transition name="sheet">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-3xl p-6 bg-white/5 border-t border-white/10 max-w-lg mx-auto backdrop-blur-2xl"
      >
        <div class="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4"></div>
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({ isOpen: Boolean })
defineEmits(["close"])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sheet-enter-active {
  animation: sheet-up 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-leave-active {
  animation: sheet-up 0.3s reverse ease-in;
}

@keyframes sheet-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
