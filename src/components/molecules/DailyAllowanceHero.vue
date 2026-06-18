<script setup>
import { computed } from 'vue'

// Backend serialises BigDecimal as JSON numbers, so accept both number and string.
const props = defineProps({
  todayRemaining: { type: [String, Number], required: true },
  dailyAllowance: { type: [String, Number], required: true },
  todaySpent: { type: [String, Number], required: true },
})

const remaining = computed(() => Number(props.todayRemaining))
const isOver = computed(() => remaining.value < 0)

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

const amount = computed(
  () => `${isOver.value ? '−' : ''}${eur(Math.abs(remaining.value))}`,
)
</script>

<template>
  <section class="hero" :class="{ over: isOver }">
    <p class="amount">{{ amount }}</p>
    <p class="status">{{ isOver ? 'Over budget today' : 'Safe to spend today' }}</p>
    <p class="detail">
      {{ eur(Number(dailyAllowance)) }} allowance · {{ eur(Number(todaySpent)) }} spent
    </p>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-8) var(--space-4) var(--space-6);
  --ring: var(--c-good);
}
.hero.over {
  --ring: var(--c-bad);
}
.amount {
  margin: 0;
  font-size: clamp(2.75rem, 14vw, 3.75rem);
  font-weight: var(--weight-bold);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--ring);
  line-height: 1.1;
}
.status {
  margin: var(--space-2) 0 0;
  font-size: var(--text-base);
  color: var(--c-text-muted);
}
.detail {
  margin: var(--space-3) 0 0;
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
