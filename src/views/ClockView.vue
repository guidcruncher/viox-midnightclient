<template>
  <div class="flex items-center justify-center min-h-screen">
    <Clock :is24Hour="is24Hour"></Clock>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const is24Hour = ref(true)

onMounted(async () => {})
</script>
