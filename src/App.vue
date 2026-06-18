<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNav from '@/components/organisms/AppNav.vue'
import InstallPrompt from '@/components/organisms/InstallPrompt.vue'
import AppToast from '@/components/organisms/AppToast.vue'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const toast = useToastStore()
// Full-screen, chrome-free views.
const showNav = computed(() => !['/login', '/onboarding'].includes(route.path))

// A flash set just before a hard reload (e.g. data reset) shows once on load.
onMounted(() => {
  const flash = sessionStorage.getItem('restje.flash')
  if (flash) {
    toast.show(flash)
    sessionStorage.removeItem('restje.flash')
  }
})
</script>

<template>
  <div class="app-shell">
    <div class="content">
      <RouterView />
    </div>
    <AppNav v-if="showNav" />
    <InstallPrompt />
    <AppToast />
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
