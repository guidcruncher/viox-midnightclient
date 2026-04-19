<script setup lang="ts">
import { ref } from 'vue'
const is24Hour = ref(true)
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center">
    <Clock :is24Hour="is24Hour" />

<MusicVisualizer 
        :sensitivity="1200"
        bar-color="#00d4ff" 
      />

  </div>
</template>
