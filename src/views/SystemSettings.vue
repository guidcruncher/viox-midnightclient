<template>
  <div
    class="w-full h-full p-6 bg-gradient-to-b from-black/40 to-black/70 backdrop-blur-xl text-gray-200 rounded-3xl flex flex-col gap-6"
  >
    <div class="bg-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <TabBar v-model:active="active" :tabs="tabs" transitionName="slide">
        <template #view="{ component }">
          <component :is="component" />
        </template>
      </TabBar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import TabBar from "@/components/TabBar.vue"
import type { TabItem } from "@/components/TabBar.vue"

import AboutView from "@/views/AboutView.vue"
import SpeakerView from "@/views/SpeakerView.vue"
import SystemConfigView from "@/views/SystemConfigView.vue"

const active = ref("home")

const tabs: TabItem[] = [
  { key: "home", label: "Home", icon: "House", component: AboutView },
  { key: "system", label: "System", icon: "Settings", component: SystemConfigView },
  { key: "speakers", label: "Speakers", icon: "Speaker", component: SpeakerView },
]
</script>
