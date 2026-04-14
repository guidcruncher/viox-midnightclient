<script lang="ts">
import { defineComponent } from 'vue'

import AuthService from '../services/authService'

export default defineComponent({
  async mounted() {
    await AuthService.handleCallback()

    this.$router.replace('/')
  },
})
</script>

<template>
  <div>Signing you in…</div>
</template>
