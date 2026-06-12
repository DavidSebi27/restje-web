<script setup>
import { RouterLink } from 'vue-router'

// Bottom tab bar. Grows as the app's main views land (Transactions in Phase 5).
const tabs = [
  { to: '/', label: 'Today' },
  { to: '/import', label: 'Import' },
  { to: '/settings', label: 'Settings' },
]
</script>

<template>
  <nav class="app-nav">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab">
      {{ t.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-nav {
  position: sticky;
  bottom: 0;
  display: flex;
  border-top: 1px solid var(--c-border);
  background: var(--c-bg);
}
.tab {
  flex: 1;
  text-align: center;
  padding: var(--space-3);
  color: var(--c-text-muted);
  font-size: 0.85rem;
}
.tab.router-link-exact-active {
  color: var(--c-accent);
  font-weight: 600;
}
</style>
