<script setup>
import { onMounted, ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useCategoriesStore } from '@/stores/categories'
import { setCategoryClassification } from '@/api/categories'
import { categoryGlyph } from '@/utils/categoryEmoji'
import Money from '@/components/atoms/Money.vue'
import CategorySpendRow from '@/components/molecules/CategorySpendRow.vue'

const dashboard = useDashboardStore()
const categories = useCategoriesStore()

onMounted(() => {
  if (!dashboard.data) dashboard.load()
  categories.load()
})

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

// The Save tab is about this month; scope the expanded payments to it so the
// totals match the (this-month) category figures.
const month = computed(() =>
  (dashboard.data?.date || new Date().toISOString().slice(0, 10)).slice(0, 7),
)

// Classification is a per-user category field on the backend (NECESSITY/LUXURY),
// defaulting from the category kind. Overrides hold optimistic UI changes.
const overrides = ref({})
const catByName = computed(() => {
  const m = {}
  for (const c of categories.items) m[c.name] = c
  return m
})

function classOf(name) {
  if (overrides.value[name]) return overrides.value[name]
  const c = catByName.value[name]
  if (c?.classification) return String(c.classification).toLowerCase()
  return c?.kind === 'WANT' ? 'luxury' : 'necessity'
}

async function toggle(name) {
  const next = classOf(name) === 'luxury' ? 'necessity' : 'luxury'
  overrides.value[name] = next
  const c = catByName.value[name]
  if (c?.id) {
    try {
      await setCategoryClassification(c.id, next.toUpperCase())
    } catch {
      // backend may not have the endpoint yet; keep the optimistic value
    }
  }
}

const rows = computed(() =>
  (dashboard.data?.byCategory || [])
    .map((c) => ({
      name: c.categoryName,
      glyph: categoryGlyph(c.emoji),
      spent: Math.abs(Number(c.total)),
    }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent),
)

// Each category row reports how much of it counts as luxury (refined by any
// per-payment overrides once expanded). The header totals those up.
const contributions = ref({})
function onContribution(name, value) {
  contributions.value = { ...contributions.value, [name]: value }
}
const contributing = computed(() =>
  rows.value.filter((r) => (contributions.value[r.name] || 0) > 0.005),
)
const savings = computed(() =>
  rows.value.reduce((s, r) => s + (contributions.value[r.name] || 0), 0),
)
const luxuryNames = computed(() => {
  const names = contributing.value.map((r) => r.name)
  if (names.length <= 1) return names.join('')
  if (names.length === 2) return names.join(' and ')
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
})

// Pace for the rest of the month — straight from the dashboard figures.
const monthRemaining = computed(() => Number(dashboard.data?.monthRemaining ?? 0))
const daysLeft = computed(() => Number(dashboard.data?.daysLeft ?? 0))
const paceOver = computed(() => monthRemaining.value < 0)
const perDay = computed(() =>
  daysLeft.value > 0 ? monthRemaining.value / daysLeft.value : monthRemaining.value,
)
</script>

<template>
  <main class="save">
    <h1>Save</h1>

    <div v-if="dashboard.data" class="pace" :class="{ over: paceOver }">
      <template v-if="paceOver">
        Over budget this month by <strong>{{ eur(Math.abs(monthRemaining)) }}</strong>.
        Ease off to climb back.
      </template>
      <template v-else>
        On track — <strong>{{ eur(monthRemaining) }}</strong> left, about
        {{ eur(perDay) }}/day for the next {{ daysLeft }} days.
      </template>
    </div>

    <h2 class="section-title">Ways to save</h2>
    <p class="lead">Tap a tag to mark each spend as a necessity or a luxury.</p>

    <template v-if="rows.length">
      <div class="summary" :class="{ empty: !contributing.length }">
        <template v-if="contributing.length">
          Easing off <strong>{{ luxuryNames }}</strong> could free up
          <strong class="amt"><Money :amount="savings" /></strong> this month.
        </template>
        <template v-else>
          Tag some spends as luxuries to see what you could free up.
        </template>
      </div>

      <div class="cats">
        <CategorySpendRow
          v-for="r in rows"
          :key="r.name"
          :name="r.name"
          :glyph="r.glyph"
          :spent="r.spent"
          :category-id="catByName[r.name]?.id || null"
          :classification="classOf(r.name)"
          :month="month"
          @toggle-class="toggle(r.name)"
          @contribution="onContribution(r.name, $event)"
        />
      </div>
    </template>

    <p v-else class="empty-state">
      Import some transactions and your spending shows up here to triage.
    </p>
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
.pace {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius);
  background: var(--c-surface);
  border-left: 3px solid var(--c-good);
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  margin-bottom: var(--space-6);
}
.pace strong {
  color: var(--c-good);
  font-variant-numeric: tabular-nums;
}
.pace.over {
  border-left-color: var(--c-bad);
  background: var(--c-bad-soft);
}
.pace.over strong {
  color: var(--c-bad);
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-2);
}
.lead {
  color: var(--c-text-muted);
  font-size: var(--text-sm);
  margin: 0 0 var(--space-4);
}
.summary {
  padding: var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
  margin-bottom: var(--space-4);
  line-height: 1.5;
}
.summary strong {
  color: var(--c-text);
}
.summary .amt {
  color: var(--c-good);
}
.summary.empty {
  color: var(--c-text-muted);
  font-size: var(--text-sm);
}
.empty-state {
  color: var(--c-text-muted);
}
</style>
