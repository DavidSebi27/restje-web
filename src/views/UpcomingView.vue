<script setup>
import { onMounted, computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useAliasStore } from '@/stores/aliases'
import Money from '@/components/atoms/Money.vue'

const budget = useBudgetStore()
const alias = useAliasStore()

onMounted(() => budget.load())

const today = new Date().getDate()

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Recurring bills whose day-of-month is today or later this month.
const upcoming = computed(() =>
  [...budget.recurring]
    .filter((r) => (r.dayOfMonth ?? 1) >= today)
    .sort((a, b) => (a.dayOfMonth ?? 1) - (b.dayOfMonth ?? 1)),
)
const upcomingTotal = computed(() =>
  upcoming.value.reduce((s, r) => s + Math.abs(Number(r.amount)), 0),
)

// Already paid (or due earlier in the month) — shown muted for context.
const paid = computed(() =>
  [...budget.recurring]
    .filter((r) => (r.dayOfMonth ?? 1) < today)
    .sort((a, b) => (a.dayOfMonth ?? 1) - (b.dayOfMonth ?? 1)),
)
</script>

<template>
  <main class="upcoming">
    <div class="head">
      <h1>Upcoming</h1>
      <Money v-if="upcoming.length" class="total" :amount="-upcomingTotal" colour />
    </div>
    <p class="lead">Recurring bills still due this month.</p>

    <div v-if="upcoming.length" class="list">
      <div v-for="r in upcoming" :key="r.id || r.name" class="row">
        <div class="meta">
          <span class="name">{{ alias.label(r.id, r.name) }}</span>
          <span class="when">due {{ ordinal(r.dayOfMonth || 1) }}</span>
        </div>
        <Money :amount="-Math.abs(Number(r.amount))" colour />
      </div>
    </div>
    <p v-else class="empty">Nothing left to pay this month. 🦕</p>

    <template v-if="paid.length">
      <h2 class="section-title">Earlier this month</h2>
      <div class="list muted">
        <div v-for="r in paid" :key="r.id || r.name" class="row">
          <div class="meta">
            <span class="name">{{ alias.label(r.id, r.name) }}</span>
            <span class="when">{{ ordinal(r.dayOfMonth || 1) }}</span>
          </div>
          <Money :amount="-Math.abs(Number(r.amount))" />
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.upcoming {
  padding: var(--space-4) var(--space-4) var(--space-8);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
h1 {
  font-size: 1.4rem;
  margin: 0;
}
.total {
  font-variant-numeric: tabular-nums;
  font-weight: var(--weight-medium);
}
.lead {
  color: var(--c-text-muted);
  margin: var(--space-1) 0 var(--space-6);
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  margin: var(--space-8) 0 var(--space-3);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--c-border);
}
.list.muted .row {
  color: var(--c-text-muted);
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.when {
  font-size: var(--text-sm);
  color: var(--c-text-muted);
}
.empty {
  color: var(--c-text-muted);
}
</style>
