<script setup lang="ts">
import { ref } from 'vue'

import { usePlayer } from '../composables/usePlayer'

interface toastSetting {
  visible: boolean
  title: string
  message: string
  type: 'info' | 'warning' | 'error'
}

const toast = ref<toastSetting>({
  visible: false,
  title: '',
  message: '',
  type: 'error',
})

const { showFullPlayer } = usePlayer()
</script>

<template>
  <div
    class="flex h-[100dvh] w-full flex-col overflow-hidden bg-black font-sans text-gray-100 selection:bg-cyan-500/30 md:flex-row"
  >
    <BackgroundEffects />

    <SidebarNav />

    <main
      class="relative order-1 flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide z-10 md:order-2 md:p-8"
    >
      <div class="mx-auto max-w-7xl pb-32">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <PlayerMini />

    <PlayerFullscreen v-if="showFullPlayer" />
  </div>

  <NotificationToast
    v-if="toast.visible"
    :title="toast.title"
    :message="toast.message"
    :type="toast.type"
    @close="toast.visible = false"
  />
</template>
