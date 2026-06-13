<script setup>
import { RouterLink } from 'vue-router'

// Bottom tab bar.
const tabs = [
  { to: '/', label: 'Today' },
  { to: '/transactions', label: 'Activity' },
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
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  padding-bottom: env(safe-area-inset-bottom);
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
