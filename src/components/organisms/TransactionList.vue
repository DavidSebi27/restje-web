<script setup>
import { onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useTransactionsStore } from '@/stores/transactions'
import TransactionRow from '@/components/molecules/TransactionRow.vue'

defineProps({ transactions: { type: Array, required: true } })
// 'changed' lets the parent reload the dashboard after a reclassify, since a
// category change can move the daily number.
const emit = defineEmits(['changed'])

const categories = useCategoriesStore()
const txStore = useTransactionsStore()

onMounted(() => categories.load())

async function onReclassify({ id, categoryId }) {
  await txStore.reclassify(id, categoryId)
  emit('changed')
}
</script>

<template>
  <div class="list">
    <TransactionRow
      v-for="t in transactions"
      :key="t.id"
      :transaction="t"
      :categories="categories.items"
      @reclassify="onReclassify"
    />
    <p v-if="!transactions.length" class="empty">No transactions yet.</p>
  </div>
</template>

<style scoped>
.list {
  padding: 0 var(--space-4);
}
.empty {
  color: var(--c-text-muted);
  text-align: center;
  padding: var(--space-6) 0;
}
</style>
