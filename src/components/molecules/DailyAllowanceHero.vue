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
const isOver = computed(() => remaining.value < 0)

// Fraction of today's allowance still unspent — drives the dial fill.
const fraction = computed(() => {
  if (isOver.value) return 1
  if (allowance.value <= 0) return 0
  return Math.max(0, Math.min(1, remaining.value / allowance.value))
})

const RADIUS = 52
const CIRC = 2 * Math.PI * RADIUS
const dashoffset = computed(() => CIRC * (1 - fraction.value))

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

const amount = computed(() => `${isOver.value ? '−' : ''}${eur(Math.abs(remaining.value))}`)
</script>

<template>
  <section class="hero" :class="{ over: isOver }">
    <svg class="dial" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="track" cx="60" cy="60" :r="RADIUS" />
      <circle
        class="progress"
        cx="60"
        cy="60"
        :r="RADIUS"
        :stroke-dasharray="CIRC"
        :stroke-dashoffset="dashoffset"
      />
    </svg>

    <p class="amount">{{ amount }}</p>
    <p class="status">{{ isOver ? 'Over budget today' : 'Safe to spend today' }}</p>
    <p class="detail">{{ eur(allowance) }} allowance · {{ eur(Number(todaySpent)) }} spent</p>
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

.dial {
  width: 96px;
  height: 96px;
  transform: rotate(-90deg); /* start the arc at 12 o'clock */
  margin-bottom: var(--space-4);
}
.track {
  fill: none;
  stroke: var(--c-surface);
  stroke-width: 9;
}
.progress {
  fill: none;
  stroke: var(--ring);
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.amount {
  margin: 0;
  font-size: clamp(2.5rem, 13vw, 3.5rem);
  font-weight: var(--weight-bold);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--ring);
  line-height: 1.1;
}
.status {
  margin: var(--space-1) 0 0;
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
