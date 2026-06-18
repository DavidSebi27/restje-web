<script setup>
import { onMounted, ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useTransactionsStore } from '@/stores/transactions'
import Money from '@/components/atoms/Money.vue'
import DailyAllowanceHero from '@/components/molecules/DailyAllowanceHero.vue'
import CategoryBreakdown from '@/components/organisms/CategoryBreakdown.vue'
import TransactionList from '@/components/organisms/TransactionList.vue'

const store = useDashboardStore()
const auth = useAuthStore()
const categories = useCategoriesStore()
const txStore = useTransactionsStore()

// The selected "Where it went" category filters the list below it.
const selected = ref(null) // { key, label, id }

// load() runs on every dashboard mount: open the app, see today's truth.
onMounted(() => {
  store.load()
  categories.load()
})

async function selectCategory(row) {
  if (selected.value?.key === row.key) return clearCategory()
  const cat = categories.items.find((c) => c.name === row.key)
  selected.value = { key: row.key, label: row.label, id: cat?.id ?? null }
  if (cat) await txStore.load({ category: cat.id, size: 200 })
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
  if (selected.value?.id) await txStore.load({ category: selected.value.id, size: 200 })
}
</script>

<template>
  <main class="dashboard">
    <header class="topbar">
      <span class="brand">Restje</span>
      <button class="logout" @click="auth.logout">Log out</button>
    </header>

    <template v-if="store.data">
      <DailyAllowanceHero
        :today-remaining="store.data.todayRemaining"
        :daily-allowance="store.data.dailyAllowance"
        :today-spent="store.data.todaySpent"
      />
      <div class="month-card">
        <Money class="m-amount" :amount="store.data.monthRemaining" colour />
        left this month over {{ store.data.daysLeft }} days
      </div>
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

    <p v-else-if="store.loading" class="state">Loading…</p>

    <section v-else-if="store.error === 'NEEDS_IMPORT'" class="state setup">
      <p>Let’s set up your budget.</p>
      <p class="muted">Import a bank export to get your first daily number.</p>
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
  font-weight: 700;
  color: var(--c-accent);
}
.logout {
  background: none;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
}
.month-card {
  margin: 0 var(--space-4) var(--space-8);
  padding: var(--space-3) var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
  text-align: center;
  color: var(--c-text-muted);
  font-size: var(--text-sm);
}
.month-card .m-amount {
  font-weight: var(--weight-medium);
  font-variant-numeric: tabular-nums;
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
  padding: var(--space-8) var(--space-4);
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
</style>
