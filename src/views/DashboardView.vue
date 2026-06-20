<script setup>
import { onMounted, ref, computed } from 'vue'
import { useDashboardStore, today } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useTransactionsStore } from '@/stores/transactions'
import { useBudgetStore } from '@/stores/budget'
import Money from '@/components/atoms/Money.vue'
import DailyAllowanceHero from '@/components/molecules/DailyAllowanceHero.vue'
import CategoryBreakdown from '@/components/organisms/CategoryBreakdown.vue'
import TransactionList from '@/components/organisms/TransactionList.vue'

const store = useDashboardStore()
const auth = useAuthStore()
const categories = useCategoriesStore()
const txStore = useTransactionsStore()
const budget = useBudgetStore()

// The selected "Where it went" category filters the list below it.
const selected = ref(null) // { key, label, id }

// Opening the dashboard always resets to the current month.
onMounted(() => {
  store.load(today())
  categories.load()
  budget.load()
})

// --- month navigation ---
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const currentYm = today().slice(0, 7)
const viewYm = computed(() => store.viewDate.slice(0, 7))
const isCurrentMonth = computed(() => viewYm.value === currentYm)
const monthLabel = computed(() => {
  const [y, m] = store.viewDate.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
})

function stepMonth(delta) {
  const [y, m] = store.viewDate.split('-').map(Number)
  let ny = y
  let nm = m + delta
  if (nm < 1) { nm = 12; ny -= 1 }
  if (nm > 12) { nm = 1; ny += 1 }
  const ym = `${ny}-${String(nm).padStart(2, '0')}`
  clearCategory()
  if (ym >= currentYm) {
    store.load(today()) // never go into the future; the current month means today
  } else {
    const lastDay = new Date(ny, nm, 0).getDate() // full month -> month-to-date = whole month
    store.load(`${ym}-${String(lastDay).padStart(2, '0')}`)
  }
}

async function selectCategory(row) {
  if (selected.value?.key === row.key) return clearCategory()
  const cat = categories.items.find((c) => c.name === row.key)
  selected.value = { key: row.key, label: row.label, id: cat?.id ?? null }
  if (cat) await txStore.load({ category: cat.id, month: viewYm.value, size: 200 })
}

function clearCategory() {
  selected.value = null
}

const listTransactions = computed(() => {
  if (!selected.value) return store.data?.recentTransactions || []
  if (selected.value.id) return txStore.items
  // Fallback if the category id couldn't be resolved: filter the recent rows.
  return (store.data?.recentTransactions || []).filter(
    (t) => t.categoryName === selected.value.key,
  )
})

async function onChanged() {
  await store.load() // a reclassify can move the daily number
  if (selected.value?.id)
    await txStore.load({ category: selected.value.id, month: viewYm.value, size: 200 })
}
</script>

<template>
  <main class="dashboard">
    <header class="topbar">
      <span class="brand">Restje<span class="brand-jp">残り</span></span>
      <div class="actions">
        <RouterLink to="/search" class="icon-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </RouterLink>
        <button class="logout" @click="auth.logout">Log out</button>
      </div>
    </header>

    <template v-if="store.data">
      <div class="month-nav">
        <button class="mn-btn" aria-label="Previous month" @click="stepMonth(-1)">
          ‹
        </button>
        <span class="mn-label">{{ monthLabel }}</span>
        <button
          class="mn-btn"
          aria-label="Next month"
          :disabled="isCurrentMonth"
          @click="stepMonth(1)"
        >
          ›
        </button>
      </div>

      <template v-if="isCurrentMonth">
        <DailyAllowanceHero
          :today-remaining="store.data.todayRemaining"
          :daily-allowance="store.data.dailyAllowance"
          :today-spent="store.data.todaySpent"
        />
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Income</span>
            <Money
              class="stat-val"
              :amount="store.data.monthIncome || budget.monthlyIncome || 0"
            />
            <span class="stat-sub">this month</span>
          </div>
          <div class="stat">
            <span class="stat-label">Left this month</span>
            <Money class="stat-val" :amount="store.data.monthRemaining" colour />
            <span class="stat-sub">over {{ store.data.daysLeft }} days</span>
          </div>
        </div>
      </template>

      <section v-else class="month-summary">
        <p class="ms-label">Spent in {{ monthLabel }}</p>
        <p class="ms-amount"><Money :amount="store.data.monthSpent" /></p>
        <p class="ms-sub">
          of <Money :amount="store.data.discretionaryMonthly" /> budget ·
          <Money :amount="store.data.monthRemaining" colour /> left
        </p>
      </section>

      <CategoryBreakdown
        :categories="store.data.byCategory || []"
        :selected-key="selected?.key || null"
        @select="selectCategory"
      />
      <div class="recent-head">
        <h2 class="section-title">{{ selected ? selected.label : 'Recent' }}</h2>
        <button v-if="selected" class="clear" @click="clearCategory">
          Clear ✕
        </button>
      </div>
      <TransactionList :transactions="listTransactions" @changed="onChanged" />
    </template>

    <div v-else-if="store.loading" class="skeleton" aria-hidden="true">
      <div class="sk-hero">
        <div class="sk sk-num"></div>
        <div class="sk sk-line"></div>
        <div class="sk sk-bar"></div>
      </div>
      <div class="stats">
        <div class="sk sk-card"></div>
        <div class="sk sk-card"></div>
      </div>
      <div class="sk sk-row"></div>
      <div class="sk sk-row"></div>
      <div class="sk sk-row"></div>
    </div>

    <section v-else-if="store.error === 'NEEDS_IMPORT'" class="state setup">
      <p class="big">The cosmos is vast and indifferent.</p>
      <p class="muted">Your budget needn’t be. Import a bank export to begin.</p>
      <RouterLink to="/import" class="cta">Import a CSV</RouterLink>
    </section>

    <section v-else-if="store.error" class="state">
      <p>Couldn’t load your dashboard.</p>
      <button @click="store.load()">Retry</button>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
}
.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--c-text);
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
}
.brand-jp {
  font-size: var(--text-sm);
  color: var(--c-accent);
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  color: var(--c-text-muted);
}
.logout {
  background: none;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
}
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4) 0;
}
.mn-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}
.mn-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.mn-label {
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  min-width: 9rem;
  text-align: center;
}
.month-summary {
  text-align: center;
  padding: var(--space-8) var(--space-4) var(--space-6);
}
.ms-label {
  margin: 0;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
}
.ms-amount {
  margin: var(--space-2) 0 0;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ms-sub {
  margin: var(--space-2) 0 0;
  font-size: var(--text-sm);
  color: var(--c-text-muted);
}
.stats {
  display: flex;
  gap: var(--space-3);
  margin: 0 var(--space-4) var(--space-8);
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
  text-align: center;
}
.stat-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--c-text-muted);
}
.stat-val {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  font-variant-numeric: tabular-nums;
}
.stat-sub {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
}
.recent-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 var(--space-4);
  margin-bottom: var(--space-2);
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  margin: 0;
}
.clear {
  background: none;
  border: none;
  color: var(--c-accent);
  cursor: pointer;
  font-size: var(--text-sm);
}
.state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}
.state .big {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  margin: 0 0 var(--space-2);
}
.state .muted {
  color: var(--c-text-muted);
  font-size: 0.9rem;
}
.state button {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  cursor: pointer;
}
.state .cta {
  display: inline-block;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
}

/* Loading skeleton */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
.sk {
  background: var(--c-surface);
  border-radius: var(--radius-sm);
  animation: pulse 1.2s ease-in-out infinite;
}
.sk-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-12) 0 var(--space-8);
}
.sk-num {
  width: 11rem;
  height: 3.5rem;
}
.sk-line {
  width: 8rem;
  height: 1rem;
}
.sk-bar {
  width: 13rem;
  height: 6px;
  border-radius: 999px;
}
.sk-card {
  flex: 1;
  height: 4.5rem;
  border-radius: var(--radius);
}
.sk-row {
  height: 2.5rem;
  margin: var(--space-2) var(--space-4);
}
</style>
