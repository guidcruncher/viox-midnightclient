<script lang="ts" setup>
import { computed } from "vue"
import LucideIcon from "@/components/LucideIcon.vue"
import type { IconName } from "@/generated/icon-types"
import type { Component } from "vue"

export interface TabItem {
  key: string
  label: string
  icon: IconName | string
  component: Component
}

interface Props {
  active: string
  tabs: TabItem[]
  floating?: boolean
  transitionName?: "fade" | "slide" | "scale"
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: "update:active", value: string): void
  (e: "select", value: string): void
}>()

const activeTab = computed(() => props.tabs.find((t) => t.key === props.active))

const activeComponent = computed<Component | null>(() => activeTab.value?.component ?? null)

const containerClasses = computed(() =>
  props.floating
    ? `
      fixed top-6 left-1/2 -translate-x-1/2
      backdrop-blur-2xl bg-viox-deep/30
      border border-white/10 shadow-glow-cyan
      rounded-3xl px-6 py-3 gap-6
    `
    : `
      relative w-full
      backdrop-blur-xl bg-viox-deep/40
      border-t border-white/10 shadow-preset-inset
      px-6 py-3
    `,
)

const selectTab = (key: string) => {
  emit("update:active", key)
  emit("select", key)
}
</script>

<template>
  <!-- Tab bar at top of container -->
  <nav
    class="flex justify-between items-center text-viox-ice animate-slide-up"
    :class="containerClasses"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="selectTab(tab.key)"
      class="group flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 active:scale-95"
      :class="{
        'bg-white/10 border border-white/20 shadow-glow-cyan': tab.key === active,
        'hover:bg-white/5': tab.key !== active,
      }"
    >
      <LucideIcon
        :name="tab.icon"
        :size="24"
        class="transition-all duration-300"
        :class="
          tab.key === active ? 'text-cyan-400 animate-pulse-slow' : 'group-hover:text-cyan-400'
        "
      />

      <span
        v-if="!floating"
        class="text-xs font-medium"
        :class="tab.key === active ? 'text-cyan-400' : ''"
      >
        {{ tab.label }}
      </span>
    </button>
  </nav>

  <!-- View below tab bar -->
  <Transition :name="transitionName || 'fade'">
    <slot name="view" :component="activeComponent" />
  </Transition>
</template>
