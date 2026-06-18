<script setup>
defineProps({
  label: { type: String, required: true },
  // NEED | WANT | null — used for a subtle tint (NEED vs WANT lands in Phase 6).
  type: { type: String, default: null },
})
</script>

<template>
  <span class="pill" :class="type ? type.toLowerCase() : null">{{ label }}</span>
</template>

<style scoped>
.pill {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: 999px;
  font-size: 0.75rem;
  background: var(--c-surface-2);
  color: var(--c-text-muted);
  border: 1px solid var(--c-border);
  white-space: nowrap;
}
</style>
