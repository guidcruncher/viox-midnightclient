<script setup lang="ts">
import LucideIcon from "./LucideIcon.vue"
import BaseButton from "./BaseButton.vue"

defineProps<{ isOpen: boolean }>()
defineEmits(["close", "confirm"])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        @click.self="$emit('close')"
      >
        <div
          class="w-full max-w-sm glass rounded-3xl border border-white/10 overflow-hidden shadow-glow-cyan animate-slide-up"
        >
          <div class="h-0.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
                  <LucideIcon name="Bell" size="20" class="text-cyan-400" />
                </div>
                <h2 class="font-display text-base font-bold text-white">Notifications</h2>
              </div>
              <button @click="$emit('close')" class="text-white/40">
                <LucideIcon name="X" size="18" />
              </button>
            </div>
            <slot />
            <div class="flex gap-3 mt-6">
              <BaseButton variant="ghost" class="flex-1" @click="$emit('close')">Cancel</BaseButton>
              <BaseButton variant="primary" class="flex-1" @click="$emit('confirm')"
                >Confirm</BaseButton
              >
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
