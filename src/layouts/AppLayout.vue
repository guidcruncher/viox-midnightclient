<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import BackgroundEffects from "../components/BackgroundEffects.vue"
import SidebarNav from "../components/SidebarNav.vue"
import HeaderBar from "../components/HeaderBar.vue"
import PlayerMini from "../components/PlayerMini.vue"
import PlayerFullscreen from "../components/PlayerFullscreen.vue"
import { usePlayer } from "../composables/usePlayer"
import { useDeviceDetector } from "../composables/useDeviceDetector"
import { useRouter, useRoute } from "vue-router"

const { isMobile } = useDeviceDetector()
const { showFullPlayer } = usePlayer()
const cleanUI = ref<boolean>(false)

watch(
  () => isMobile,
  async (value) => {
    if (value == undefined) return
    const route = useRoute()
    const router = useRouter()

    if (isMobile.value && route.name != "mobile") {
      router.push({ name: "mobile" })
    }
  },
)

onMounted(() => {
  const route = useRoute()
  const router = useRouter()

  cleanUI.value = Boolean(route.meta.clean ?? false)

  if (!cleanUI.value) {
    if (isMobile.value && route.name != "mobile") {
      router.push({ name: "mobile" })
    }
  }
})
</script>

<template>
  <div
    class="flex h-[100dvh] w-full flex-col overflow-hidden bg-black font-sans text-gray-100 selection:bg-cyan-500/30 md:flex-row"
  >
    <!-- BACKGROUND EFFECTS -->
    <BackgroundEffects v-if="!cleanUI" />

    <!-- SIDEBAR (LEFT ON DESKTOP, BOTTOM ON MOBILE) -->
    <SidebarNav v-if="!cleanUI" />

    <!-- MAIN CONTENT AREA -->
    <main
      class="relative order-1 flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide z-10 md:order-2 md:p-8"
    >
      <div class="mx-auto max-w-7xl pb-32">
        <HeaderBar v-if="!cleanUI" />

        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- FLOATING MINI PLAYER -->
    <PlayerMini v-if="!cleanUI" />

    <!-- FULLSCREEN PLAYER OVERLAY -->
    <PlayerFullscreen v-if="!cleanUI && showFullPlayer" />
  </div>
</template>
