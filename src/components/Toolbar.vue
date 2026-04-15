<script lang="ts" setup>
import type { IconName } from '@/generated/icon-types'

export interface ToolbarButton {
  key: string
  label: string
  icon: IconName | string
}

interface Props {
  active: string
  buttons: ToolbarButton[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:active', value: string): void
  (e: 'click', value: string): void
}>()

const handleClick = (button: any) => {
  emit('update:active', button.key)
  emit('click', button.key)
}
</script>

<template>
  <nav class="w-full glass sticky top-0 z-50">
    <div class="flex items-center h-16 px-4 overflow-x-auto flex-nowrap gap-2 no-scrollbar">
      <button
        v-for="button in buttons"
        :key="button.key"
        @click="handleClick(button)"
        class="toolbar-item"
        :class="button.key === active ? 'toolbar-item-active' : 'toolbar-item-inactive'"
      >
        <LucideIcon v-if="button.icon" :name="button.icon" />
        {{ button.label }}
      </button>
    </div>
  </nav>
</template>
