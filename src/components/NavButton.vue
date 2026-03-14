<script setup lang="ts">
import LucideIcon from "./LucideIcon.vue"

defineProps<{
  active?: boolean
  iconName: string
  label: string
}>()

defineEmits<{
  (e: "click"): void
}>()
</script>

<template>
  <button
    @click="$emit('click')"
    class="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-3 transition-all duration-200 md:flex-row md:justify-start md:px-4 md:py-4"
    :class="
      active
        ? 'bg-white/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]'
        : 'text-white/40 hover:bg-white/5 hover:text-white'
    "
  >
    <LucideIcon
      :name="iconName"
      :size="24"
      class="transition-transform active:scale-90"
      :class="active ? 'stroke-[2.5px]' : 'stroke-2'"
    />
    <span class="text-[10px] font-medium md:text-sm" :class="{ 'text-white': active }">
      {{ label }}
    </span>
  </button>
</template>
