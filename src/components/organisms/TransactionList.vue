<script setup>
import { onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useTransactionsStore } from '@/stores/transactions'
import { useToastStore } from '@/stores/toast'
import TransactionRow from '@/components/molecules/TransactionRow.vue'

defineProps({ transactions: { type: Array, required: true } })
// 'changed' lets the parent reload the dashboard after a reclassify, since a
// category change can move the daily number.
const emit = defineEmits(['changed'])

const categories = useCategoriesStore()
const txStore = useTransactionsStore()
const toast = useToastStore()

onMounted(() => categories.load())

async function onReclassify({ id, categoryId, previousCategoryId, merchant }) {
  try {
    await txStore.reclassify(id, categoryId)
    emit('changed')
    const opts = { ms: 6000 }
    if (previousCategoryId) {
      opts.action = {
        label: 'Undo',
        fn: async () => {
          try {
            await txStore.reclassify(id, previousCategoryId)
            emit('changed')
          } catch {
            toast.show('Couldn’t undo. Try again.')
          }
        },
      }
    }
    toast.show(`Recategorised ${merchant || 'transaction'}.`, opts)
  } catch {
    toast.show('Couldn’t recategorise. Try again.')
  }
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
