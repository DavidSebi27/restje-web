<script setup>
import { RouterLink } from 'vue-router'

// Bottom tab bar. Kanji sits under each label.
const tabs = [
  { to: '/', label: 'Today', jp: '今日' },
  { to: '/upcoming', label: 'Upcoming', jp: '予定' },
  { to: '/save', label: 'Save', jp: '貯金' },
  { to: '/settings', label: 'Settings', jp: '設定' },
]
</script>

<template>
  <nav class="app-nav">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab">
      <span class="label">{{ t.label }}</span>
      <span class="jp">{{ t.jp }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-nav {
  position: sticky;
  bottom: 0;
  display: flex;
  border-top: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-bg) 82%, transparent);
  backdrop-filter: saturate(140%) blur(12px);
  padding-bottom: env(safe-area-inset-bottom);
}
.tab {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-3) var(--space-1);
  color: var(--c-text-muted);
}
.tab .label {
  font-size: 0.8rem;
  white-space: nowrap;
}
.tab .jp {
  font-size: 0.68rem;
  color: var(--c-text-muted);
  opacity: 0.7;
}
.tab.router-link-exact-active {
  color: var(--c-accent);
}
.tab.router-link-exact-active .jp {
  color: var(--c-accent);
  opacity: 1;
}
</style>
