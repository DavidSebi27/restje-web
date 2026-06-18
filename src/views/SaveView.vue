<script setup>
import { onMounted, computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useDashboardStore } from '@/stores/dashboard'
import { useCategoriesStore } from '@/stores/categories'
import { categoryGlyph } from '@/utils/categoryEmoji'
import Money from '@/components/atoms/Money.vue'

const budget = useBudgetStore()
const dashboard = useDashboardStore()
const categories = useCategoriesStore()

onMounted(() => {
  budget.load()
  if (!dashboard.data) dashboard.load()
  categories.load()
})

const today = new Date().getDate()

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Upcoming: recurring bills whose day-of-month is today or later this month.
const upcoming = computed(() =>
  [...budget.recurring]
    .filter((r) => (r.dayOfMonth ?? 1) >= today)
    .sort((a, b) => (a.dayOfMonth ?? 1) - (b.dayOfMonth ?? 1)),
)
const upcomingTotal = computed(() =>
  upcoming.value.reduce((s, r) => s + Math.abs(Number(r.amount)), 0),
)

// Ways to save: the biggest discretionary (WANT) categories you spent on.
const kindByName = computed(() => {
  const m = {}
  for (const c of categories.items) m[c.name] = c.kind
  return m
})
const tips = computed(() =>
  (dashboard.data?.byCategory || [])
    .map((c) => ({
      name: c.categoryName,
      glyph: categoryGlyph(c.emoji),
      spent: Math.abs(Number(c.total)),
    }))
    .filter((c) => kindByName.value[c.name] === 'WANT' && c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3)
    .map((c) => ({ ...c, save: c.spent * 0.25 })),
)
const tipsTotal = computed(() => tips.value.reduce((s, t) => s + t.save, 0))
</script>

<template>
  <main class="save">
    <h1>Save</h1>

    <section>
      <div class="head">
        <h2 class="section-title">Upcoming</h2>
        <Money v-if="upcoming.length" class="total" :amount="-upcomingTotal" colour />
      </div>

      <div v-if="upcoming.length" class="list">
        <div v-for="r in upcoming" :key="r.id || r.name" class="row">
          <div class="meta">
            <span class="name">{{ r.name }}</span>
            <span class="when">due {{ ordinal(r.dayOfMonth || 1) }}</span>
          </div>
          <Money :amount="-Math.abs(Number(r.amount))" colour />
        </div>
      </div>
      <p v-else class="empty">Nothing left to pay this month. 🦕</p>
    </section>

    <section>
      <h2 class="section-title">Ways to save</h2>

      <template v-if="tips.length">
        <p class="lead">
          Trim a quarter off your biggest optional spends and you’d keep about
          <strong><Money :amount="tipsTotal" /></strong> this month.
        </p>
        <div class="list">
          <div v-for="t in tips" :key="t.name" class="tip">
            <span class="tip-cat">{{ t.glyph }} {{ t.name }}</span>
            <span class="tip-body">
              You’ve spent <Money :amount="t.spent" /> — skip ~25% to keep
              <strong><Money :amount="t.save" /></strong>.
            </span>
          </div>
        </div>
      </template>
      <p v-else class="empty">
        Import some transactions and your top optional spends will show up here.
      </p>
    </section>
  </main>
</template>

<style scoped>
.save {
  padding: var(--space-4) var(--space-4) var(--space-8);
}
h1 {
  font-size: 1.4rem;
  margin-bottom: var(--space-4);
}
section {
  margin-bottom: var(--space-8);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-3);
}
.total {
  font-variant-numeric: tabular-nums;
  font-weight: var(--weight-medium);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--c-border);
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
.lead {
  color: var(--c-text-muted);
  margin: 0 0 var(--space-4);
}
.lead strong {
  color: var(--c-good);
}
.tip {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--c-surface);
  border-radius: var(--radius);
  margin-bottom: var(--space-2);
}
.tip-cat {
  font-weight: 600;
}
.tip-body {
  font-size: var(--text-sm);
  color: var(--c-text-muted);
}
.tip-body strong {
  color: var(--c-good);
}
.empty {
  color: var(--c-text-muted);
}
</style>
