<script setup lang="ts">
import { useRouter, useRoute, RouteMeta } from 'vue-router'

import NavButton from './NavButton.vue'

const router = useRouter()
const route = useRoute()

// Type predicate to ensure sidebar metadata is non-null
function hasSidebar(
  r: ReturnType<typeof router.getRoutes>[number]
): r is typeof r & { meta: { sidebar: NonNullable<RouteMeta['sidebar']> } } {
  return r.meta?.sidebar != null
}

const sidebarItems = router
  .getRoutes()
  .filter(hasSidebar)
  .sort((a, b) => a.meta.sidebar.order - b.meta.sidebar.order)
  .map((r) => ({
    name: r.name as string,
    icon: r.meta.sidebar.icon,
    label: r.meta.sidebar.label,
  }))
</script>

<template>
  <nav
    class="order-2 z-30 flex w-full flex-row items-center justify-between border-t border-white/10 bg-black/80 p-2 backdrop-blur-xl md:order-1 md:h-full md:w-24 md:flex-col md:justify-start md:gap-4 md:border-r md:border-t-0 md:pt-8"
  >
    <div class="flex w-full flex-row justify-around gap-1 md:w-auto md:flex-col md:gap-4">
      <NavButton
        v-for="item in sidebarItems"
        :key="item.name"
        :active="route.name === item.name"
        :iconName="item.icon"
        :label="item.label"
        @click="router.push({ name: item.name })"
      />
    </div>
  </nav>
</template>
