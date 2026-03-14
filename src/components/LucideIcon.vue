<script setup lang="ts">
import { computed } from "vue"
import { iconMap } from "@/generated/icon-map"
import type { IconName } from "@/generated/icon-types"

const props = defineProps<{
  name: IconName | string
  size?: number | string
  class?: string
}>()

const sizeNum = computed(() => {
  if (!props.size) return 20
  if (props.size == "") return 20
  return parseInt(String(props.size))
})

const iconComponent = computed(() => {
  return iconMap[props.name as IconName] || iconMap["BadgeQuestionMark"]
})
</script>

<template>
  <component :is="iconComponent" :size="sizeNum" :class="props.class" stroke-width="2" />
</template>
