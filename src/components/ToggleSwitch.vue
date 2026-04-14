<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      class="sr-only peer"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <div
      class="w-14 h-7 bg-white/10 rounded-full relative transition-colors peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-purple-600"
    >
      <div
        class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
        :class="modelValue ? 'translate-x-7' : 'translate-x-0'"
      ></div>
    </div>
  </label>
</template>
