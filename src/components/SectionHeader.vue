<script setup lang="ts">
import type { IconName } from '@/generated/icon-types'

import LucideIcon from './LucideIcon.vue'

defineProps<{
  title?: string
  iconName?: IconName | string
}>()
</script>

<template>
  <div class="mb-4 mt-6 flex items-end justify-between px-2 first:mt-2">
    <!-- Left side -->
    <div class="flex items-center gap-2 text-white">
      <LucideIcon v-if="iconName" :name="iconName" :size="20" class="text-cyan-400" />
      <h2 class="text-xl font-bold tracking-tight">{{ title }}</h2>
    </div>

    <!-- Right side slot (fix) -->
    <div class="flex items-center">
      <slot name="right" />
    </div>
  </div>
</template>
