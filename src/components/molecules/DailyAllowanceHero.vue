<script setup>
import { computed } from 'vue'

const props = defineProps({
  todayRemaining: { type: String, required: true },
  dailyAllowance: { type: String, required: true },
  todaySpent: { type: String, required: true },
})

const remaining = computed(() => Number(props.todayRemaining))
const allowance = computed(() => Number(props.dailyAllowance))
const isOver = computed(() => remaining.value < 0)

// Fraction of today's allowance still unspent — drives the ring fill.
const fraction = computed(() => {
  if (isOver.value) return 1
  if (allowance.value <= 0) return 0
  return Math.max(0, Math.min(1, remaining.value / allowance.value))
})

const RADIUS = 130
const CIRC = 2 * Math.PI * RADIUS
const dashoffset = computed(() => CIRC * (1 - fraction.value))

const formatted = computed(() =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    Math.abs(remaining.value),
  ),
)
</script>

<template>
  <section class="hero" :class="{ over: isOver }">
    <div class="ring-wrap">
      <svg class="ring" viewBox="0 0 300 300" aria-hidden="true">
        <circle class="track" cx="150" cy="150" :r="RADIUS" />
        <circle
          class="progress"
          cx="150"
          cy="150"
          :r="RADIUS"
          :stroke-dasharray="CIRC"
          :stroke-dashoffset="dashoffset"
        />
      </svg>
      <div class="center">
        <p class="label">{{ isOver ? 'Over budget' : 'Safe to spend' }}</p>
        <p class="amount">{{ isOver ? '−' : '' }}{{ formatted }}</p>
        <p class="unit">today</p>
      </div>
    </div>

    <p class="detail">
      <span>{{ Number(dailyAllowance).toFixed(2) }} allowance</span>
      <span class="dot">·</span>
      <span>{{ Number(todaySpent).toFixed(2) }} spent</span>
    </p>
  </section>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: var(--space-8) var(--space-4) var(--space-6);
  --ring: var(--c-good);
}
.hero.over {
  --ring: var(--c-bad);
}

.ring-wrap {
  position: relative;
  width: min(280px, 78vw);
  margin: 0 auto;
  aspect-ratio: 1;
}
.ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* start the arc at 12 o'clock */
}
.track {
  fill: none;
  stroke: var(--c-surface);
  stroke-width: 18;
}
.progress {
  fill: none;
  stroke: var(--ring);
  stroke-width: 18;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}
.label {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  letter-spacing: 0.02em;
}
.amount {
  margin: 0;
  font-size: var(--text-hero);
  font-weight: var(--weight-bold);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--ring);
}
.unit {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--c-text-muted);
}
.detail {
  margin: var(--space-6) 0 0;
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
.detail .dot {
  margin: 0 var(--space-2);
  opacity: 0.5;
}
</style>
