<script setup lang="ts">
import { ref } from 'vue'

import LucideIcon from './LucideIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  icon?: string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  customClass: '',
})

const buttonRef = ref<HTMLButtonElement | null>(null)

const variants = {
  primary:
    'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_30px_rgba(34,211,238,0.25)]',
  secondary: 'glass border border-cyan-900/60 text-cyan-400 font-medium',
  ghost: 'border border-white/10 text-white/60 font-medium',
  destructive: 'glass border border-red-500/30 text-red-400 font-medium',
}

const createRipple = (e: MouseEvent) => {
  if (!buttonRef.value) return
  const rect = buttonRef.value.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const ripple = document.createElement('span')
  ripple.className = 'ripple-wave' // Defined in global CSS or App.vue
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`
  buttonRef.value.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}
</script>

<template>
  <button
    ref="buttonRef"
    @mousedown="createRipple"
    :class="[
      'touch-active ripple-container overflow-hidden rounded-2xl py-3.5 px-4 text-sm transition-all active:scale-95',
      variants[props.variant],
      props.customClass,
    ]"
  >
    <div class="flex items-center justify-center gap-2">
      <LucideIcon v-if="icon" :name="icon" size="18" />
      <slot />
    </div>
  </button>
</template>
