<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import AppNav from '@/components/organisms/AppNav.vue'
import InstallPrompt from '@/components/organisms/InstallPrompt.vue'
import AppToast from '@/components/organisms/AppToast.vue'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const toast = useToastStore()
// Full-screen, chrome-free views.
const showNav = computed(() => !['/login', '/onboarding'].includes(route.path))
// Import is an occasional action -> floating button, not a permanent tab.
const showImportFab = computed(() => showNav.value && route.path !== '/import')

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
    <RouterLink v-if="showImportFab" to="/import" class="fab" aria-label="Import a CSV">
      <span class="plus">+</span>
    </RouterLink>
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
.fab {
  position: fixed;
  right: var(--space-4);
  bottom: calc(env(safe-area-inset-bottom) + var(--space-12) + var(--space-2));
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-accent);
  color: var(--c-on-accent);
  box-shadow: var(--shadow-md);
  z-index: 40;
}
.fab .plus {
  font-size: 1.6rem;
  line-height: 1;
  margin-top: -2px;
}
</style>
