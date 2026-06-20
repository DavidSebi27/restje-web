<script setup>
import { computed } from 'vue'

// Backend serialises BigDecimal as JSON numbers, so accept both number and string.
const props = defineProps({
  todayRemaining: { type: [String, Number], required: true },
  dailyAllowance: { type: [String, Number], required: true },
  todaySpent: { type: [String, Number], required: true },
})

const remaining = computed(() => Number(props.todayRemaining))
const allowance = computed(() => Number(props.dailyAllowance))
const spent = computed(() => Number(props.todaySpent))
const isOver = computed(() => remaining.value < 0)

// How much of today's allowance is used up — drives the slim progress bar.
const pct = computed(() => {
  if (isOver.value) return 100
  if (allowance.value <= 0) return 0
  return Math.max(0, Math.min(100, (spent.value / allowance.value) * 100))
})

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
    <div class="bar"><div class="fill" :style="{ width: pct + '%' }"></div></div>
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
  padding: var(--space-12) var(--space-4) var(--space-8);
  --ink: var(--c-good);
}
.hero.over {
  --ink: var(--c-bad);
}
.amount {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--ink);
  line-height: 1.05;
}
.status {
  margin: var(--space-3) 0 0;
  font-size: var(--text-base);
  color: var(--c-text);
}
.bar {
  width: min(220px, 62%);
  height: 6px;
  border-radius: 999px;
  background: var(--c-surface);
  overflow: hidden;
  margin: var(--space-4) auto 0;
}
.fill {
  height: 100%;
  border-radius: 999px;
  background: var(--ink);
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.detail {
  margin: var(--space-2) 0 0;
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
