<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listTransactions } from '@/api/transactions'
import { useDashboardStore } from '@/stores/dashboard'
import TransactionList from '@/components/organisms/TransactionList.vue'

const router = useRouter()
const dashboard = useDashboardStore()

const q = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
let timer

function matches(t, term) {
  const hay = `${t.counterparty || ''} ${t.transactionType || ''} ${
    t.categoryName || ''
  } ${Math.abs(Number(t.amount))}`.toLowerCase()
  return hay.includes(term)
}

async function run() {
  const term = q.value.trim().toLowerCase()
  if (term.length < 2) {
    results.value = []
    searched.value = false
    return
  }
  loading.value = true
  try {
    // Pass `q` (used once the backend supports it) and also filter client-side
    // so it works today over the recent window.
    const { data } = await listTransactions({ q: q.value.trim(), size: 200 })
    const rows = data.content ?? data
    results.value = rows.filter((t) => matches(t, term))
  } catch {
    results.value = []
  } finally {
    loading.value = false
    searched.value = true
  }
}

watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(run, 250)
})

function onChanged() {
  run()
  dashboard.load()
}
</script>

<template>
  <main class="search">
    <div class="bar">
      <button class="back" aria-label="Back" @click="router.back()">‹</button>
      <input
        v-model="q"
        class="field"
        type="search"
        placeholder="Search payments…"
        autofocus
      />
    </div>

    <p v-if="loading" class="state">Searching…</p>
    <TransactionList
      v-else-if="results.length"
      :transactions="results"
      @changed="onChanged"
    />
    <p v-else-if="searched" class="state">No matches.</p>
    <p v-else class="state hint">Search by merchant, category, type or amount.</p>
  </main>
</template>

<style scoped>
.search {
  padding-bottom: var(--space-8);
}
.bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
}
.back {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}
.field {
  flex: 1;
  min-width: 0;
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
}
.state {
  text-align: center;
  color: var(--c-text-muted);
  padding: var(--space-6) var(--space-4);
}
</style>
