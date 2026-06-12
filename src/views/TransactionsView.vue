<script setup>
import { onMounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useDashboardStore } from '@/stores/dashboard'
import TransactionList from '@/components/organisms/TransactionList.vue'

const txStore = useTransactionsStore()
const dashboard = useDashboardStore()

onMounted(() => txStore.load())

function onChanged() {
  dashboard.load() // a reclassify can move today's number
}
</script>

<template>
  <main class="transactions">
    <h1>Transactions</h1>
    <p v-if="txStore.loading" class="state">Loading…</p>
    <TransactionList
      v-else
      :transactions="txStore.items"
      @changed="onChanged"
    />
  </main>
</template>

<style scoped>
.transactions {
  padding-bottom: var(--space-8);
}
h1 {
  font-size: 1.4rem;
  padding: var(--space-4) var(--space-4) 0;
}
.state {
  text-align: center;
  color: var(--c-text-muted);
  padding: var(--space-6);
}
</style>
