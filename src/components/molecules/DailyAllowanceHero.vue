<script setup>
import { computed } from 'vue'

const props = defineProps({
  todayRemaining: { type: String, required: true },
  dailyAllowance: { type: String, required: true },
  todaySpent: { type: String, required: true },
})

const remaining = computed(() => Number(props.todayRemaining))
const isOver = computed(() => remaining.value < 0)

const formatted = computed(() =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    Math.abs(remaining.value),
  ),
)
</script>

<template>
  <section class="hero" :class="{ over: isOver }">
    <p class="label">{{ isOver ? 'Over budget today' : 'Safe to spend today' }}</p>
    <p class="amount">{{ isOver ? '-' : '' }}{{ formatted }}</p>
    <p class="sub">
      of {{ Number(dailyAllowance).toFixed(2) }} allowance,
      {{ Number(todaySpent).toFixed(2) }} spent
    </p>
  </section>
</template>

<style scoped>
/* Placeholder styling. The real watch-face visual pass is Phase 8. */
.hero {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}
.label {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0;
}
.amount {
  font-size: 3.5rem;
  font-weight: 700;
  margin: var(--space-1) 0;
  color: var(--c-good);
}
.hero.over .amount {
  color: var(--c-bad);
}
.sub {
  font-size: 0.85rem;
  opacity: 0.6;
  margin: 0;
}
</style>
