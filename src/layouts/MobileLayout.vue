<script setup lang="ts">
import { onMounted, watch } from "vue"
import { useDeviceDetector } from "../composables/useDeviceDetector"
import { useRouter, useRoute } from "vue-router"

const { isMobile } = useDeviceDetector()

watch(
  () => isMobile,
  async (value) => {
    if (value == undefined) return
    const route = useRoute()
    const router = useRouter()

    if (!isMobile.value && route.name != "mobile") {
      router.push({ name: "dashboard" })
    }
  },
)

onMounted(() => {
  const route = useRoute()
  const router = useRouter()

  if (!isMobile.value && route.name != "mobile") {
    router.push({ name: "dashboard" })
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
    <main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>
