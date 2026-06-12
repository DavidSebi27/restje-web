<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNav from '@/components/organisms/AppNav.vue'
import InstallPrompt from '@/components/organisms/InstallPrompt.vue'

const route = useRoute()
// Full-screen, chrome-free views.
const showNav = computed(() => !['/login', '/onboarding'].includes(route.path))
</script>

<template>
  <div class="app-shell">
    <div class="content">
      <RouterView />
    </div>
    <AppNav v-if="showNav" />
    <InstallPrompt />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content {
  flex: 1;
}
</style>
