<script setup>
import { onMounted, ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useCategoriesStore } from '@/stores/categories'
import { getCategoryTrends } from '@/api/insights'
import { categoryGlyph } from '@/utils/categoryEmoji'
import Money from '@/components/atoms/Money.vue'

const dashboard = useDashboardStore()
const categories = useCategoriesStore()
const trends = ref([])

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

onMounted(async () => {
  if (!dashboard.data) dashboard.load()
  categories.load()
  try {
    trends.value = (await getCategoryTrends()).data
  } catch {
    trends.value = [] // endpoint not live yet -> fall back to the simple heuristic
  }
})

// Preferred: discretionary categories where you're spending above your own
// usual. The overspend is the concrete "what you could not spend".
const trendTips = computed(() =>
  trends.value
    .filter((t) => t.kind === 'WANT')
    .map((t) => {
      const spent = Math.abs(Number(t.thisMonth))
      const avg = Math.abs(Number(t.monthlyAverage))
      return { name: t.categoryName, glyph: categoryGlyph(t.emoji), spent, avg }
    })
    .filter((t) => t.avg > 0 && t.spent - t.avg >= 1)
    .sort((a, b) => b.spent - b.avg - (a.spent - a.avg))
    .slice(0, 3)
    .map((t) => ({
      key: t.name,
      glyph: t.glyph,
      name: t.name,
      spent: t.spent,
      save: t.spent - t.avg,
      note: `${Math.round(((t.spent - t.avg) / t.avg) * 100)}% above your usual ${eur(t.avg)}`,
    })),
)

// Fallback (no history yet): biggest discretionary spends, trim a quarter.
const kindByName = computed(() => {
  const m = {}
  for (const c of categories.items) m[c.name] = c.kind
  return m
})
const fallbackTips = computed(() =>
  (dashboard.data?.byCategory || [])
    .map((c) => ({
      name: c.categoryName,
      glyph: categoryGlyph(c.emoji),
      spent: Math.abs(Number(c.total)),
    }))
    .filter((c) => kindByName.value[c.name] === 'WANT' && c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3)
    .map((c) => ({
      key: c.name,
      glyph: c.glyph,
      name: c.name,
      spent: c.spent,
      save: c.spent * 0.25,
      note: 'about a quarter of it',
    })),
)

const dataDriven = computed(() => trendTips.value.length > 0)
const tips = computed(() =>
  dataDriven.value ? trendTips.value : fallbackTips.value,
)
const tipsTotal = computed(() => tips.value.reduce((s, t) => s + t.save, 0))

// Pace for the rest of the month — purely from the dashboard figures.
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

    <template v-if="tips.length">
      <p class="lead">
        <template v-if="dataDriven">
          You’re running above your usual in a few places. Back to normal keeps
          about <strong><Money :amount="tipsTotal" /></strong> this month.
        </template>
        <template v-else>
          Trim your biggest optional spends and you’d keep about
          <strong><Money :amount="tipsTotal" /></strong> this month.
        </template>
      </p>

      <div class="list">
        <div v-for="t in tips" :key="t.key" class="tip">
          <span class="tip-cat">{{ t.glyph }} {{ t.name }}</span>
          <span class="tip-body">
            <Money :amount="t.spent" /> this month —
            <template v-if="dataDriven">
              {{ t.note }}. Back to usual keeps
              <strong><Money :amount="t.save" /></strong>.
            </template>
            <template v-else>
              skip {{ t.note }} to keep
              <strong><Money :amount="t.save" /></strong>.
            </template>
          </span>
        </div>
      </div>
    </template>

    <p v-else class="empty">
      Import some transactions and your top optional spends will show up here.
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
  margin: 0 0 var(--space-3);
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
